import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";

import { setCurrentTenantId } from "@/shared/tenant/tenantStore";
import { TEST_TENANT_ID } from "@/test/mocks/handlers";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function AllProviders({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

export function renderWithProviders(ui: ReactElement) {
  // En la app real lo hace TenantRouteLayout al navegar; aquí se monta sin él.
  setCurrentTenantId(TEST_TENANT_ID);
  return render(ui, { wrapper: AllProviders });
}

export * from "@testing-library/react";
