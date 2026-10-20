import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const fallbackUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-visitlink.supabase.co";
const fallbackAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIn0.placeholder";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    fallbackUrl,
    fallbackAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
}

export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || fallbackAnonKey;
  return createServerClient(
    fallbackUrl,
    serviceKey,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    }
  );
}
