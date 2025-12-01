import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Prevent app from crashing during build on Vercel if env is missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠ Missing Supabase environment variables")
}

// Always export a usable client (as long as env exists at runtime)
export const supabase = createClient(
  supabaseUrl || "",
  supabaseAnonKey || ""
)
