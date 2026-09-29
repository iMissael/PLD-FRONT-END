import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";

import { useAuthStore } from "@/shared/auth/authStore";
import { RequireAuth } from "@/shared/auth/RequireAuth";
import { RequireSucursal } from "@/shared/auth/RequireSucursal";

const sesion = {
  token: "jwt",
  tokenType: "Bearer",
  expiresInSeconds: 3600,
  usuario: { id: "u1", username: "admin", nombre: "Admin", correo: null },
  rol: { id: "r1", nombre: "ROLE_ADMIN" },
  permisos: [],
};

function montar(ruta: string) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route path="/SICANETSC/PLD/:tenantId">
          <Route path="login" element={<p>pantalla de login</p>} />
          <Route element={<RequireAuth />}>
            <Route path="seleccionar-sucursal" element={<p>elige sucursal</p>} />
            <Route element={<RequireSucursal />}>
              <Route path="operacion" element={<p>contenido privado</p>} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("RequireAuth y RequireSucursal", () => {
  afterEach(() => useAuthStore.getState().logout());

  it("sin sesión lleva al login del mismo tenant", () => {
    montar("/SICANETSC/PLD/tenant-a/operacion");

    expect(screen.getByText("pantalla de login")).toBeInTheDocument();
  });

  it("con sesión de otro tenant también lleva al login", () => {
    useAuthStore.getState().setSession("tenant-b", sesion, false);

    montar("/SICANETSC/PLD/tenant-a/operacion");

    expect(screen.getByText("pantalla de login")).toBeInTheDocument();
  });

  it("con sesión deja ver el contenido directamente sin exigir sucursal", () => {
    useAuthStore.getState().setSession("tenant-a", sesion, false);

    montar("/SICANETSC/PLD/tenant-a/operacion");

    expect(screen.getByText("contenido privado")).toBeInTheDocument();
  });
});
