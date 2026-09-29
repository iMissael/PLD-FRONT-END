import type { AxiosError, InternalAxiosRequestConfig } from "axios";

import { getAuthToken, useAuthStore } from "@/shared/auth/authStore";
import { getCurrentTenantId } from "@/shared/tenant/tenantStore";
import { rutaTenant } from "@/shared/tenant/tenantPaths";

/**
 * Manda el token de la sesión en cada request. Solo lo manda si la sesión es
 * del tenant de la URL: un token de otro tenant el backend lo rechazaría.
 */
export function authInterceptor(
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  const tenantId = getCurrentTenantId();
  const { token: storeToken, tenantId: tenantDeLaSesion } = useAuthStore.getState();
  const activeToken = storeToken || getAuthToken();

  if (activeToken && tenantId && (!tenantDeLaSesion || tenantDeLaSesion === tenantId)) {
    config.headers.set("Authorization", `Bearer ${activeToken}`);
    config.headers["Authorization"] = `Bearer ${activeToken}`;
  }
  return config;
}

/**
 * Si el backend contesta 401 fuera del login CON una sesión activa, esa
 * sesión venció o no es válida: se cierra y se vuelve al login del tenant.
 * Sin sesión activa (p. ej. una pantalla pública como el buzón anónimo que
 * de todos modos golpea un catálogo protegido) no hay nada que cerrar ni
 * de qué "expirar": se deja pasar el error para que lo maneje quien hizo
 * el request (varios catálogos públicos ya tienen su propio fallback local).
 */
export function unauthorizedInterceptor(error: AxiosError): Promise<never> {
  const esLogin = error.config?.url?.endsWith("/auth/login") ?? false;
  const tenantId = getCurrentTenantId();
  const haySesion = useAuthStore.getState().token !== null || getAuthToken() !== null;

  if (error.response?.status === 401 && !esLogin && tenantId && haySesion) {
    useAuthStore.getState().logout();
    window.location.assign(rutaTenant(tenantId, "login"));
  }
  return Promise.reject(error);
}
