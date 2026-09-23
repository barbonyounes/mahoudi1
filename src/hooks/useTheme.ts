import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "night";

export const THEME_ORDER: ThemeMode[] = ["light", "dark", "night"];

export const THEME_LABEL: Record<ThemeMode, string> = {
  light: "الوضع الفاتح",
  dark: "الوضع الداكن",
  night: "الوضع الليلي",
};

const STORAGE_KEY = "lesson-theme";

function apply(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.remove("dark", "night");
  if (mode !== "light") root.classList.add(mode);
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>("light");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (stored && THEME_ORDER.includes(stored)) {
      setThemeState(stored);
      apply(stored);
    }
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    apply(mode);
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = THEME_ORDER[(THEME_ORDER.indexOf(prev) + 1) % THEME_ORDER.length]!;
      apply(next);
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { theme, setTheme, cycleTheme };
}
