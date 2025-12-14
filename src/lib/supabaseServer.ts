import { createServerClient } from "@supabase/ssr";
import { cookies as nextCookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function createSupabaseServerClient() {
  const cookieStore = await nextCookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll().map(c => ({ name: c.name, value: c.value }));
      },
      setAll(cookies: { name: string; value: string }[]) {
        cookies.forEach(c => cookieStore.set(c));
      },
    },
  });
}
