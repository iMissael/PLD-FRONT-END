/** Segmento fijo que el backend antepone a todas sus rutas de negocio. */
export const TENANT_BASE_PATH = "/SICANETSC/PLD";

/**
 * Ruta del front (o del backend) dentro de un tenant:
 * `rutaTenant("abc", "login")` → `/SICANETSC/PLD/abc/login`.
 */
export function rutaTenant(tenantId: string, subruta = ""): string {
  const limpia = subruta.replace(/^\/+/, "");
  return limpia
    ? `${TENANT_BASE_PATH}/${tenantId}/${limpia}`
    : `${TENANT_BASE_PATH}/${tenantId}`;
}
