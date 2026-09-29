import { useTheme, type ThemeMode } from "@/shared/hooks/useTheme";
import { MonitorIcon, MoonIcon, SunIcon } from "./icons";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options: { mode: ThemeMode; label: string; icon: typeof SunIcon }[] = [
    { mode: "light", label: "Claro", icon: SunIcon },
    { mode: "dark", label: "Oscuro", icon: MoonIcon },
    { mode: "auto", label: "Sistema", icon: MonitorIcon },
  ];

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
      {options.map(({ mode, label, icon: Icon }) => {
        const isActive = theme === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => setTheme(mode)}
            title={`Tema ${label}`}
            aria-label={`Cambiar a tema ${label}`}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              isActive
                ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
