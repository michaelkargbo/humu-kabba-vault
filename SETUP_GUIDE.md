# Setup Guide — Humu Kabba Variety Vault Website

**For non-developers. Follow these steps one at a time.**

---

## Step 1 — Create your Supabase project (free tier is fine)

1. Go to **[supabase.com](https://supabase.com)** and click **Start your project**.
2. Sign in with GitHub or email, then click **New project**.
3. Give it a name like `humu-kabba-vault`, pick the closest region (e.g. **Europe West**), choose a strong database password, and click **Create new project**.
4. Wait about 60 seconds for it to provision.

---

## Step 2 — Run the database setup SQL

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open the file **`supabase-setup.sql`** from your website folder, copy its entire contents, and paste into the SQL editor.
4. Click **Run** (or press `Ctrl + Enter`).  
   You should see: *"Success. No rows returned."*

---

## Step 3 — Create the owner account (sign-up is disabled for the public)

1. In your Supabase dashboard, click **Authentication → Users** in the left sidebar.
2. Click **Invite user** (or **Add user**).
3. Enter the email address and password the business owner will use to log in to the Owner panel.
4. Click **Create user** or **Send invite**.
5. Copy the new user's **User UID** (it looks like `abc123de-...`).
6. Go back to **SQL Editor → New query** and run this, replacing the email with the owner's real email:

   ```sql
   INSERT INTO public.admins (user_id)
   SELECT id FROM auth.users WHERE email = 'owner@example.com'
   ON CONFLICT DO NOTHING;
   ```

7. Click **Run**. The owner account is now authorised to manage products and reviews.

---

## Step 4 — Get your Supabase keys

1. In your Supabase dashboard, click **Project Settings** (gear icon) → **API**.
2. Copy two values:
   - **Project URL** (e.g. `https://xyzcompany.supabase.co`)
   - **anon public key** (the long key under **Project API keys**)
3. Open **`config.js`** in your website folder.
4. Replace the placeholders:

   ```js
   SUPABASE: {
     url: "https://xyzcompany.supabase.co",    ← paste Project URL here
     anonKey: "eyJhbGciOi..."                  ← paste anon key here
   },
   ```

5. Save the file.

> ⚠️ **Never paste the `service_role` key into config.js.** Only the `anon` key goes there.

---

## Step 5 — Disable public sign-ups in Supabase

1. In your Supabase dashboard, click **Authentication → Providers → Email**.
2. Turn off **Enable email confirmations** (optional — avoids needing the owner to click a confirmation link).
3. Click **Authentication → Settings**.
4. Turn **off** the **"Enable sign ups"** toggle — this prevents strangers from creating accounts.
5. Click **Save**.

---

## Step 6 — Create your Firebase project (for WhatsApp order push notifications)

> **Skip this step** if you do not want push notifications on your phone when a customer taps "Order on WhatsApp".

1. Go to **[console.firebase.google.com](https://console.firebase.google.com)** and click **Add project**.
2. Name it `humu-kabba-vault`, disable Google Analytics if you prefer, and click **Create project**.
3. Click the **web** icon (`</>`) to add a web app. Name it `HK Vault Web`, enable **Firebase Hosting** (optional), and click **Register app**.
4. Firebase shows you a `firebaseConfig` object. Copy all of it.
5. Open **`config.js`** and fill in the Firebase section:

   ```js
   FIREBASE: {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "...",
     vapidKey: "..."  ← see below
   },
   ```

6. **To get the VAPID key**: In Firebase Console → Your project → **Project Settings** → **Cloud Messaging** tab → scroll to **Web configuration** → click **Generate key pair**. Copy the key and paste as `vapidKey`.

7. **To get the service account JSON** (for push notifications from the server):
   - In Firebase Console → **Project Settings** → **Service Accounts** tab.
   - Click **Generate new private key** and download the JSON file.
   - Open your **Supabase dashboard → Edge Functions → Secrets**.
   - Add a new secret named `FIREBASE_SERVICE_ACCOUNT`.
   - Paste the entire content of the JSON file as the value.

8. **Update `firebase-messaging-sw.js`** with the same Firebase config keys:

   ```js
   const firebaseConfig = {
     apiKey: "...",
     projectId: "...",
     messagingSenderId: "...",
     appId: "..."
   };
   ```

---

## Step 7 — Deploy the Supabase Edge Function

> **Skip this step** if you are not using push notifications.

1. Install the Supabase CLI if not already installed:  
   - Windows: `winget install Supabase.CLI` (or download from [supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli))

2. Open your project folder in a terminal (PowerShell) and log in:
   ```powershell
   supabase login
   supabase link --project-ref YOUR_SUPABASE_PROJECT_REF
   ```
   (Project ref is found in Supabase → Settings → General → Reference ID)

3. Deploy the function:
   ```powershell
   supabase functions deploy send-order-push
   ```

4. **Create the Database Webhook**:
   - In Supabase dashboard → **Database → Webhooks**.
   - Click **Create a new hook**.
   - Name: `notify-new-order`
   - Table: `orders`
   - Events: `INSERT`
   - URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-order-push`
   - Add header: `Authorization: Bearer YOUR_SUPABASE_ANON_KEY`
   - Click **Confirm**.

---

## Step 8 — Push changes to GitHub and Vercel

After filling in `config.js`, save the file and run these commands in PowerShell from your website folder:

```powershell
git add .
git commit -m "Configure Supabase and Firebase credentials"
git push origin main
```

Vercel automatically deploys within 30–60 seconds. Your live site at  
**`https://humu-kabba-vault.vercel.app`** will have all features active.

---

## Quick Checklist

| Step | Done? |
|------|-------|
| Supabase project created | ☐ |
| SQL schema executed | ☐ |
| Owner user created and added to `admins` | ☐ |
| Supabase URL and anon key pasted in `config.js` | ☐ |
| Public sign-ups disabled | ☐ |
| Firebase project created (optional) | ☐ |
| Firebase keys pasted in `config.js` and `firebase-messaging-sw.js` | ☐ |
| Edge Function deployed and webhook created (optional) | ☐ |
| Changes pushed to GitHub | ☐ |
| Live site tested | ☐ |

---

**Questions?** You can always ask for help by messaging the developer.
