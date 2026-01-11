import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client during build time
    if (typeof window === 'undefined') {
      return {
        auth: {
          signInWithOtp: async () => ({ error: null }),
          signOut: async () => ({ error: null }),
          getUser: async () => ({ data: { user: null }, error: null }),
        },
        from: () => ({
          select: () => ({ data: null, error: null }),
          insert: () => ({ data: null, error: null }),
          upsert: () => ({ data: null, error: null }),
          delete: () => ({ eq: () => ({ data: null, error: null }) }),
        }),
      } as unknown as SupabaseClient;
    }
    throw new Error('Supabase URL and Anon Key are required.');
  }

  client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return client;
}
