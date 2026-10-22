import type { ReactNode } from "react";
import { MenuIcon, X } from "lucide-react";
import { ThemeToggle } from "@/shared/components/molecules/ThemeToggle";

export interface HeaderProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onToggleMobile?: () => void;
  nombreUsuario?: string;
  nombreEmpresa?: string;
  inicialUsuario?: string;
  acciones?: ReactNode;
}

export function Header({
  collapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onToggleMobile,
  nombreUsuario = "Usuario",
  nombreEmpresa = "",
  inicialUsuario = "U",
  acciones,
}: HeaderProps) {
  return (
    <header className="bg-card/95 backdrop-blur-sm border-border flex h-16 shrink-0 items-center justify-between border-b px-4 z-30 sticky top-0 transition-colors">
      <div className="flex items-center gap-3">
        {/* Botón Desktop para colapsar/expandir */}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expandir menú lateral" : "Colapsar menú lateral"}
          className="hidden md:inline-flex hover:bg-secondary text-foreground rounded-lg p-2 transition-colors cursor-pointer"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        {/* Botón Móvil Hamburguesa / Drawer */}
        <button
          type="button"
          onClick={onToggleMobile}
          aria-label={isMobileOpen ? "Cerrar menú lateral" : "Abrir menú lateral"}
          className="md:hidden inline-flex hover:bg-secondary text-foreground rounded-lg p-2 transition-colors cursor-pointer"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>

        {/* Identidad de marca */}
        <div className="flex items-center gap-2.5">
          <span className="from-primary to-emerald-600 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-bold text-white shadow-sm shadow-primary/20 ring-1 ring-white/10">
            SC
          </span>
          <div className="flex flex-col">
            <span className="text-foreground truncate text-sm font-bold tracking-tight">
              SICANET SC
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
              Prevención PLD/FT
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {acciones}
        <ThemeToggle />

        {/* Perfil de usuario */}
        <div
          title={nombreEmpresa ? `Perfil · ${nombreEmpresa}` : "Perfil"}
          className="hover:bg-secondary/70 text-foreground flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors cursor-default"
        >
          <span className="from-primary to-emerald-500 flex size-8.5 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white shrink-0 shadow-sm shadow-primary/20">
            {inicialUsuario}
          </span>
          <div className="hidden sm:flex flex-col items-start leading-tight text-left">
            <span className="text-xs font-semibold text-foreground">{nombreUsuario}</span>
            {nombreEmpresa && (
              <span
                className="text-[11px] text-muted-foreground font-normal truncate max-w-[150px] lg:max-w-[220px]"
                title={nombreEmpresa}
              >
                {nombreEmpresa}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
