import { afterEach, describe, expect, it } from "vitest";

import { esRolAdmin, useAuthStore } from "@/shared/auth/authStore";

const sesion = {
  token: "jwt",
  tokenType: "Bearer",
  expiresInSeconds: 3600,
  usuario: { id: 1, username: "admin", nombre: "Admin", correo: null },
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

  it("el rol Administrador sembrado pasa sin permisos asignados", () => {
    useAuthStore
      .getState()
      .setSession("tenant-a", { ...sesion, rol: { id: 1, nombre: "Administrador" }, permisos: [] }, false);

    expect(useAuthStore.getState().hasPermission("permisos", "crear")).toBe(true);
  });

  it("otro rol necesita el permiso exacto", () => {
    useAuthStore
      .getState()
      .setSession("tenant-a", { ...sesion, rol: { id: 2, nombre: "Analista" } }, false);

    expect(useAuthStore.getState().hasPermission("usuarios", "crear")).toBe(true);
    expect(useAuthStore.getState().hasPermission("usuarios", "eliminar")).toBe(false);
  });

  it("reconoce los nombres de administrador sin importar mayúsculas", () => {
    expect(esRolAdmin("ROLE_ADMIN")).toBe(true);
    expect(esRolAdmin("administrador")).toBe(true);
    expect(esRolAdmin("Oficial de Cumplimiento")).toBe(false);
    expect(esRolAdmin(undefined)).toBe(false);
  });
});
