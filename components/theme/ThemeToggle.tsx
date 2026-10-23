"use client";

import { useState, useRef, useEffect } from "react";
import { Sun, Moon, Laptop, Check } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!mounted) {
    // Render placeholder with same dimensions to avoid layout shift during SSR
    return (
      <div className="h-9 w-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50" />
    );
  }

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        id="theme-toggle-btn"
        aria-label={`Toggle theme (currently ${resolvedTheme})`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition"
      >
        {resolvedTheme === "dark" ? (
          <Moon className="h-4 w-4 text-blue-400 transition-transform duration-200 rotate-0" />
        ) : (
          <Sun className="h-4 w-4 text-amber-500 transition-transform duration-200 rotate-0" />
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-36 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-lg backdrop-blur-sm z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setTheme("light");
              setIsOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
              theme === "light"
                ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <Sun className="h-3.5 w-3.5 text-amber-500" />
              <span>Light</span>
            </div>
            {theme === "light" && <Check className="h-3 w-3 text-blue-600 dark:text-blue-400" />}
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setTheme("dark");
              setIsOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
              theme === "dark"
                ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <Moon className="h-3.5 w-3.5 text-blue-400" />
              <span>Dark</span>
            </div>
            {theme === "dark" && <Check className="h-3 w-3 text-blue-600 dark:text-blue-400" />}
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setTheme("system");
              setIsOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
              theme === "system"
                ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <Laptop className="h-3.5 w-3.5 text-slate-500" />
              <span>System</span>
            </div>
            {theme === "system" && <Check className="h-3 w-3 text-blue-600 dark:text-blue-400" />}
          </button>
        </div>
      )}
    </div>
  );
}
