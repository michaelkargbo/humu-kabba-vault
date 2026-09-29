/**
 * ==============================================================================
 * HUMU KABBA VARIETY VAULT - APPLICATION CONFIGURATION
 * ==============================================================================
 * Replace the placeholder values below with your real Supabase & Firebase credentials.
 * Once updated, push changes to GitHub and Vercel will deploy immediately.
 */

window.APP_CONFIG = {
  // Business Information (Official)
  BUSINESS: {
    name: "Humu Kabba Variety Vault",
    slogan: "Your Style, Our Priority.",
    tagline: "Check us now and get the value worth your money.",
    address: "4B Johnson Land, Aberdeen, Freetown, Sierra Leone (Back of the Field)",
    phoneDisplay: "+232 754 16008",
    whatsappNumber: "23275416008",
    whatsappLink: "https://wa.me/23275416008",
    hoursWeekday: "09:00 - 19:00",
    hoursSunday: "13:00 - 17:00",
    experienceYears: "7+",
    logoUrl: "assets/logo.jpg"
  },

  // 1. Supabase Project Configuration
  // Found in Supabase Dashboard -> Project Settings -> API
  SUPABASE: {
    url: "https://kumuvzthmqslfszgwjmq.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1bXV2enRobXFzbGZzemd3am1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MzQ3NTIsImV4cCI6MjEwNjIxMDc1Mn0.6xUKnFd5LtB0mG51_cvbwpK5Wj9UeUZb3dgq1Hm8Ab8"
  },

  // 2. Firebase Cloud Messaging (Web Push) Configuration
  // Found in Firebase Console -> Project Settings -> General -> Your apps -> Web app
  FIREBASE: {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_FIREBASE_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_FIREBASE_PROJECT_ID",
    storageBucket: "YOUR_FIREBASE_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
    appId: "YOUR_FIREBASE_APP_ID",
    vapidKey: "YOUR_FIREBASE_WEB_PUSH_VAPID_KEY" // Found in Project Settings -> Cloud Messaging -> Web Push certificates
  },

  // Helpers
  isSupabaseConfigured: function() {
    return this.SUPABASE.url && 
           this.SUPABASE.url !== "YOUR_SUPABASE_PROJECT_URL" &&
           this.SUPABASE.anonKey && 
           this.SUPABASE.anonKey !== "YOUR_SUPABASE_ANON_KEY";
  },

  isFirebaseConfigured: function() {
    return this.FIREBASE.apiKey && 
           this.FIREBASE.apiKey !== "YOUR_FIREBASE_API_KEY" &&
           this.FIREBASE.projectId && 
           this.FIREBASE.projectId !== "YOUR_FIREBASE_PROJECT_ID";
  }
};
