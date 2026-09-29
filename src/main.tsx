import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { router } from "@/routes/router";
import { Toaster } from "@/shared/components/ui/sonner";

import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Los datos del backend de compliance cambian con poca frecuencia
      // relativa al ritmo de consulta; evita refetch agresivo por defecto.
      staleTime: 30_000,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
);
