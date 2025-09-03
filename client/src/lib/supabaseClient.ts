import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase environment variables are not set. Please create a .env file with:');
  console.warn('VITE_SUPABASE_URL=your_supabase_url_here');
  console.warn('VITE_SUPABASE_KEY=your_supabase_anon_key_here');
  
  // Create a mock client for development
  if (import.meta.env.MODE === 'development') {
    console.warn('Using mock Supabase client for development');
    const supabase = {
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: { message: 'Mock client - no database connection' } }),
        update: () => Promise.resolve({ data: null, error: { message: 'Mock client - no database connection' } }),
        delete: () => Promise.resolve({ data: null, error: { message: 'Mock client - no database connection' } }),
      }),
      auth: {
        signIn: () => Promise.resolve({ data: null, error: { message: 'Mock client - no database connection' } }),
        signUp: () => Promise.resolve({ data: null, error: { message: 'Mock client - no database connection' } }),
        signOut: () => Promise.resolve({ data: null, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      },
    } as any;
  } else {
    throw new Error('Supabase environment variables are required in production. Please set VITE_SUPABASE_URL and VITE_SUPABASE_KEY.');
  }
} else {
  const supabase = createClient(supabaseUrl, supabaseKey);
}

export { supabase };
