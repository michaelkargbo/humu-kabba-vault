import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "https://kumuvzthmqslfszgwjmq.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1bXV2enRobXFzbGZzemd3am1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MzQ3NTIsImV4cCI6MjEwNjIxMDc1Mn0.6xUKnFd5LtB0mG51_cvbwpK5Wj9UeUZb3dgq1Hm8Ab8",
    NEXT_PUBLIC_WA_NUMBER: "23277416008",
    NEXT_PUBLIC_SITE_URL: "https://humu-kabba-vault.vercel.app",
  },
};

export default nextConfig;
