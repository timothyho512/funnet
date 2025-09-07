/**
 * Supabase client configuration for Next.js App Router
 *
 * Purpose: Provide both server and client Supabase instances
 * Dependencies: @supabase/supabase-js, @supabase/ssr
 * Usage: Use createServerClient for Server Components/Actions, createBrowserClient for Client Components
 * Security: Server client handles auth cookies, browser client for interactions
 */

import { createBrowserClient, createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Browser client for Client Components
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Server client for Server Components, Server Actions, Route Handlers
export async function createServerSupabaseClient() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: Array<{ name: string; value: string; options?: object }>
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

// Type-safe database interface (we'll generate this after creating schema)
export interface Database {
  // TODO: Generate types from schema
}
