import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Compass, Building2, School, ShieldCheck, LogIn, Utensils } from "lucide-react";
import { ThemeProvider, themeInitScript } from "@/components/theme/ThemeProvider";
import ThemeToggle from "@/components/theme/ThemeToggle";

export const metadata: Metadata = {
  title: "VisitLink | Industrial Visit Coordination & Intelligence Platform",
  description:
    "Connecting manufacturing plants, labs, and tech parks with schools and colleges for experiential learning visits within Coimbatore and beyond.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex flex-col min-h-screen antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
        <ThemeProvider>
          <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 transition-colors">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-sm">
                  VL
                </div>
                <div>
                  <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Visit<span className="text-blue-600 dark:text-blue-400">Link</span>
                  </span>
                  <span className="ml-2 inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-400/20">
                    Coimbatore
                  </span>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
                <Link
                  href="/coordinator/explore"
                  className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Compass className="h-4 w-4" />
                  Find Industries
                </Link>
                <Link
                  href="/portal?tab=coordinator"
                  className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <School className="h-4 w-4" />
                  Schools &amp; Colleges
                </Link>
                <Link
                  href="/portal?tab=industry"
                  className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Building2 className="h-4 w-4" />
                  Industry Portal
                </Link>
                <Link
                  href="/portal?tab=logistics"
                  className="flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 text-emerald-700 dark:text-emerald-400 font-semibold transition-colors"
                >
                  <Utensils className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Visit Logistics
                </Link>
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin
                </Link>
              </nav>

              <div className="flex items-center gap-2.5">
                {/* Dark / Light Theme Toggle Button */}
                <ThemeToggle />

                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition"
                >
                  Register
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 text-sm text-slate-500 dark:text-slate-400 transition-colors">
            <div className="container mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <p>
                &copy; {new Date().getFullYear()} VisitLink Platform. All rights reserved. Industrial Visit Coordination Layer.
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-slate-400 dark:text-slate-500">
                <span>Safety &amp; Compliance First</span>
                <span>Parental Minor Consent Protected</span>
                <a
                  href="https://www.openstreetmap.org/copyright"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  &copy; OpenStreetMap contributors
                </a>
                <a
                  href="https://openrouteservice.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  Routing: OpenRouteService
                </a>
                <a
                  href="https://open-meteo.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  Weather: Open-Meteo.com (CC BY 4.0)
                </a>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
