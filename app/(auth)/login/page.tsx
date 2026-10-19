"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogIn, AlertCircle, ArrowRight } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

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

      if (data.user) {
        // Query profile role to route user properly
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        const role = profile?.role;
        if (redirectPath !== "/") {
          router.push(redirectPath);
        } else if (role === "coordinator") {
          router.push("/coordinator");
        } else if (role === "industry_manager") {
          router.push("/industry");
        } else if (role === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  }

  // Quick Demo Login Handler
  async function handleQuickDemoLogin(demoRole: "coordinator" | "manager" | "admin") {
    const demoCredentials = {
      coordinator: { email: "coordinator@visitlink.local", password: "DemoPassword123!" },
      manager: { email: "manager@visitlink.local", password: "DemoPassword123!" },
      admin: { email: "admin@visitlink.local", password: "DemoPassword123!" },
    };

    setEmail(demoCredentials[demoRole].email);
    setPassword(demoCredentials[demoRole].password);
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <LogIn className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
            Sign in to VisitLink
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Coordinate industrial visits, manage capacity, and track compliance.
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
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
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                placeholder="prof.name@college.edu"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
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
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
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
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </form>

        {/* Quick Seed Demo Buttons */}
        <div className="border-t border-slate-100 pt-6">
          <p className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Quick Fill Demo Accounts (Coimbatore)
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("coordinator")}
              className="rounded-lg border border-slate-200 py-1.5 px-2 font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
            >
              Coordinator
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("manager")}
              className="rounded-lg border border-slate-200 py-1.5 px-2 font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
            >
              Industry
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("admin")}
              className="rounded-lg border border-slate-200 py-1.5 px-2 font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
            >
              Admin
            </button>
          </div>
        </div>

        <div className="text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-blue-600 hover:text-blue-500"
          >
            Create an account
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
