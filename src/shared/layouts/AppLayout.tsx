import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import {
  ActivityIcon,
  BellIcon,
  ChevronDownIcon,
  ClipboardCheckIcon,
  DotsVerticalIcon,
  HelpCircleIcon,
  HomeIcon,
  InfoIcon,
  LogOutIcon,
  MenuIcon,
  SearchIcon,
  SettingsIcon,
  ShieldSearchIcon,
  UserCircleIcon,
} from "@/shared/components/icons";

interface NavLeaf {
  label: string;
  to: string;
  icon?: typeof HomeIcon;
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
    label: "Configuraciones",
    icon: SettingsIcon,
    children: [
      {
        label: "Configuración del oficial de cumplimiento",
        to: "configuraciones/oficial-cumplimiento",
      },
      {
        label: "ubicación geográfica",
        children: [
          {
            label: "Zonas geográficas",
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
    ],
  },
  {
    label: "Configuración de alertas",
    icon: ShieldSearchIcon,
    children: [
      { label: "Consulta Personas bloqueados", to: "configuracion-alertas" },
      { label: "Carga de Personas Bloqueadas", to: "configuracion-alertas/carga-masiva" },
    ],
  },
  {
    label: "Operación",
    icon: ActivityIcon,
    children: [{ label: "Resumen", to: "operacion" }],
  },
  {
    label: "Control",
    icon: ClipboardCheckIcon,
    children: [{ label: "Resumen", to: "control" }],
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

/** ¿Alguna hoja de este nodo corresponde a la ruta actual? Se usa solo para
 * decidir si un grupo arranca abierto. Compara la ruta completa de cada
 * hoja (no solo el primer segmento), porque ahora hay `to` anidados que
 * comparten el mismo primer segmento (p.ej. "configuraciones/personas" y
 * "configuraciones/ubicacion-geografica/paises"). */
function isNodeActive(node: NavNode, pathname: string): boolean {
  return collectLeaves(node).some((hoja) => pathname.endsWith(`/${hoja.to}`));
}

/**
 * Layout base de la app: barra superior (menú hamburguesa, logo, y accesos
 * de usuario) + menú lateral colapsable + contenido de la página activa. El
 * acento verde de marca se usa solo en el logo y en la sección de menú
 * abierta — el resto de la UI sigue en blanco.
 */
export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");

  const itemsFiltrados = useMemo(() => filterTree(NAV_ITEMS, query), [query]);
  const otrosFiltrados = useMemo(
    () =>
      query.trim()
        ? OTHER_ITEMS.filter((item) => matches(item.label, query))
        : OTHER_ITEMS,
    [query],
  );

  return (
    <div className="flex h-full flex-col bg-white">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Mostrar menú" : "Ocultar menú"}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
            style={{
              background:
                "linear-gradient(160deg, #88EC9B 0%, #5BD191 55%, #4BB58B 100%)",
            }}
          >
            SC
          </span>
          <span className="truncate text-sm font-semibold text-slate-900">
            SICANET SC
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Notificaciones"
            className="rounded-full p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          >
            <BellIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            title="Perfil"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-slate-700 hover:bg-slate-50"
          >
            <UserCircleIcon className="h-7 w-7 text-slate-400" />
            <span className="text-sm font-medium">Nombre</span>
          </button>
          <button
            type="button"
            title="Más opciones"
            className="rounded-full p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          >
            <DotsVerticalIcon className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className={`flex shrink-0 flex-col overflow-y-auto border-r border-slate-100 bg-white transition-[width] duration-200 ${
            collapsed ? "w-[4.5rem]" : "w-64"
          }`}
        >
          {!collapsed && (
            <div className="border-b border-slate-100 p-3">
              <label className="relative block">
                <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar en el menú..."
                  className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#5BD191] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#88EC9B]/40"
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
                    onClick={() => {
                      // Pendiente: aún no hay lógica real de sesión que cerrar.
                    }}
                    className={[
                      "flex items-center gap-3 rounded-md text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900",
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
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
      {children}
    </p>
  );
}

function navLinkClassName(collapsed: boolean) {
  return ({ isActive }: { isActive: boolean }) =>
    [
      "flex items-center gap-3 rounded-md text-sm font-medium transition-colors",
      collapsed ? "mx-2 justify-center px-0 py-2.5" : "mx-2 px-3 py-2.5",
      isActive
        ? "bg-gradient-to-r from-[#88EC9B]/25 to-[#5BD191]/15 text-[#1f6b4d]"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
    ].join(" ");
}

function nestedLinkClassName({ isActive }: { isActive: boolean }) {
  return [
    "rounded-md px-3 py-2 text-sm transition-colors",
    isActive
      ? "bg-gradient-to-r from-[#88EC9B]/25 to-[#5BD191]/15 font-medium text-[#1f6b4d]"
      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
  ].join(" ");
}

/**
 * Renderiza un nodo del árbol de navegación en cualquier profundidad.
 * - Con el menú colapsado, solo importa el nivel 0: cada hoja del subárbol
 *   se muestra como un ícono suelto (usando el ícono del nodo raíz).
 * - Expandido, una hoja es un NavLink; un grupo es una sección plegable
 *   cuyos hijos se renderizan recursivamente, indentados. El grupo abierto
 *   se resalta en verde sólido (como "Procesos" en la referencia).
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
  if (collapsed && depth === 0) {
    const Icon = node.icon ?? HomeIcon;
    const hojas = collectLeaves(node);

    if (hojas.length === 1 && hojas[0]) {
      const hoja = hojas[0];
      return (
        <NavLink to={hoja.to} end title={node.label} className={navLinkClassName(true)}>
          <Icon className="h-5 w-5 shrink-0" />
        </NavLink>
      );
    }

    return (
      <div className="flex flex-col gap-1">
        {hojas.map((hoja) => (
          <NavLink
            key={hoja.to}
            to={hoja.to}
            end
            title={`${node.label} · ${hoja.label}`}
            className={navLinkClassName(true)}
          >
            <Icon className="h-5 w-5 shrink-0" />
          </NavLink>
        ))}
      </div>
    );
  }

  if (!isGroup(node)) {
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
  const [open, setOpen] = useState(() => isNodeActive(node, location.pathname));
  const Icon = node.icon;
  const destacado = depth === 0 && open;

  return (
    <div className={depth === 0 ? "" : ""}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={
          depth === 0
            ? [
                "mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                destacado
                  ? "text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              ].join(" ")
            : "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800"
        }
        style={
          destacado
            ? { background: "linear-gradient(135deg, #5BD191 0%, #4BB58B 100%)" }
            : undefined
        }
      >
        {Icon && <Icon className="h-5 w-5 shrink-0" />}
        <span className="flex-1 truncate text-left">{node.label}</span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 transition-transform ${
            destacado ? "text-white" : "text-slate-400"
          } ${open ? "" : "-rotate-90"}`}
        />
      </button>
      {open && (
        <div className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-slate-100 pl-2">
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
