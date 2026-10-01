import type { InternalAxiosRequestConfig } from "axios";

import { getCurrentTenantId } from "@/shared/tenant/tenantStore";
import { rutaTenant } from "@/shared/tenant/tenantPaths";

declare module "axios" {
  export interface AxiosRequestConfig {
    /** Rutas públicas (p. ej. el nombre del tenant en login) sin prefijo ni header de tenant. */
    skipTenantInterceptor?: boolean;
  }
}

export function tenantInterceptor(
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  // Rutas públicas (datos del tenant en login, etc.) no llevan prefijo ni header
  if (config.skipTenantInterceptor) {
    return config;
  }

  const tenantId = getCurrentTenantId();

  if (!tenantId) {
    throw new Error(
      "No hay un tenant activo: este request se disparó fuera de una ruta " +
        "bajo /SICANETSC/PLD/:tenantId. Revisa routes/router.tsx.",
    );
  }

  config.headers.set("X-Tenant-Id", tenantId);
  config.url = `${rutaTenant(tenantId)}${config.url ?? ""}`;
  return config;
}