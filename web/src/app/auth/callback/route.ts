import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code"); const origin = request.nextUrl.origin; const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const recovery = request.nextUrl.searchParams.get("next") === "/auth/reset-password";
  const failure = `${origin}/auth/forgot-password?error=invalid-link`;
  if (!code || !url || !key) return NextResponse.redirect(recovery ? failure : `${origin}/auth/login?error=invalid-link`);
  const response = NextResponse.redirect(`${origin}${recovery ? "/auth/reset-password" : "/dashboard"}`);
  const supabase = createServerClient(url, key, { cookies: { getAll: () => request.cookies.getAll(), setAll: (items) => items.forEach(({ name, value, options }) => response.cookies.set(name, value, options)) } });
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    response.headers.set("location", recovery ? failure : `${origin}/auth/login?error=invalid-link`);
  }
  return response;
}
