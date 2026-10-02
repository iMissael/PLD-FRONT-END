import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { LoginForm } from "@/features/auth/components/LoginForm";
import { useAuthStore } from "@/shared/auth/authStore";
import { Toaster } from "@/shared/components/ui/sonner";
import { setCurrentTenantId } from "@/shared/tenant/tenantStore";
import { TEST_TENANT_ID } from "@/test/mocks/handlers";

function montar() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/SICANETSC/PLD/${TEST_TENANT_ID}/login`]}>
        <Routes>
          <Route path="/SICANETSC/PLD/:tenantId/login" element={<LoginForm />} />
          <Route path="/SICANETSC/PLD/:tenantId" element={<p>dashboard</p>} />
        </Routes>
      </MemoryRouter>
      <Toaster />
    </QueryClientProvider>,
  );
}

describe("LoginForm", () => {
  beforeEach(() => setCurrentTenantId(TEST_TENANT_ID));
  afterEach(() => useAuthStore.getState().logout());

  it("con credenciales correctas guarda la sesión del tenant y entra directo al dashboard", async () => {
    const user = userEvent.setup();
    montar();

    await user.type(screen.getByLabelText("Usuario"), "admin");
    await user.type(screen.getByLabelText("Contraseña"), "Admin123!");
    await user.click(screen.getByRole("button", { name: /acceder/i }));

    expect(await screen.findByText("dashboard")).toBeInTheDocument();
    expect(useAuthStore.getState().isAuthenticated(TEST_TENANT_ID)).toBe(true);
  });

  it("con credenciales incorrectas avisa y no guarda sesión", async () => {
    const user = userEvent.setup();
    montar();

    await user.type(screen.getByLabelText("Usuario"), "admin");
    await user.type(screen.getByLabelText("Contraseña"), "mala");
    await user.click(screen.getByRole("button", { name: /acceder/i }));

    await waitFor(() =>
      expect(screen.getByText("Usuario o contraseña incorrectos")).toBeInTheDocument(),
    );
    expect(useAuthStore.getState().token).toBeNull();
  });

  it("no envía el formulario vacío", async () => {
    const user = userEvent.setup();
    montar();

    await user.click(screen.getByRole("button", { name: /acceder/i }));

    expect(await screen.findByText("El usuario es obligatorio")).toBeInTheDocument();
    expect(screen.getByText("La contraseña es obligatoria")).toBeInTheDocument();
  });
});
