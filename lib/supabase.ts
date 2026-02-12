import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const createSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
};

declare global {
  var supabaseGlobal: ReturnType<typeof createSupabaseClient> | undefined;
}

export const supabase = global.supabaseGlobal || createSupabaseClient();

if (process.env.NODE_ENV !== 'production') {
  global.supabaseGlobal = supabase;
}