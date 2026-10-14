import { useState, useMemo, type ComponentType } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  ChevronDownIcon,
  HomeIcon,
  LogOutIcon,
  SearchIcon,
} from "@/shared/components/icons";
import { ExternalLink, X } from "lucide-react";
import { useRutaTenant } from "@/shared/tenant/useRutaTenant";

export interface NavLeaf {
  label: string;
  to: string;
  icon?: ComponentType<{ className?: string }>;
  targetBlank?: boolean;
}

export interface NavGroup {
  label: string;
  icon?: ComponentType<{ className?: string }>;
  children: NavNode[];
}

export type NavNode = NavLeaf | NavGroup;

export function isGroup(node: NavNode): node is NavGroup {
  return "children" in node;
}

function matches(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.trim().toLowerCase());
}

function filterTree(nodes: NavNode[], query: string): NavNode[] {
  if (!query.trim()) return nodes;

  return nodes.flatMap((node): NavNode[] => {
    if (!isGroup(node)) {
      return matches(node.label, query) ? [node] : [];
    }
    if (matches(node.label, query)) return [node];

    const hijosFiltrados = filterTree(node.children, query);
    return hijosFiltrados.length > 0 ? [{ ...node, children: hijosFiltrados }] : [];
  });
}

function collectLeaves(node: NavNode): NavLeaf[] {
  if (!isGroup(node)) return [node];
  return node.children.flatMap(collectLeaves);
}

function isNodeActive(node: NavNode, pathname: string): boolean {
  return collectLeaves(node).some(
    (hoja) => pathname.endsWith(`/${hoja.to}`) || pathname.includes(`/${hoja.to}/`),
  );
}

export interface SidebarProps {
  navItems: NavNode[];
  otherItems?: NavLeaf[];
  collapsed?: boolean;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onLogout?: () => void;
  className?: string;
}

export function Sidebar({
  navItems,
  otherItems = [],
  collapsed = false,
  isMobileOpen = false,
  onCloseMobile,
  onLogout,
  className = "",
}: SidebarProps) {
  const [query, setQuery] = useState("");

  const itemsFiltrados = useMemo(() => filterTree(navItems, query), [navItems, query]);
  const otrosFiltrados = useMemo(
    () =>
      query.trim()
        ? otherItems.filter((item) => matches(item.label, query))
        : otherItems,
    [otherItems, query],
  );

  const sidebarContent = (isMobileView: boolean) => {
    const isCollapsedEffective = isMobileView ? false : collapsed;

    return (
      <div className="flex h-full flex-col overflow-y-auto">
        {/* En móvil, cabecera de drawer con botón de cerrar */}
        {isMobileView && (
          <div className="flex items-center justify-between border-b border-border p-4">
            <div className="flex items-center gap-2">
              <span className="from-primary to-emerald-600 flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-bold text-white shadow-sm">
                SC
              </span>
              <span className="text-sm font-bold text-foreground">SICANET SC</span>
            </div>
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Cerrar menú"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Barra de búsqueda de menú (oculta si está colapsado en desktop) */}
        {!isCollapsedEffective && (
          <div className="border-border border-b p-3">
            <div className="relative">
              <SearchIcon className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar en el menú..."
                className="border-input bg-muted/60 text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:ring-primary/20 w-full rounded-md border py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Enlaces de navegación */}
        <nav className="flex flex-1 flex-col gap-4 py-3">
          {itemsFiltrados.length > 0 && (
            <div>
              {!isCollapsedEffective && <SectionLabel>Menú</SectionLabel>}
              <div className="flex flex-col gap-1">
                {itemsFiltrados.map((item) => (
                  <NavNodeRenderer
                    key={item.label}
                    node={item}
                    depth={0}
                    collapsed={isCollapsedEffective}
                    onLinkClick={isMobileView ? onCloseMobile : undefined}
                  />
                ))}
              </div>
            </div>
          )}

          {otrosFiltrados.length > 0 && (
            <div>
              {!isCollapsedEffective && <SectionLabel>Otros</SectionLabel>}
              <div className="flex flex-col gap-1">
                {otrosFiltrados.map((item) => (
                  <NavNodeRenderer
                    key={item.label}
                    node={item}
                    depth={0}
                    collapsed={isCollapsedEffective}
                    onLinkClick={isMobileView ? onCloseMobile : undefined}
                  />
                ))}
                {onLogout && (
                  <button
                    type="button"
                    title="Cerrar sesión"
                    onClick={() => {
                      if (isMobileView && onCloseMobile) onCloseMobile();
                      onLogout();
                    }}
                    className={[
                      "text-destructive hover:bg-destructive/10 flex items-center gap-3 rounded-md text-sm font-medium transition-colors cursor-pointer",
                      isCollapsedEffective ? "mx-2 justify-center px-0 py-2.5" : "mx-2 px-3 py-2.5",
                    ].join(" ")}
                  >
                    <LogOutIcon className="h-5 w-5 shrink-0" />
                    {!isCollapsedEffective && <span className="truncate">Cerrar sesión</span>}
                  </button>
                )}
              </div>
            </div>
          )}
        </nav>
      </div>
    );
  };

  return (
    <>
      {/* 1. Modo Móvil (< 768px): Drawer off-canvas con backdrop oscuro */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop con desenfoque suave */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Panel drawer deslizable */}
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border shadow-2xl flex flex-col animate-slide-in-right">
            {sidebarContent(true)}
          </aside>
        </div>
      )}

      {/* 2. Modo Desktop (>= 768px): Panel integrado estático/colapsable */}
      <aside
        className={`hidden md:flex bg-card border-border border-r shrink-0 flex-col transition-[width] duration-200 ${
          collapsed ? "w-[4.5rem]" : "w-64"
        } ${className}`}
      >
        {sidebarContent(false)}
      </aside>
    </>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-muted-foreground/80 px-4 pb-2 text-[11px] font-bold uppercase tracking-wider">
      {children}
    </p>
  );
}

/**
 * Item de primer nivel.
 * Estado Activo claramente diferenciado: fondo verde sólido (guía oficial), texto blanco.
 */
function navLinkClassName(collapsed: boolean) {
  return ({ isActive }: { isActive: boolean }) =>
    [
      "flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer",
      collapsed ? "mx-2 justify-center px-0 py-2.5" : "mx-2 px-3 py-2.5",
      isActive
        ? "bg-nav-active text-white font-semibold shadow-sm hover:bg-nav-active-hover"
        : "text-foreground hover:bg-nav-hover hover:text-foreground",
    ].join(" ");
}

/**
 * Sub-item:
 * Estado Activo evidente: fondo verde tenue, borde izquierdo verde y texto en negrita.
 */
function nestedLinkClassName({ isActive }: { isActive: boolean }) {
  return [
    "rounded-md px-3 py-1.5 text-xs sm:text-sm transition-all duration-150 flex items-center gap-2 cursor-pointer",
    isActive
      ? "text-nav-accent font-bold bg-nav-soft border-l-3 border-nav-active pl-2.5 rounded-r-md shadow-xs"
      : "text-muted-foreground hover:text-nav-accent hover:bg-muted/50",
  ].join(" ");
}

function NavNodeRenderer({
  node,
  depth,
  collapsed,
  onLinkClick,
}: {
  node: NavNode;
  depth: number;
  collapsed: boolean;
  onLinkClick?: () => void;
}) {
  const rutaTenant = useRutaTenant();

  if (collapsed && depth === 0) {
    const Icon = node.icon ?? HomeIcon;
    const hojas = collectLeaves(node);

    if (hojas.length === 1 && hojas[0]) {
      const hoja = hojas[0];
      if (hoja.targetBlank) {
        return (
          <a
            href={rutaTenant(hoja.to)}
            target="_blank"
            rel="noopener noreferrer"
            title={`${node.label} (Abrir en nueva ventana)`}
            className={navLinkClassName(true)({ isActive: false })}
          >
            <Icon className="h-5 w-5 shrink-0" />
          </a>
        );
      }
      return (
        <NavLink
          to={hoja.to}
          end
          title={node.label}
          className={navLinkClassName(true)}
          onClick={onLinkClick}
        >
          <Icon className="h-5 w-5 shrink-0" />
        </NavLink>
      );
    }

    return (
      <div className="flex flex-col gap-1">
        {hojas.map((hoja) => {
          if (hoja.targetBlank) {
            return (
              <a
                key={hoja.to}
                href={rutaTenant(hoja.to)}
                target="_blank"
                rel="noopener noreferrer"
                title={`${node.label} · ${hoja.label} (Abrir en nueva ventana)`}
                className={navLinkClassName(true)({ isActive: false })}
              >
                <Icon className="h-5 w-5 shrink-0" />
              </a>
            );
          }
          return (
            <NavLink
              key={hoja.to}
              to={hoja.to}
              end
              title={`${node.label} · ${hoja.label}`}
              className={navLinkClassName(true)}
              onClick={onLinkClick}
            >
              <Icon className="h-5 w-5 shrink-0" />
            </NavLink>
          );
        })}
      </div>
    );
  }

  if (!isGroup(node)) {
    if (node.targetBlank) {
      if (depth === 0) {
        const Icon = node.icon ?? HomeIcon;
        return (
          <a
            href={rutaTenant(node.to)}
            target="_blank"
            rel="noopener noreferrer"
            title={`${node.label} (Abrir en nueva ventana)`}
            className={navLinkClassName(false)({ isActive: false })}
            onClick={onLinkClick}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="truncate">{node.label}</span>
            <ExternalLink className="ml-auto h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
          </a>
        );
      }
      return (
        <a
          href={rutaTenant(node.to)}
          target="_blank"
          rel="noopener noreferrer"
          title={`${node.label} (Abrir en nueva ventana)`}
          className="rounded-md px-3 py-1.5 text-xs sm:text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50 flex items-center justify-between gap-1.5 cursor-pointer"
          onClick={onLinkClick}
        >
          <span className="truncate">{node.label}</span>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
        </a>
      );
    }

    if (depth === 0) {
      const Icon = node.icon ?? HomeIcon;
      return (
        <NavLink
          to={node.to}
          end
          title={node.label}
          className={navLinkClassName(false)}
          onClick={onLinkClick}
        >
          <Icon className="h-5 w-5 shrink-0" />
          <span className="truncate">{node.label}</span>
        </NavLink>
      );
    }
    return (
      <NavLink
        to={node.to}
        end
        className={nestedLinkClassName}
        onClick={onLinkClick}
      >
        {node.label}
      </NavLink>
    );
  }

  return (
    <NavGroupSection
      node={node}
      depth={depth}
      onLinkClick={onLinkClick}
    />
  );
}

function NavGroupSection({
  node,
  depth,
  onLinkClick,
}: {
  node: NavGroup;
  depth: number;
  onLinkClick?: () => void;
}) {
  const location = useLocation();
  const isActiveGroup = isNodeActive(node, location.pathname);
  const [open, setOpen] = useState(() => isActiveGroup);
  const Icon = node.icon;
  const destacado = depth === 0 && open;

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={
          depth === 0
            ? [
                "mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                destacado
                  ? "bg-nav-soft text-nav-accent font-semibold shadow-xs"
                  : "hover:bg-nav-hover text-foreground",
              ].join(" ")
            : [
                "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer",
                isActiveGroup
                  ? "text-nav-accent font-bold"
                  : "text-muted-foreground hover:text-nav-accent hover:bg-muted/40",
              ].join(" ")
        }
      >
        {Icon && <Icon className="h-5 w-5 shrink-0" />}
        <span className="flex-1 truncate text-left">{node.label}</span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
            destacado ? "text-nav-accent" : "text-muted-foreground"
          } ${open ? "rotate-0" : "-rotate-90"}`}
        />
      </button>
      {open && (
        <div className="border-border/60 ml-4 mt-0.5 flex flex-col gap-0.5 border-l-2 pl-2 transition-all">
          {node.children.map((child) => (
            <NavNodeRenderer
              key={child.label}
              node={child}
              depth={depth + 1}
              collapsed={false}
              onLinkClick={onLinkClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
