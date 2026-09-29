import { useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "auto";

const THEME_STORAGE_KEY = "pld_theme_preference";

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    return saved ?? "auto";
  });
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const dark = theme === "dark" || (theme === "auto" && mediaQuery.matches);
      root.classList.toggle("dark", dark);
      setIsDark(dark);
    };

    applyTheme();

    if (theme === "auto") {
      mediaQuery.addEventListener("change", applyTheme);
      return () => mediaQuery.removeEventListener("change", applyTheme);
    }
  }, [theme]);

  // El botón único (sin opción de "sistema" visible) solo alterna entre
  // claro/oscuro a partir de lo que esté resuelto en pantalla en ese momento.
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return { theme, setTheme, isDark, toggleTheme };
}
