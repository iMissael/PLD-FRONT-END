import { Suspense, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuthStore } from "@/shared/auth/authStore";
import { useRutaTenant } from "@/shared/tenant/useRutaTenant";
import { useNombreTenantPublico } from "@/features/buzon/hooks/useMensajeDenuncia";
import { getCurrentTenantId } from "@/shared/tenant/tenantStore";

import {
  ActivityIcon,
  BellIcon,
  ChevronDownIcon,
  ClipboardCheckIcon,
  HelpCircleIcon,
  HomeIcon,
  InfoIcon,
  LogOutIcon,
  MenuIcon,
  SearchIcon,
  SettingsIcon,
  ShieldSearchIcon,
  UserPlusIcon,
} from "@/shared/components/icons";
import { ExternalLink } from "lucide-react";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { Breadcrumbs } from "@/shared/components/Breadcrumbs";

interface NavLeaf {
  label: string;
  to: string;
  icon?: typeof HomeIcon;
  targetBlank?: boolean;
}

interface NavGroup {
  label: string;
  icon?: typeof HomeIcon;
  children: NavNode[];
}

type NavNode = NavLeaf | NavGroup;

function isGroup(node: NavNode): node is NavGroup {
  return "children" in node;
}

/**
 * Único lugar donde se declara la navegación de negocio. Los `to` son
 * relativos a la ruta del tenant (`/SICANETSC/PLD/:tenantId`), porque este
 * layout cuelga directamente de ella (ver routes/router.tsx) — nunca
 * hardcodear el tenant aquí.
 *
 * IMPORTANTE: estos 4 nombres (Configuraciones, Configuración de alertas,
 * Operación, Control) son los definidos por el negocio — no renombrar aquí.
 */
const NAV_ITEMS: NavNode[] = [
  {
    label: "Buzón de denuncias",
    icon: ShieldSearchIcon,
    children: [
      { label: "Gestión de denuncias", to: "buzon/gestion" },
      { label: "Alertas PLD", to: "buzon/alertas" },
      { label: "Mensaje de cabecera", to: "buzon/mensaje-cabecera" },
      { label: "Buzón anónimo (público)", to: "buzon/denuncias", targetBlank: true },
    ],
  },
  {
    label: "Configuraciones",
    icon: SettingsIcon,
    children: [
      {
        label: "Configuración del oficial de cumplimiento",
        to: "configuraciones/oficial-cumplimiento",
      },
      { label: "Matriz de riesgo", to: "configuraciones/matriz-riesgo" },
      {
        label: "Ubicación geográfica",
        children: [
          {
            label: "Listas de países",
            to: "configuraciones/ubicacion-geografica/listas-paises",
          },
          {
            label: "Zonas de riesgo",
            to: "configuraciones/ubicacion-geografica/zonas-geograficas",
          },
          {
            label: "Entidades",
            to: "configuraciones/ubicacion-geografica/entidades",
          },
          {
            label: "Localidades",
            to: "configuraciones/ubicacion-geografica/localidades",
          },
          {
            label: "Países",
            to: "configuraciones/ubicacion-geografica/paises",
          },
        ],
      },
      { label: "Configuración de personas", to: "configuraciones/personas" },
      { label: "Configuración de PEPs", to: "configuraciones/peps" },
      {
        label: "Configuración de edades",
        children: [
          { label: "Edades", to: "configuraciones/edades/rangos-edad" },
          {
            label: "Tiempo de constitución",
            to: "configuraciones/edades/tiempo-constitucion",
          },
        ],
      },
      {
        label: "Configuración de experiencia de actividad",
        to: "configuraciones/experiencia-actividad",
      },
      {
        label: "Configuración de actividad económica",
        to: "configuraciones/actividad-economica",
      },
      {
        label: "Configuración de tipos de crédito",
        to: "configuraciones/tipos-credito",
      },
      {
        label: "Configuración de historial crediticio",
        to: "configuraciones/historial-crediticio",
      },
      {
        label: "Configuración de monto de crédito",
        to: "configuraciones/monto-credito",
      },
      {
        label: "Configuración de recursos",
        children: [
          { label: "Origen", to: "configuraciones/recursos/origen" },
          { label: "Destino", to: "configuraciones/recursos/destino" },
        ],
      },
      {
        label: "Configuración de canales de pago",
        to: "configuraciones/canales-pago",
      },
      
    ],
  },
  {
    label: "Configuración de alertas",
    icon: BellIcon,
    children: [
      { label: "Configuración de alertas", to: "configuracion-alertas/reglas" },
      { label: "Consulta Personas bloqueados", to: "configuracion-alertas" },
      { label: "Carga de Personas Bloqueadas", to: "configuracion-alertas/carga-masiva" },
    ],
  },
  {
    label: "Operación",
    icon: ActivityIcon,
    children: [
      { label: "Resumen", to: "operacion" },
      { label: "Evaluación de riesgo", to: "operacion/evaluacion-riesgo" },
      { label: "Captura de alertas", to: "operacion/captura-alertas" },
      { label: "Revisión de alertas", to: "operacion/revision-alertas" },
      {
        label: "Revisión de alertas de autorización",
        to: "operacion/revision-alertas-autorizacion",
      },
      {
        label: "Revisión de alertas de seguimiento en operación",
        to: "operacion/revision-alertas-seguimiento",
      },
    ],
  },
  {
    label: "Control",
    icon: ClipboardCheckIcon,
    children: [
      { label: "Resumen", to: "control" },
      { label: "Quien es quien", to: "control/quienesquien" },
      { label: "Revisión de coincidencias", to: "control/coincidencias" },
      // Provisional: falta decidir dónde va (el manual de Sicanet lo pone en Control, 4.4.1).
      { label: "Control dólar", to: "control-dolar" },
    ],
  },
  {
    label: "Nuevos usuarios",
    icon: UserPlusIcon,
    children: [
      { label: "Usuarios", to: "configuraciones/administracion/usuarios" },
      { label: "Roles", to: "configuraciones/administracion/roles" },
      { label: "Permisos", to: "configuraciones/administracion/permisos" },
    ],
  },
  { label: "Acerca de", to: "acerca-de", icon: InfoIcon },
];

/** Sección "OTROS" del menú: utilidades ajenas al negocio (no catálogos/procesos). */
const OTHER_ITEMS: NavLeaf[] = [{ label: "Ayuda", to: "ayuda", icon: HelpCircleIcon }];

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

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const rutaEnTenant = useRutaTenant();
  const usuario = useAuthStore((estado) => estado.usuario);
  const inicial = (usuario?.nombre ?? "U").trim().charAt(0).toUpperCase() || "U";
  const { data: tenantPublico } = useNombreTenantPublico();
  const activeTenantId = getCurrentTenantId();
  const nombreEmpresa = tenantPublico?.nombreComercial || activeTenantId || "";

  function cerrarSesion() {
    useAuthStore.getState().logout();
    navigate(rutaEnTenant("login"), { replace: true });
  }

  const itemsFiltrados = useMemo(() => filterTree(NAV_ITEMS, query), [query]);
  const otrosFiltrados = useMemo(
    () =>
      query.trim()
        ? OTHER_ITEMS.filter((item) => matches(item.label, query))
        : OTHER_ITEMS,
    [query],
  );

  return (
    <div className="bg-background flex h-full flex-col">
      <header className="bg-muted/95 border-border flex h-16 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Mostrar menú" : "Ocultar menú"}
            className="hover:bg-secondary text-foreground rounded-md p-2"
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          <span className="from-primary-hover to-brand-teal flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-bold text-white">
            SC
          </span>
          <span className="text-foreground truncate text-sm font-semibold">
            SICANET SC
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <button
            type="button"
            title={nombreEmpresa ? `Perfil · ${nombreEmpresa}` : "Perfil"}
            className="hover:bg-secondary text-foreground flex items-center gap-2.5 rounded-md px-2 py-1.5"
          >
            <span className="from-primary-hover to-primary flex size-9 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shrink-0">
              {inicial}
            </span>
            <span className="flex flex-col items-start leading-tight text-left">
              <span className="text-sm font-medium">{usuario?.nombre ?? "Usuario"}</span>
              {nombreEmpresa && (
                <span
                  className="text-[11px] text-muted-foreground font-normal truncate max-w-[140px] sm:max-w-[200px]"
                  title={nombreEmpresa}
                >
                  {nombreEmpresa}
                </span>
              )}
            </span>
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className={`bg-card border-border flex shrink-0 flex-col overflow-y-auto border-r transition-[width] duration-200 ${
            collapsed ? "w-[4.5rem]" : "w-64"
          }`}
        >
          {!collapsed && (
            <div className="border-border border-b p-3">
              <label className="relative block">
                <SearchIcon className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar en el menú..."
                  className="border-input bg-muted text-foreground placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:ring-ring/30 w-full rounded-md border py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2"
                />
              </label>
            </div>
          )}

          <nav className="flex flex-1 flex-col gap-4 py-3">
            {itemsFiltrados.length > 0 && (
              <div>
                {!collapsed && <SectionLabel>Menú</SectionLabel>}
                <div className="flex flex-col gap-1">
                  {itemsFiltrados.map((item) => (
                    <NavNodeRenderer
                      key={item.label}
                      node={item}
                      depth={0}
                      collapsed={collapsed}
                    />
                  ))}
                </div>
              </div>
            )}

            {otrosFiltrados.length > 0 && (
              <div>
                {!collapsed && <SectionLabel>Otros</SectionLabel>}
                <div className="flex flex-col gap-1">
                  {otrosFiltrados.map((item) => (
                    <NavNodeRenderer
                      key={item.label}
                      node={item}
                      depth={0}
                      collapsed={collapsed}
                    />
                  ))}
                  <button
                    type="button"
                    title="Cerrar sesión"
                    onClick={cerrarSesion}
                    className={[
                      "text-logout hover:bg-logout-soft flex items-center gap-3 rounded-md text-sm font-medium transition-colors",
                      collapsed ? "mx-2 justify-center px-0 py-2.5" : "mx-2 px-3 py-2.5",
                    ].join(" ")}
                  >
                    <LogOutIcon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span className="truncate">Cerrar sesión</span>}
                  </button>
                </div>
              </div>
            )}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto px-6 py-6">
          <Breadcrumbs />
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
                  <span className="text-sm">Cargando…</span>
                </div>
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-muted-foreground px-4 pb-2 text-xs font-semibold uppercase tracking-wide">
      {children}
    </p>
  );
}

/**
 * Item de primer nivel. La guía lo define sólido: activo en verde con texto
 * blanco, inactivo en gris con hover verde muy claro.
 */
function navLinkClassName(collapsed: boolean) {
  return ({ isActive }: { isActive: boolean }) =>
    [
      "flex items-center gap-3 rounded-md text-sm font-medium transition-colors",
      collapsed ? "mx-2 justify-center px-0 py-2.5" : "mx-2 px-3 py-2.5",
      isActive
        ? "bg-nav hover:bg-nav-hover text-white"
        : "hover:bg-nav-soft text-foreground",
    ].join(" ");
}

/**
 * Sub-item: la guía no lo pinta de fondo, solo cambia el color del texto —
 * verde cuando está activo, gris con hover verde cuando no.
 */
function nestedLinkClassName({ isActive }: { isActive: boolean }) {
  return [
    "rounded-md px-3 py-1.5 text-xs sm:text-sm transition-colors flex items-center gap-2",
    isActive
      ? "text-primary font-bold bg-primary/10"
      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
  ].join(" ");
}

/**
 * Renderiza un nodo del árbol de navegación en cualquier profundidad.
 * - Con el menú colapsado, solo importa el nivel 0: cada hoja del subárbol
 *   se muestra como un ícono suelto (usando el ícono del nodo raíz).
 * - Expandido, una hoja es un NavLink; un grupo es una sección plegable
 *   cuyos hijos se renderizan recursivamente, indentados. El grupo abierto
 *   se resalta en el verde sólido que la guía define para el item activo.
 */
function NavNodeRenderer({
  node,
  depth,
  collapsed,
}: {
  node: NavNode;
  depth: number;
  collapsed: boolean;
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
        <NavLink to={hoja.to} end title={node.label} className={navLinkClassName(true)}>
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
          className="rounded-md px-3 py-1.5 text-xs sm:text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50 flex items-center justify-between gap-1.5"
        >
          <span className="truncate">{node.label}</span>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
        </a>
      );
    }

    if (depth === 0) {
      const Icon = node.icon ?? HomeIcon;
      return (
        <NavLink to={node.to} end title={node.label} className={navLinkClassName(false)}>
          <Icon className="h-5 w-5 shrink-0" />
          <span className="truncate">{node.label}</span>
        </NavLink>
      );
    }
    return (
      <NavLink to={node.to} end className={nestedLinkClassName}>
        {node.label}
      </NavLink>
    );
  }

  return <NavGroupSection node={node} depth={depth} />;
}

function NavGroupSection({ node, depth }: { node: NavGroup; depth: number }) {
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
                "mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                destacado
                  ? "bg-nav hover:bg-nav-hover text-white shadow-sm"
                  : "hover:bg-nav-soft text-foreground",
              ].join(" ")
            : [
                "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer",
                isActiveGroup ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
              ].join(" ")
        }
      >
        {Icon && <Icon className="h-5 w-5 shrink-0" />}
        <span className="flex-1 truncate text-left">{node.label}</span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
            destacado ? "text-white" : "text-muted-foreground"
          } ${open ? "rotate-0" : "-rotate-90"}`}
        />
      </button>
      {open && (
        <div className="border-border/60 ml-4 mt-0.5 flex flex-col gap-0.5 border-l pl-2 transition-all">
          {node.children.map((child) => (
            <NavNodeRenderer
              key={child.label}
              node={child}
              depth={depth + 1}
              collapsed={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
