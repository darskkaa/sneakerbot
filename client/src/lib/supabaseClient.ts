import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase environment variables are required. Please set VITE_SUPABASE_URL and VITE_SUPABASE_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
