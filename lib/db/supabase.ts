import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function createClerkSupabaseClient() {
  const { getToken } = await auth();
  
  const token = await getToken({
    template: 'supabase',
  });

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    },
  });
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// For client-side usage, create a hook instead
export function useSupabaseClient() {
  if (typeof window === 'undefined') {
    throw new Error('useSupabaseClient can only be used in browser');
  }
  
  // This will be used in React components with useAuth hook
  return createClient(supabaseUrl, supabaseAnonKey);
}
