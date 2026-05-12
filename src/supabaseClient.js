import { createClient } from '@supabase/supabase-js'

// Initialize connection variables from environment files (.env)
// used import.meta.env to keep sensitive keys out of the source code.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create the Supabase client
// This object allows the rest of the app to interact with the database.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)