/**
 * Tenant activo de la sesión actual, leído de la URL (`:tenantId` en
 * `router.tsx`) y consumido por `tenantInterceptor.ts`.
 *
 * Es una variable de módulo (no un store de React) a propósito: el
 * interceptor de Axios corre fuera del árbol de React y necesita leer el
 * valor de forma síncrona en cada request, sin engancharse a hooks.
 * `TenantRouteLayout` es el único lugar que la actualiza.
 */
let currentTenantId: string | null = null;

export function setCurrentTenantId(tenantId: string): void {
  currentTenantId = tenantId;
}

export function getCurrentTenantId(): string | null {
  return currentTenantId;
}

/** Solo para tests: vuelve a dejar el store como si nunca se hubiera navegado. */
export function resetCurrentTenantId(): void {
  currentTenantId = null;
}
