import { createClient } from '@supabase/supabase-js';

// Use process.env variables (populated from .env.local) with hardcoded fallbacks for the demo environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vgpumykbihcvuvzxwcue.supabase.co';
// Note: This key provided is 'sb_publishable...' which acts as the anon key for this specific setup
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_b6ClWfeZcvI2thRPxGIF6g_Ptkmv7Dx';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);