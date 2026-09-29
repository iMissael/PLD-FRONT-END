import { afterEach, describe, expect, it } from "vitest";

import { useAuthStore } from "@/shared/auth/authStore";
import { useSucursalActivaStore } from "@/shared/auth/sucursalActivaStore";

const sesion = {
  token: "jwt",
  tokenType: "Bearer",
  expiresInSeconds: 3600,
  usuario: { id: "u1", username: "admin", nombre: "Admin", correo: null },
  rol: { id: "r1", nombre: "ROLE_ADMIN" },
  permisos: [{ recurso: "usuarios", accion: "crear" }],
};

describe("authStore", () => {
  afterEach(() => useAuthStore.getState().logout());

  it("una sesión solo vale para el tenant en el que se inició", () => {
    useAuthStore.getState().setSession("tenant-a", sesion, false);

    expect(useAuthStore.getState().isAuthenticated("tenant-a")).toBe(true);
    expect(useAuthStore.getState().isAuthenticated("tenant-b")).toBe(false);
  });

  it("una sesión nueva vuelve a pedir la sucursal", () => {
    useSucursalActivaStore.getState().setSucursalActiva({ id: "s1", nombre: "Matriz" });

    useAuthStore.getState().setSession("tenant-a", sesion, false);

    expect(useSucursalActivaStore.getState().sucursalActiva).toBeNull();
  });

  it("cerrar sesión borra la sesión y la sucursal", () => {
    useAuthStore.getState().setSession("tenant-a", sesion, true);
    useSucursalActivaStore.getState().setSucursalActiva({ id: "s1", nombre: "Matriz" });

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().isAuthenticated("tenant-a")).toBe(false);
    expect(useSucursalActivaStore.getState().sucursalActiva).toBeNull();
  });
});
