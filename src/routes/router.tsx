import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import { RequireAuth } from "@/shared/auth/RequireAuth";
import { RequierePermiso } from "@/shared/auth/RequierePermiso";
import { PlaceholderPage } from "@/shared/components/PlaceholderPage";
import { AppLayout } from "@/shared/layouts/AppLayout";
import { ContenidoAcotado } from "@/shared/layouts/ContenidoAcotado";
import { TenantRequeridoPage } from "@/shared/layouts/TenantRequeridoPage";
import { TenantRouteLayout } from "@/shared/layouts/TenantRouteLayout";

// ─── Lazy page imports ────────────────────────────────────────────────────────
// Cada página se descarga solo cuando el usuario navega a esa ruta.
// Los layouts, guards y utilitarios se mantienen estáticos porque siempre
// se necesitan.

const LoginPage = lazy(() =>
  import("@/features/auth/pages/LoginPage").then((m) => ({ default: m.LoginPage })),
);

// Buzón
const BuzonPublicoPage = lazy(() =>
  import("@/features/buzon/pages/BuzonPublicoPage").then((m) => ({ default: m.BuzonPublicoPage })),
);
const GestionAlertasPage = lazy(() =>
  import("@/features/buzon/pages/GestionAlertasPage").then((m) => ({ default: m.GestionAlertasPage })),
);
const GestionDenunciasPage = lazy(() =>
  import("@/features/buzon/pages/GestionDenunciasPage").then((m) => ({ default: m.GestionDenunciasPage })),
);
const PersonalizarMensajeCabeceraPage = lazy(() =>
  import("@/features/buzon/pages/PersonalizarMensajeCabeceraPage").then((m) => ({ default: m.PersonalizarMensajeCabeceraPage })),
);

// Configuración de alertas
const CargaMasivaPage = lazy(() =>
  import("@/features/configuracion-alertas/pages/CargaMasivaPage").then((m) => ({ default: m.CargaMasivaPage })),
);
const ConsultaBloqueadosPage = lazy(() =>
  import("@/features/configuracion-alertas/pages/ConsultaBloqueadosPage").then((m) => ({ default: m.ConsultaBloqueadosPage })),
);
const ReglasAlertaPage = lazy(() =>
  import("@/features/configuracion-alertas/reglas/pages/ReglasAlertaPage").then((m) => ({ default: m.ReglasAlertaPage })),
);

// Configuraciones generales
const ActividadesEconomicasPage = lazy(() =>
  import("@/features/configuraciones/actividad-economica/pages/ActividadesEconomicasPage").then((m) => ({ default: m.ActividadesEconomicasPage })),
);
const PermisosPage = lazy(() =>
  import("@/features/configuraciones/administracion/permisos/pages/PermisosPage").then((m) => ({ default: m.PermisosPage })),
);
const RolesPage = lazy(() =>
  import("@/features/configuraciones/administracion/roles/pages/RolesPage").then((m) => ({ default: m.RolesPage })),
);
const RolPermisosPage = lazy(() =>
  import("@/features/configuraciones/administracion/roles/pages/RolPermisosPage").then((m) => ({ default: m.RolPermisosPage })),
);
const UsuariosPage = lazy(() =>
  import("@/features/configuraciones/administracion/usuarios/pages/UsuariosPage").then((m) => ({ default: m.UsuariosPage })),
);
const SistemasIntegracionPage = lazy(() =>
  import("@/features/configuraciones/administracion/integraciones/pages/SistemasIntegracionPage").then((m) => ({ default: m.SistemasIntegracionPage })),
);
const CanalesPagoPage = lazy(() =>
  import("@/features/configuraciones/canales-pago/pages/CanalesPagoPage").then((m) => ({ default: m.CanalesPagoPage })),
);
const EdadesPage = lazy(() =>
  import("@/features/configuraciones/edades/rangos-edad/pages/EdadesPage").then((m) => ({ default: m.EdadesPage })),
);
const TiemposConstitucionPage = lazy(() =>
  import("@/features/configuraciones/edades/tiempo-constitucion/pages/TiemposConstitucionPage").then((m) => ({ default: m.TiemposConstitucionPage })),
);
const ExperienciasActividadPage = lazy(() =>
  import("@/features/configuraciones/experiencia-actividad/pages/ExperienciasActividadPage").then((m) => ({ default: m.ExperienciasActividadPage })),
);
const HistorialesCrediticiosPage = lazy(() =>
  import("@/features/configuraciones/historial-crediticio/pages/HistorialesCrediticiosPage").then((m) => ({ default: m.HistorialesCrediticiosPage })),
);
const MatrizRiesgoPage = lazy(() =>
  import("@/features/configuraciones/matriz-riesgo/pages/MatrizRiesgoPage").then((m) => ({ default: m.MatrizRiesgoPage })),
);
const PrestamosMontoPage = lazy(() =>
  import("@/features/configuraciones/monto-credito/pages/PrestamosMontoPage").then((m) => ({ default: m.PrestamosMontoPage })),
);
const OficialCumplimientoPage = lazy(() =>
  import("@/features/configuraciones/oficial-cumplimiento/pages/OficialCumplimientoPage").then((m) => ({ default: m.OficialCumplimientoPage })),
);
const PepsPage = lazy(() =>
  import("@/features/configuraciones/peps/pages/PepsPage").then((m) => ({ default: m.PepsPage })),
);
const TiposPersonaPage = lazy(() =>
  import("@/features/configuraciones/personas/pages/TiposPersonaPage").then((m) => ({ default: m.TiposPersonaPage })),
);
const DestinosRecursoPage = lazy(() =>
  import("@/features/configuraciones/recursos/destino/pages/DestinosRecursoPage").then((m) => ({ default: m.DestinosRecursoPage })),
);
const OrigenesRecursoPage = lazy(() =>
  import("@/features/configuraciones/recursos/origen/pages/OrigenesRecursoPage").then((m) => ({ default: m.OrigenesRecursoPage })),
);
const TiposCreditoPage = lazy(() =>
  import("@/features/configuraciones/tipos-credito/pages/TiposCreditoPage").then((m) => ({ default: m.TiposCreditoPage })),
);

// Ubicación geográfica
const EntidadesPage = lazy(() =>
  import("@/features/configuraciones/ubicacion-geografica/entidades/pages/EntidadesPage").then((m) => ({ default: m.EntidadesPage })),
);
const ListasPaisesPage = lazy(() =>
  import("@/features/configuraciones/ubicacion-geografica/listas-paises/pages/ListasPaisesPage").then((m) => ({ default: m.ListasPaisesPage })),
);
const LocalidadesPage = lazy(() =>
  import("@/features/configuraciones/ubicacion-geografica/localidades/pages/LocalidadesPage").then((m) => ({ default: m.LocalidadesPage })),
);
const PaisesPage = lazy(() =>
  import("@/features/configuraciones/ubicacion-geografica/paises/pages/PaisesPage").then((m) => ({ default: m.PaisesPage })),
);
const ZonasGeograficasPage = lazy(() =>
  import("@/features/configuraciones/ubicacion-geografica/zonas-geograficas/pages/ZonasGeograficasPage").then((m) => ({ default: m.ZonasGeograficasPage })),
);

// Control / operación
const ControlDolarPage = lazy(() =>
  import("@/features/control-dolar/pages/ControlDolarPage").then((m) => ({ default: m.ControlDolarPage })),
);
const ControlPage = lazy(() =>
  import("@/features/control/pages/ControlPage").then((m) => ({ default: m.ControlPage })),
);
const CapturaAlertasPage = lazy(() =>
  import("@/features/operacion/captura-alertas/pages/CapturaAlertasPage").then((m) => ({ default: m.CapturaAlertasPage })),
);
const ConsultaListasPage = lazy(() =>
  import("@/features/operacion/consulta-listas/pages/Quienesquien").then((m) => ({ default: m.ConsultaListasPage })),
);
const RevisionCoincidenciasPage = lazy(() =>
  import("@/features/operacion/revision-coincidencias/pages/RevisionCoincidenciasPage").then((m) => ({ default: m.RevisionCoincidenciasPage })),
);
const EvaluacionRiesgoPage = lazy(() =>
  import("@/features/operacion/evaluacion-riesgo/pages/EvaluacionRiesgoPage").then((m) => ({ default: m.EvaluacionRiesgoPage })),
);
const HistorialEvaluacionesPage = lazy(() =>
  import("@/features/operacion/evaluacion-riesgo/pages/HistorialEvaluacionesPage").then((m) => ({ default: m.HistorialEvaluacionesPage })),
);
const OperacionPage = lazy(() =>
  import("@/features/operacion/pages/OperacionPage").then((m) => ({ default: m.OperacionPage })),
);
const RevisionAlertasPage = lazy(() =>
  import("@/features/operacion/revision-alertas/pages/RevisionAlertasPage").then((m) => ({ default: m.RevisionAlertasPage })),
);

// ─── Router ───────────────────────────────────────────────────────────────────

export const router = createBrowserRouter([
  {
    path: "/SICANETSC/PLD/:tenantId",
    element: <TenantRouteLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      // Buzón anónimo: cualquiera puede levantar una denuncia sin sesión.
      { path: "buzon/denuncias", element: <BuzonPublicoPage /> },
      { path: "buzon-denuncias", element: <BuzonPublicoPage /> },
      { path: "buzon-anonimo", element: <BuzonPublicoPage /> },
      {
        element: <RequireAuth />,
        children: [
          {
            children: [
              {
                element: <AppLayout />,
                children: [
                  {
                    index: true,
                    element: <Navigate to="configuracion-alertas" replace />,
                  },
                  {
                    path: "configuraciones/ubicacion-geografica/listas-paises",
                    element: <ListasPaisesPage />,
                  },
                  {
                    path: "configuraciones/ubicacion-geografica/zonas-geograficas",
                    element: <ZonasGeograficasPage />,
                  },
                  // Alias con prop `tipo` (compatibilidad con enlaces antiguos).
                  {
                    path: "configuraciones/ubicacion-geografica/zonas-geograficas/paises",
                    element: <ZonasGeograficasPage tipo="P" />,
                  },
                  {
                    path: "configuraciones/ubicacion-geografica/zonas-geograficas/entidades",
                    element: <ZonasGeograficasPage tipo="E" />,
                  },
                  {
                    path: "configuraciones/ubicacion-geografica/zonas-paises",
                    element: <ZonasGeograficasPage tipo="P" />,
                  },
                  {
                    path: "configuraciones/ubicacion-geografica/zonas-entidades",
                    element: <ZonasGeograficasPage tipo="E" />,
                  },
                  {
                    path: "configuraciones/ubicacion-geografica/zonas-riesgo",
                    element: <ZonasGeograficasPage />,
                  },
                  {
                    path: "configuraciones/ubicacion-geografica/entidades",
                    element: <EntidadesPage />,
                  },
                  {
                    path: "configuraciones/ubicacion-geografica/localidades",
                    element: <LocalidadesPage />,
                  },
                  {
                    path: "configuraciones/ubicacion-geografica/paises",
                    element: <PaisesPage />,
                  },
                  {
                    path: "configuracion-alertas",
                    element: <ConsultaBloqueadosPage />,
                  },
                  {
                    path: "configuracion-alertas/carga-masiva",
                    element: <CargaMasivaPage />,
                  },
                  // Sin ancho acotado: la tabla de reglas tiene muchas columnas.
                  {
                    path: "configuracion-alertas/reglas",
                    element: <ReglasAlertaPage />,
                  },
                  // Sin ancho acotado: la lista y el detalle de la alerta van lado a lado.
                  {
                    path: "operacion/revision-alertas",
                    element: <RevisionAlertasPage />,
                  },
                  {
                    path: "operacion/revision-alertas-automatizacion",
                    element: <PlaceholderPage title="Revisión de alertas de automatización" />,
                  },
                  {
                    path: "operacion/revision-alertas-seguimiento",
                    element: <PlaceholderPage title="Revisión de alertas de seguimiento en operación" />,
                  },
                  {
                    path: "operacion",
                    element: <OperacionPage />,
                  },
                  {
                    path: "control",
                    element: <ControlPage />,
                  },
                  // Sin ancho acotado: la matriz de riesgo necesita todo el ancho
                  // disponible (expediente del cliente + tabla de factores lado a lado).
                  {
                    path: "operacion/evaluacion-riesgo",
                    element: <EvaluacionRiesgoPage />,
                  },
                  // Mismo motivo: expediente del cliente + tabla de historial lado a lado.
                  {
                    path: "operacion/historial-evaluaciones",
                    element: <HistorialEvaluacionesPage />,
                  },
                  // Sin ancho acotado: la tabla de usuarios y el formulario de alta
                  // (con muchos campos en varias columnas) aprovechan todo el ancho.
                  {
                    path: "configuraciones/administracion/usuarios",
                    element: <UsuariosPage />,
                  },
                  {
                    path: "acerca-de",
                    element: (
                      <PlaceholderPage
                        title="Acerca de"
                        description="Información del sistema (versión, soporte, etc.). Pendiente de definir."
                      />
                    ),
                  },
                  {
                    path: "ayuda",
                    element: (
                      <PlaceholderPage
                        title="Ayuda"
                        description="Centro de ayuda del sistema. Pendiente de definir."
                      />
                    ),
                  },
                  // Pantallas con ancho de lectura acotado.
                  {
                    element: <ContenidoAcotado />,
                    children: [
                      {
                        path: "buzon/gestion",
                        element: (
                          <RequierePermiso recurso="denuncias" accion="ver">
                            <GestionDenunciasPage />
                          </RequierePermiso>
                        ),
                      },
                      {
                        path: "buzon/alertas",
                        element: (
                          <RequierePermiso recurso="alertas" accion="ver">
                            <GestionAlertasPage />
                          </RequierePermiso>
                        ),
                      },
                      {
                        path: "buzon/mensaje-cabecera",
                        element: <PersonalizarMensajeCabeceraPage />,
                      },
                      {
                        path: "configuraciones/mensaje-denuncia",
                        element: <PersonalizarMensajeCabeceraPage />,
                      },
                      {
                        path: "configuraciones/oficial-cumplimiento",
                        element: <OficialCumplimientoPage />,
                      },
                      {
                        path: "configuraciones/matriz-riesgo",
                        element: <MatrizRiesgoPage />,
                      },
                      {
                        path: "configuraciones/administracion/roles",
                        element: <RolesPage />,
                      },
                      {
                        path: "configuraciones/administracion/roles/:rolId/permisos",
                        element: <RolPermisosPage />,
                      },
                      {
                        path: "configuraciones/administracion/permisos",
                        element: <PermisosPage />,
                      },
                      {
                        path: "configuraciones/administracion/integraciones",
                        element: (
                          <RequierePermiso recurso="integraciones" accion="ver">
                            <SistemasIntegracionPage />
                          </RequierePermiso>
                        ),
                      },
                      {
                        path: "operacion/captura-alertas",
                        element: <CapturaAlertasPage />,
                      },
                      // Ruta propia (no "control/..."): su lugar en el menú todavía no
                      // está decidido y así moverlo no cambia la URL.
                      {
                        path: "control-dolar",
                        element: <ControlDolarPage />,
                      },
                      {
                        path: "control/quienesquien",
                        element: <ConsultaListasPage />,
                      },
                      {
                        path: "control/coincidencias",
                        element: (
                          <RequierePermiso recurso="coincidencias" accion="ver">
                            <RevisionCoincidenciasPage />
                          </RequierePermiso>
                        ),
                      },
                      {
                        path: "configuraciones/personas",
                        element: <TiposPersonaPage />,
                      },
                      {
                        path: "configuraciones/peps",
                        element: <PepsPage />,
                      },
                      {
                        path: "configuraciones/edades/rangos-edad",
                        element: <EdadesPage />,
                      },
                      {
                        path: "configuraciones/edades/tiempo-constitucion",
                        element: <TiemposConstitucionPage />,
                      },
                      {
                        path: "configuraciones/experiencia-actividad",
                        element: <ExperienciasActividadPage />,
                      },
                      {
                        path: "configuraciones/actividad-economica",
                        element: <ActividadesEconomicasPage />,
                      },
                      {
                        path: "configuraciones/tipos-credito",
                        element: <TiposCreditoPage />,
                      },
                      {
                        path: "configuraciones/historial-crediticio",
                        element: <HistorialesCrediticiosPage />,
                      },
                      {
                        path: "configuraciones/monto-credito",
                        element: <PrestamosMontoPage />,
                      },
                      {
                        path: "configuraciones/recursos/origen",
                        element: <OrigenesRecursoPage />,
                      },
                      {
                        path: "configuraciones/recursos/destino",
                        element: <DestinosRecursoPage />,
                      },
                      {
                        path: "configuraciones/canales-pago",
                        element: <CanalesPagoPage />,
                      },
                      {
                        path: "configuraciones",
                        element: <Navigate to="configuraciones/oficial-cumplimiento" replace />,
                      },
                      {
                        path: "configuraciones/ubicacion-geografica",
                        element: <Navigate to="configuraciones/ubicacion-geografica/listas-paises" replace />,
                      },
                      {
                        path: "configuraciones/edades",
                        element: <Navigate to="configuraciones/edades/rangos-edad" replace />,
                      },
                      {
                        path: "configuraciones/recursos",
                        element: <Navigate to="configuraciones/recursos/origen" replace />,
                      },
                      {
                        path: "configuraciones/administracion",
                        element: <Navigate to="configuraciones/administracion/usuarios" replace />,
                      },
                      {
                        path: "buzon",
                        element: <Navigate to="buzon/gestion" replace />,
                      },
                      {
                        path: "*",
                        element: <Navigate to="configuracion-alertas" replace />,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <TenantRequeridoPage /> },
]);
