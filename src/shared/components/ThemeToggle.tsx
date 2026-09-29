import { useTheme } from "@/shared/hooks/useTheme";
import { MoonIcon, SunIcon } from "./icons";

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      title={isDark ? "Tema claro" : "Tema oscuro"}
      className="hover:bg-secondary text-foreground relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full transition-colors"
    >
      <SunIcon
        className={`absolute h-4 w-4 transition-all duration-500 ease-out ${
          isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
        }`}
      />
      <MoonIcon
        className={`absolute h-4 w-4 transition-all duration-500 ease-out ${
          isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
        }`}
      />
    </button>
  );
}
