import { Suspense, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { useAuthStore } from "@/shared/auth/authStore";
import { useRutaTenant } from "@/shared/tenant/useRutaTenant";
import { useNombreTenantPublico } from "@/features/buzon/hooks/useMensajeDenuncia";
import { getCurrentTenantId } from "@/shared/tenant/tenantStore";

import {
  ActivityIcon,
  BellIcon,
  ClipboardCheckIcon,
  HelpCircleIcon,
  InfoIcon,
  SettingsIcon,
  ShieldSearchIcon,
  UserPlusIcon,
} from "@/shared/components/atoms/icons";
import { Header } from "@/shared/components/organisms/Header";
import { Sidebar, type NavNode, type NavLeaf } from "@/shared/components/organisms/Sidebar";
import { Breadcrumbs } from "@/shared/components/organisms/Breadcrumbs";

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
      {
        label: "Configuración de PEPs",
        to: "configuraciones/peps",
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
      { label: "Historial de evaluaciones", to: "operacion/historial-evaluaciones" },
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
      { label: "Revisión de incidencias", to: "operacion/coincidencias" },
    ],
  },
  {
    label: "Control",
    icon: ClipboardCheckIcon,
    children: [
      { label: "Resumen", to: "control" },
      { label: "Quien es quien", to: "control/quienesquien" },
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

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
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

  return (
    <div className="bg-background flex h-full flex-col">
      {/* Header Organism */}
      <Header
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((value) => !value)}
        isMobileOpen={isMobileOpen}
        onToggleMobile={() => setIsMobileOpen((value) => !value)}
        nombreUsuario={usuario?.nombre ?? "Usuario"}
        nombreEmpresa={nombreEmpresa}
        inicialUsuario={inicial}
      />

      <div className="flex min-h-0 flex-1 relative">
        {/* Sidebar Organism con soporte desktop y mobile drawer */}
        <Sidebar
          navItems={NAV_ITEMS}
          otherItems={OTHER_ITEMS}
          collapsed={collapsed}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
          onLogout={cerrarSesion}
        />

        {/* Contenido Principal */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
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
