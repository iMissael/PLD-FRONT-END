import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { TenantRequeridoPage } from "@/shared/layouts/TenantRequeridoPage";
import { TenantRouteLayout } from "@/shared/layouts/TenantRouteLayout";

// Dynamic imports with React.lazy for strict code splitting
const AuthWrapper = lazy(() =>
  import("./AuthWrapper").then((m) => ({ default: m.AuthWrapper })),
);
const AppLayout = lazy(() =>
  import("@/shared/layouts/AppLayout").then((m) => ({ default: m.AppLayout })),
);
const LoginPage = lazy(() =>
  import("@/features/auth/pages/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const BuzonPublicoPage = lazy(() =>
  import("@/features/buzon/pages/BuzonPublicoPage").then((m) => ({ default: m.BuzonPublicoPage })),
);
const GestionDenunciasPage = lazy(() =>
  import("@/features/buzon/pages/GestionDenunciasPage").then((m) => ({ default: m.GestionDenunciasPage })),
);
const GestionAlertasPage = lazy(() =>
  import("@/features/buzon/pages/GestionAlertasPage").then((m) => ({ default: m.GestionAlertasPage })),
);
const CargaMasivaPage = lazy(() =>
  import("@/features/configuracion-alertas/pages/CargaMasivaPage").then((m) => ({ default: m.CargaMasivaPage })),
);
const ConsultaBloqueadosPage = lazy(() =>
  import("@/features/configuracion-alertas/pages/ConsultaBloqueadosPage").then((m) => ({ default: m.ConsultaBloqueadosPage })),
);
const EntidadesPage = lazy(() =>
  import("@/features/configuraciones/ubicacion-geografica/entidades/pages/EntidadesPage").then((m) => ({ default: m.EntidadesPage })),
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
const ControlPage = lazy(() =>
  import("@/features/control/pages/ControlPage").then((m) => ({ default: m.ControlPage })),
);
const OperacionPage = lazy(() =>
  import("@/features/operacion/pages/OperacionPage").then((m) => ({ default: m.OperacionPage })),
);
const PlaceholderPage = lazy(() =>
  import("@/shared/components/PlaceholderPage").then((m) => ({ default: m.PlaceholderPage })),
);

export const router = createBrowserRouter([
  {
    path: "/SICANETSC/PLD/:tenantId",
    element: <TenantRouteLayout />,
    children: [
      // Formulario Público de Denuncia Anónima (Sin login)
      {
        path: "buzon/denuncias",
        element: <BuzonPublicoPage />,
      },
      {
        path: "buzon-denuncias",
        element: <BuzonPublicoPage />,
      },
      {
        path: "buzon-anonimo",
        element: <BuzonPublicoPage />,
      },
      {
        element: <AuthWrapper />,
        children: [
          {
            path: "login",
            element: <LoginPage />,
          },
          {
            element: <AppLayout />,
            children: [
              { index: true, element: <Navigate to="buzon/gestion" replace /> },
              // Consola de Administración y Dictaminación (Protegida)
              {
                path: "buzon/gestion",
                element: (
                  <ProtectedRoute recurso="denuncias" accion="ver">
                    <GestionDenunciasPage />
                  </ProtectedRoute>
                ),
              },
              {
                path: "buzon/alertas",
                element: (
                  <ProtectedRoute recurso="alertas" accion="ver">
                    <GestionAlertasPage />
                  </ProtectedRoute>
                ),
              },
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
    ],
  },
  { path: "*", element: <TenantRequeridoPage /> },
]);
