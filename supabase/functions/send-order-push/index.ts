// ==============================================================================
// SUPABASE EDGE FUNCTION: send-order-push
// Dispatches Firebase Cloud Messaging (HTTP v1) push notifications to the owner
// Triggered by Database Webhook on public.orders INSERT
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// Helper to construct JWT and fetch Google OAuth2 Access Token for FCM v1
async function getGoogleAccessToken(serviceAccount: {
  client_email: string;
  private_key: string;
}): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const base64UrlEncode = (str: string) =>
    btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedClaim = base64UrlEncode(JSON.stringify(claim));
  const stringToSign = `${encodedHeader}.${encodedClaim}`;

  // Clean and import private key
  const pem = serviceAccount.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  
  const binaryDer = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer.buffer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(stringToSign)
  );

  const base64Signature = base64UrlEncode(
    String.fromCharCode(...new Uint8Array(signature))
  );

  const jwt = `${stringToSign}.${base64Signature}`;

  // Exchange JWT for OAuth2 token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(`Failed to obtain Google access token: ${JSON.stringify(tokenData)}`);
  }
  return tokenData.access_token;
}

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const serviceAccountJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");

    if (!serviceAccountJson) {
      return new Response(
        JSON.stringify({ error: "Missing FIREBASE_SERVICE_ACCOUNT secret in Supabase" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const serviceAccount = JSON.parse(serviceAccountJson);
    const projectId = serviceAccount.project_id;

    // Webhook payload from Supabase
    const payload = await req.json();
    const record = payload.record;

    if (!record || !record.product_name) {
      return new Response(JSON.stringify({ message: "No product order details in payload" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const productName = record.product_name;
    const customerName = record.customer_name || "A customer";

    // Initialize Supabase Admin client
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Fetch registered push tokens
    const { data: tokens, error: tokensError } = await supabase
      .from("push_tokens")
      .select("token, user_id");

    if (tokensError || !tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ message: "No active push tokens registered" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get FCM access token
    const accessToken = await getGoogleAccessToken(serviceAccount);

    // Send notifications to all active admin tokens
    const results = await Promise.all(
      tokens.map(async ({ token }) => {
        const fcmUrl = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
        const fcmBody = {
          message: {
            token: token,
            notification: {
              title: "New WhatsApp Order Started!",
              body: `New order started: ${productName} by ${customerName}`,
            },
            webpush: {
              fcm_options: {
                link: "https://humu-kabba-vault.vercel.app/#admin",
              },
            },
            data: {
              orderId: record.id || "",
              productName: productName,
            },
          },
        };

        const res = await fetch(fcmUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(fcmBody),
        });

        const resData = await res.json();

        // If token is invalid or unregistered, clean it up
        if (!res.ok && resData.error?.status === "NOT_FOUND" || resData.error?.details?.[0]?.errorCode === "UNREGISTERED") {
          await supabase.from("push_tokens").delete().eq("token", token);
        }

        return { token, status: res.status, resData };
      })
    );

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
