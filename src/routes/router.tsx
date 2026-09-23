import { createBrowserRouter, Navigate } from "react-router-dom";

import { CargaMasivaPage } from "@/features/configuracion-alertas/pages/CargaMasivaPage";
import { ConsultaBloqueadosPage } from "@/features/configuracion-alertas/pages/ConsultaBloqueadosPage";
import { EntidadesPage } from "@/features/configuraciones/ubicacion-geografica/entidades/pages/EntidadesPage";
import { LocalidadesPage } from "@/features/configuraciones/ubicacion-geografica/localidades/pages/LocalidadesPage";
import { PaisesPage } from "@/features/configuraciones/ubicacion-geografica/paises/pages/PaisesPage";
import { ZonasGeograficasPage } from "@/features/configuraciones/ubicacion-geografica/zonas-geograficas/pages/ZonasGeograficasPage";
import { ControlPage } from "@/features/control/pages/ControlPage";
import { OperacionPage } from "@/features/operacion/pages/OperacionPage";
import { PlaceholderPage } from "@/shared/components/PlaceholderPage";
import { AppLayout } from "@/shared/layouts/AppLayout";
import { TenantRequeridoPage } from "@/shared/layouts/TenantRequeridoPage";
import { TenantRouteLayout } from "@/shared/layouts/TenantRouteLayout";

/**
 * Todas las rutas de negocio viven bajo `/SICANETSC/PLD/:tenantId/...`,
 * el mismo patrón que usa el backend. `TenantRouteLayout` es quien lee
 * `:tenantId` y lo deja disponible para el cliente de Axios antes de que
 * cualquier página hija dispare un request.
 */
export const router = createBrowserRouter([
  {
    path: "/SICANETSC/PLD/:tenantId",
    element: <TenantRouteLayout />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="configuracion-alertas" replace /> },
          {
            path: "configuraciones/oficial-cumplimiento",
            element: (
              <PlaceholderPage
                title="Configuración del oficial de cumplimiento"
                description="Datos y parámetros del oficial de cumplimiento. Pendiente de definir."
              />
            ),
          },
          {
            path: "configuraciones/ubicacion-geografica/zonas-geograficas",
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
            path: "configuraciones/personas",
            element: (
              <PlaceholderPage
                title="Configuración de personas"
                description="Parámetros de personas del sistema. Pendiente de definir."
              />
            ),
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
        ],
      },
    ],
  },
  { path: "*", element: <TenantRequeridoPage /> },
]);
