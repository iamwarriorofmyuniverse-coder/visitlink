"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogIn, AlertCircle, Sparkles, Building2, School, ShieldCheck } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  function routeUser(role: string) {
    if (redirectPath !== "/" && redirectPath !== "/login") {
      router.push(redirectPath);
    } else if (role === "coordinator") {
      router.push("/coordinator");
    } else if (role === "industry_manager") {
      router.push("/industry");
    } else if (role === "admin") {
      router.push("/admin");
    } else {
      router.push("/coordinator/explore");
    }
    router.refresh();
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        // Query profile role to route user properly
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        const role = profile?.role || "coordinator";
        routeUser(role);
      }
    } catch (err: any) {
      // Graceful offline fallback: if local Supabase container is stopped
      if (
        err?.message?.includes("Failed to fetch") ||
        err?.message?.includes("NetworkError") ||
        err?.message?.includes("fetch") ||
        err?.status === 0
      ) {
        const inferredRole =
          email.includes("industry") || email.includes("manager")
            ? "industry_manager"
            : email.includes("admin")
            ? "admin"
            : "coordinator";

        document.cookie = `vl_demo_role=${inferredRole}; path=/; max-age=86400; SameSite=Lax`;
        routeUser(inferredRole);
        return;
      }

      setErrorMsg(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  }

  // 1-Click Instant Demo Login Handler
  function handleOneClickDemo(role: "coordinator" | "industry_manager" | "admin") {
    setLoading(true);
    document.cookie = `vl_demo_role=${role}; path=/; max-age=86400; SameSite=Lax`;
    routeUser(role);
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <LogIn className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
            Sign in to VisitLink
          </h2>
          <p className="mt-1 text-center text-xs text-slate-500">
            Coimbatore Industrial Visit Coordination & Matching Platform
          </p>
        </div>

        {/* 1-Click Instant Demo Mode Box */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            1-Click Instant Demo Login
          </div>
          <p className="text-xs text-blue-700 mb-3">
            Explore and test full flows immediately without waiting for a local database container:
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleOneClickDemo("coordinator")}
              className="flex flex-col items-center justify-center gap-1 rounded-lg border border-blue-200 bg-white py-2 px-1 font-semibold text-slate-800 hover:bg-blue-600 hover:text-white transition shadow-sm"
            >
              <School className="h-4 w-4 text-blue-600" />
              <span>Coordinator</span>
            </button>
            <button
              type="button"
              onClick={() => handleOneClickDemo("industry_manager")}
              className="flex flex-col items-center justify-center gap-1 rounded-lg border border-blue-200 bg-white py-2 px-1 font-semibold text-slate-800 hover:bg-blue-600 hover:text-white transition shadow-sm"
            >
              <Building2 className="h-4 w-4 text-blue-600" />
              <span>Industry Host</span>
            </button>
            <button
              type="button"
              onClick={() => handleOneClickDemo("admin")}
              className="flex flex-col items-center justify-center gap-1 rounded-lg border border-blue-200 bg-white py-2 px-1 font-semibold text-slate-800 hover:bg-blue-600 hover:text-white transition shadow-sm"
            >
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span>Platform Admin</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                placeholder="coordinator@visitlink.local"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 transition"
            >
              {loading ? "Signing in..." : "Sign In with Credentials"}
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Want to browse without logging in?{" "}
          <Link
            href="/coordinator/explore"
            className="font-semibold text-blue-600 hover:text-blue-500"
          >
            Explore Coimbatore Facilities & Map
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">Loading Login...</div>}>
      <LoginForm />
    </Suspense>
  );
}
