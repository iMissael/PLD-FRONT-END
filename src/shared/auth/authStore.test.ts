import { afterEach, describe, expect, it } from "vitest";

import { useAuthStore } from "@/shared/auth/authStore";

const sesion = {
  token: "jwt",
  tokenType: "Bearer",
  expiresInSeconds: 3600,
  usuario: { id: 1, empleadoId: 1, username: "admin" },
  rol: { id: 1, nombre: "ROLE_ADMIN" },
  permisos: [{ recurso: "usuarios", accion: "crear" }],
};

describe("authStore", () => {
  afterEach(() => useAuthStore.getState().logout());

  it("una sesión solo vale para el tenant en el que se inició", () => {
    useAuthStore.getState().setSession("tenant-a", sesion, false);

    expect(useAuthStore.getState().isAuthenticated("tenant-a")).toBe(true);
    expect(useAuthStore.getState().isAuthenticated("tenant-b")).toBe(false);
  });

  it("cerrar sesión borra la sesión", () => {
    useAuthStore.getState().setSession("tenant-a", sesion, true);

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().isAuthenticated("tenant-a")).toBe(false);
  });
});
