import { createBrowserRouter, Navigate } from "react-router-dom";

import { LoginPage } from "@/features/auth/pages/LoginPage";
// import { AyudaPage } from "@/features/ayuda/pages/AyudaPage";
import { BuzonPublicoPage } from "@/features/buzon/pages/BuzonPublicoPage";
import { GestionAlertasPage } from "@/features/buzon/pages/GestionAlertasPage";
import { GestionDenunciasPage } from "@/features/buzon/pages/GestionDenunciasPage";
import { PersonalizarMensajeCabeceraPage } from "@/features/buzon/pages/PersonalizarMensajeCabeceraPage";
import { CargaMasivaPage } from "@/features/configuracion-alertas/pages/CargaMasivaPage";
import { ConsultaBloqueadosPage } from "@/features/configuracion-alertas/pages/ConsultaBloqueadosPage";
import { ActividadesEconomicasPage } from "@/features/configuraciones/actividad-economica/pages/ActividadesEconomicasPage";
import { PermisosPage } from "@/features/configuraciones/administracion/permisos/pages/PermisosPage";
import { RolesPage } from "@/features/configuraciones/administracion/roles/pages/RolesPage";
import { RolPermisosPage } from "@/features/configuraciones/administracion/roles/pages/RolPermisosPage";
import { UsuariosPage } from "@/features/configuraciones/administracion/usuarios/pages/UsuariosPage";
import { CanalesPagoPage } from "@/features/configuraciones/canales-pago/pages/CanalesPagoPage";
import { EdadesPage } from "@/features/configuraciones/edades/rangos-edad/pages/EdadesPage";
import { TiemposConstitucionPage } from "@/features/configuraciones/edades/tiempo-constitucion/pages/TiemposConstitucionPage";
import { ExperienciasActividadPage } from "@/features/configuraciones/experiencia-actividad/pages/ExperienciasActividadPage";
import { HistorialesCrediticiosPage } from "@/features/configuraciones/historial-crediticio/pages/HistorialesCrediticiosPage";
import { MatrizRiesgoPage } from "@/features/configuraciones/matriz-riesgo/pages/MatrizRiesgoPage";
import { PrestamosMontoPage } from "@/features/configuraciones/monto-credito/pages/PrestamosMontoPage";
import { OficialCumplimientoPage } from "@/features/configuraciones/oficial-cumplimiento/pages/OficialCumplimientoPage";
import { TiposPersonaPage } from "@/features/configuraciones/personas/pages/TiposPersonaPage";
import { DestinosRecursoPage } from "@/features/configuraciones/recursos/destino/pages/DestinosRecursoPage";
import { OrigenesRecursoPage } from "@/features/configuraciones/recursos/origen/pages/OrigenesRecursoPage";
import { TiposCreditoPage } from "@/features/configuraciones/tipos-credito/pages/TiposCreditoPage";
import { EntidadesPage } from "@/features/configuraciones/ubicacion-geografica/entidades/pages/EntidadesPage";
import { LocalidadesPage } from "@/features/configuraciones/ubicacion-geografica/localidades/pages/LocalidadesPage";
import { PaisesPage } from "@/features/configuraciones/ubicacion-geografica/paises/pages/PaisesPage";
import { ZonasGeograficasPage } from "@/features/configuraciones/ubicacion-geografica/zonas-geograficas/pages/ZonasGeograficasPage";
import { ControlPage } from "@/features/control/pages/ControlPage";
import { ConsultaListasPage } from "@/features/operacion/consulta-listas/pages/Quienesquien";
import { RevisionCoincidenciasPage } from "@/features/control/revision-coincidencias/pages/RevisionCoincidenciasPage";
import { EvaluacionRiesgoPage } from "@/features/operacion/evaluacion-riesgo/pages/EvaluacionRiesgoPage";
import { OperacionPage } from "@/features/operacion/pages/OperacionPage";
import { SeleccionarSucursalPage } from "@/features/sucursales/pages/SeleccionarSucursalPage";
import { RequireAuth } from "@/shared/auth/RequireAuth";
import { RequierePermiso } from "@/shared/auth/RequierePermiso";
import { RequireSucursal } from "@/shared/auth/RequireSucursal";
import { PlaceholderPage } from "@/shared/components/PlaceholderPage";
import { AppLayout } from "@/shared/layouts/AppLayout";
import { ContenidoAcotado } from "@/shared/layouts/ContenidoAcotado";
import { TenantRequeridoPage } from "@/shared/layouts/TenantRequeridoPage";
import { TenantRouteLayout } from "@/shared/layouts/TenantRouteLayout";

/**
 * Todas las rutas de negocio viven bajo `/SICANETSC/PLD/:tenantId/...`,
 * el mismo patrón que usa el backend. `TenantRouteLayout` es quien lee
 * `:tenantId` y lo deja disponible para el cliente de Axios antes de que
 * cualquier página hija dispare un request.
 *
 * Dentro del tenant: `login` y el buzón anónimo (`buzon/denuncias` y sus
 * alias) son públicos; lo demás exige sesión (`RequireAuth`), y las
 * pantallas de trabajo además exigen haber elegido sucursal
 * (`RequireSucursal`).
 */
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
          { path: "seleccionar-sucursal", element: <SeleccionarSucursalPage /> },
          {
            element: <RequireSucursal />,
            children: [
              {
                element: <AppLayout />,
                children: [
                  {
                    index: true,
                    element: <Navigate to="configuracion-alertas" replace />,
                  },
                  {
                    path: "configuraciones/ubicacion-geografica/zonas-geograficas",
                    element: <ZonasGeograficasPage />,
                  },
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
                  // {
                  //   path: "ayuda",
                  //   element: <AyudaPage />,
                  // },
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
                        path: "control/quienesquien",
                        element: <ConsultaListasPage />,
                      },
                      {
                        path: "control/coincidencias",
                        element: <RevisionCoincidenciasPage />,
                      },
                      {
                        path: "configuraciones/personas",
                        element: <TiposPersonaPage />,
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
                        path: "configuraciones/tipos-credito",
                        element: <TiposCreditoPage />,
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
