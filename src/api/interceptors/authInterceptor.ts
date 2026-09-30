import type { AxiosError, InternalAxiosRequestConfig } from "axios";

import { useAuthStore } from "@/shared/auth/authStore";
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
  const { token, tenantId: tenantDeLaSesion } = useAuthStore.getState();

  if (token && tenantId && tenantDeLaSesion === tenantId) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
}

export function unauthorizedInterceptor(error: AxiosError): Promise<never> {
  const esLogin = error.config?.url?.endsWith("/auth/login") ?? false;
  const tenantId = getCurrentTenantId();
  const haySesion = useAuthStore.getState().token !== null;

  if (error.response?.status === 401 && !esLogin && tenantId && haySesion) {
    useAuthStore.getState().logout();
    window.location.assign(rutaTenant(tenantId, "login"));
  }
  return Promise.reject(error);
}
