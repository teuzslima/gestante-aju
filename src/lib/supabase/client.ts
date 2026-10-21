import { createBrowserClient } from "@supabase/ssr";

// Cliente Supabase para componentes de navegador ("use client").
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
