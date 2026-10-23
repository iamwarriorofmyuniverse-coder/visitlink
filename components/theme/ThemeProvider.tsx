"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "vl_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored === "light" || stored === "dark" || stored === "system") {
        setThemeState(stored);
      } else {
        setThemeState("system");
      }
    } catch {
      setThemeState("system");
    }
    setMounted(true);
  }, []);

  // Update DOM and resolved theme when theme or system preferences change
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function applyTheme() {
      let resolved: ResolvedTheme = "light";
      if (theme === "system") {
        resolved = mediaQuery.matches ? "dark" : "light";
      } else {
        resolved = theme;
      }

      setResolvedTheme(resolved);

      const root = document.documentElement;
      if (resolved === "dark") {
        root.classList.add("dark");
        root.style.colorScheme = "dark";
      } else {
        root.classList.remove("dark");
        root.style.colorScheme = "light";
      }
    }

    applyTheme();

    const handler = () => {
      if (theme === "system") {
        applyTheme();
      }
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // Ignore localStorage errors (e.g. private browsing)
    }
  };

  const toggleTheme = () => {
    if (resolvedTheme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

/**
 * Script injected into <head> to prevent Flash of Unstyled Content (FOUC).
 * Runs synchronously before React hydrates.
 */
export const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('vl_theme');
    var isDark = false;
    if (stored === 'dark') {
      isDark = true;
    } else if (stored === 'light') {
      isDark = false;
    } else {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  } catch (e) {}
})();
`;
