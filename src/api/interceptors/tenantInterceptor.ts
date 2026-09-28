import type { InternalAxiosRequestConfig } from "axios";

import { getCurrentTenantId } from "@/shared/tenant/tenantStore";
import { rutaTenant } from "@/shared/tenant/tenantPaths";

/**
 * Arma la URL real de cada request saliente y manda el tenant activo de las
 * dos formas que espera el backend:
 *
 *  1. Como prefijo de la URL: `/SICANETSC/PLD/{tenantId}/api` antes de la
 *     ruta relativa que pide cada función de `api/` (p. ej. `/personas-bloqueadas`
 *     queda en `/SICANETSC/PLD/{tenantId}/api/personas-bloqueadas`). Los
 *     controllers del backend cuelgan de `/api/...` y el prefijo del tenant
 *     se les antepone, así que sin el `/api` la ruta no existe.
 *  2. Como header `X-Tenant-Id`, que el backend usa para validar contra el
 *     segmento de la URL (ver TenantInterceptor.java del backend).
 *
 * El tenant sale de `tenantStore`, que `TenantRouteLayout` llena con el
 * `:tenantId` de la URL del front. Si no hay tenant activo es un bug de
 * configuración de rutas (una pantalla renderizando fuera de
 * `TenantRouteLayout`), así que se falla ruidosamente en vez de mandar un
 * request a medias.
 */
export function tenantInterceptor(
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  const tenantId = getCurrentTenantId();

  if (!tenantId) {
    throw new Error(
      "No hay un tenant activo: este request se disparó fuera de una ruta " +
        "bajo /SICANETSC/PLD/:tenantId. Revisa routes/router.tsx.",
    );
  }

  config.headers.set("X-Tenant-Id", tenantId);
  config.url = `${rutaTenant(tenantId, "api")}${config.url ?? ""}`;
  return config;
}
