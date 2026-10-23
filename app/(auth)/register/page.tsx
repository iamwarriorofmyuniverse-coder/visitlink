"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { School, Building2, UserPlus, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"coordinator" | "industry_manager">("coordinator");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            phone,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        setSuccessMsg(
          "Registration successful! Redirecting to your dashboard..."
        );
        setTimeout(() => {
          if (role === "coordinator") {
            router.push("/coordinator");
          } else {
            router.push("/industry");
          }
          router.refresh();
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-transparent dark:border-blue-800">
            <UserPlus className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Create your VisitLink Account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Select your organization role to get started.
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setRole("coordinator")}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition ${
              role === "coordinator"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <School className="h-4 w-4" />
            School / College
          </button>
          <button
            type="button"
            onClick={() => setRole("industry_manager")}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition ${
              role === "industry_manager"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <Building2 className="h-4 w-4" />
            Industry Facility
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/50 p-3 text-sm text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/50 p-3 text-sm text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {successMsg}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              placeholder={role === "coordinator" ? "Prof. A. Kumar" : "K. Murugesan (Plant Head)"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Official Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              placeholder={role === "coordinator" ? "coordinator@college.edu" : "manager@company.com"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Contact Phone Number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              placeholder="+91 98400 12345"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Password (min 8 chars)
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 transition"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
