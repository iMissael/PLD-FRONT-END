import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it } from "vitest";

import { setCurrentTenantId } from "@/shared/tenant/tenantStore";
import { TEST_TENANT_ID } from "@/test/mocks/handlers";

import { ConsultaBloqueadosPage } from "./ConsultaBloqueadosPage";

function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("ConsultaBloqueadosPage", () => {
  beforeEach(() => {
    // En la app real esto lo hace TenantRouteLayout al navegar; aquí el
    // componente se monta sin router, así que se fija a mano.
    setCurrentTenantId(TEST_TENANT_ID);
  });

  it("no busca nada hasta que el usuario ingresa un criterio y envía", () => {
    renderWithQueryClient(<ConsultaBloqueadosPage />);

    expect(
      screen.getByText(/ingresa al menos un criterio.*presiona "buscar"/i),
    ).toBeInTheDocument();
  });

  it("muestra un error si se envía el formulario sin criterios", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<ConsultaBloqueadosPage />);

    await user.click(screen.getByRole("button", { name: /buscar/i }));

    expect(
      await screen.findByText(/ingresa al menos un criterio de búsqueda/i),
    ).toBeInTheDocument();
  });

  it("busca por nombre y muestra los resultados del backend (mockeado con MSW)", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<ConsultaBloqueadosPage />);

    await user.type(screen.getByLabelText(/nombre/i), "Juan Pérez");
    await user.click(screen.getByRole("button", { name: /buscar/i }));

    expect(await screen.findByText("Juan Pérez López")).toBeInTheDocument();
    expect(screen.getByText("PELJ800101ABC")).toBeInTheDocument();
    expect(screen.getByText("Coincidencia directa")).toBeInTheDocument();
  });
});
