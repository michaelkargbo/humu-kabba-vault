'use client'
import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kumuvzthmqslfszgwjmq.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1bXV2enRobXFzbGZzemd3am1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MzQ3NTIsImV4cCI6MjEwNjIxMDc1Mn0.6xUKnFd5LtB0mG51_cvbwpK5Wj9UeUZb3dgq1Hm8Ab8'

export function createClient() {
  return createBrowserClient<any>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  )
}
