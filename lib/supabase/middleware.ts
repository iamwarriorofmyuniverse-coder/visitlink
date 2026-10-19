import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Protected route prefixes
  const isCoordinatorRoute = path.startsWith("/coordinator");
  const isIndustryRoute = path.startsWith("/industry");
  const isAdminRoute = path.startsWith("/admin");
  const isAuthRoute = path.startsWith("/login") || path.startsWith("/register");

  if (!user && (isCoordinatorRoute || isIndustryRoute || isAdminRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  // If user is authenticated, query role to enforce RBAC
  if (user && (isCoordinatorRoute || isIndustryRoute || isAdminRoute || isAuthRoute)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;

    if (isAuthRoute && role) {
      // Redirect already logged in user to their dashboard
      const dest =
        role === "coordinator"
          ? "/coordinator"
          : role === "industry_manager"
          ? "/industry"
          : "/admin";
      return NextResponse.redirect(new URL(dest, request.url));
    }

    if (isCoordinatorRoute && role !== "coordinator" && role !== "admin") {
      return NextResponse.redirect(new URL("/industry", request.url));
    }

    if (isIndustryRoute && role !== "industry_manager" && role !== "admin") {
      return NextResponse.redirect(new URL("/coordinator", request.url));
    }

    if (isAdminRoute && role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return supabaseResponse;
}
