import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { AxiosHeaders } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthStore } from "@/shared/auth/authStore";
import { resetCurrentTenantId, setCurrentTenantId } from "@/shared/tenant/tenantStore";

import { authInterceptor, unauthorizedInterceptor } from "./authInterceptor";

const sesion = {
  token: "jwt-de-prueba",
  tokenType: "Bearer",
  expiresInSeconds: 3600,
  usuario: { id: "u1", username: "admin", nombre: "Admin", correo: null },
  rol: { id: "r1", nombre: "ROLE_ADMIN" },
  permisos: [],
};

function config(): InternalAxiosRequestConfig {
  return { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
}

function error(status: number, url: string): AxiosError {
  return { config: { url }, response: { status } } as AxiosError;
}

describe("authInterceptor", () => {
  beforeEach(() => setCurrentTenantId("tenant-a"));
  afterEach(() => {
    useAuthStore.getState().logout();
    resetCurrentTenantId();
  });

  it("manda el token cuando la sesión es del tenant actual", () => {
    useAuthStore.getState().setSession("tenant-a", sesion, false);

    expect(authInterceptor(config()).headers.get("Authorization")).toBe(
      "Bearer jwt-de-prueba",
    );
  });

  it("no manda el token de una sesión de otro tenant", () => {
    useAuthStore.getState().setSession("tenant-b", sesion, false);

    expect(authInterceptor(config()).headers.get("Authorization")).toBeUndefined();
  });

  it("no manda nada sin sesión", () => {
    expect(authInterceptor(config()).headers.get("Authorization")).toBeUndefined();
  });
});

describe("unauthorizedInterceptor", () => {
  const asignar = vi.fn();

  beforeEach(() => {
    setCurrentTenantId("tenant-a");
    useAuthStore.getState().setSession("tenant-a", sesion, false);
    vi.stubGlobal("location", { assign: asignar });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    asignar.mockClear();
    useAuthStore.getState().logout();
    resetCurrentTenantId();
  });

  it("cierra la sesión y vuelve al login del tenant ante un 401", async () => {
    await expect(
      unauthorizedInterceptor(error(401, "/SICANETSC/PLD/tenant-a/usuarios")),
    ).rejects.toBeDefined();

    expect(useAuthStore.getState().token).toBeNull();
    expect(asignar).toHaveBeenCalledWith("/SICANETSC/PLD/tenant-a/login");
  });

  it("no cierra la sesión por un 401 del propio login (credenciales malas)", async () => {
    await expect(
      unauthorizedInterceptor(error(401, "/SICANETSC/PLD/tenant-a/auth/login")),
    ).rejects.toBeDefined();

    expect(useAuthStore.getState().token).toBe("jwt-de-prueba");
    expect(asignar).not.toHaveBeenCalled();
  });

  it("deja pasar otros errores sin tocar la sesión", async () => {
    await expect(
      unauthorizedInterceptor(error(500, "/SICANETSC/PLD/tenant-a/usuarios")),
    ).rejects.toBeDefined();

    expect(useAuthStore.getState().token).toBe("jwt-de-prueba");
    expect(asignar).not.toHaveBeenCalled();
  });

  it("sin sesión activa, un 401 no redirige (p. ej. un catálogo protegido desde una pantalla pública)", async () => {
    useAuthStore.getState().logout();

    await expect(
      unauthorizedInterceptor(error(401, "/SICANETSC/PLD/tenant-a/catalogos/tipos-alerta/buzon")),
    ).rejects.toBeDefined();

    expect(asignar).not.toHaveBeenCalled();
  });
});
