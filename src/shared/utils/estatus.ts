/**
 * Etiquetas del enum `Estatus` del backend, unificado en el commit
 * `a517626f` para usuarios, roles y permisos además de los catálogos.
 *
 * Antes esos tres DTOs devolvían "ACTIVO"/"ELIMINADO" y la interfaz comparaba
 * contra esos textos. Al unificarse el enum la comparación dejó de empatar en
 * silencio —el badge siempre caía en "inactivo"— porque `schema.d.ts` todavía
 * tipaba el campo como texto libre y TypeScript no podía detectarlo.
 */
export type Estatus = "A" | "B" | "S" | "E";

const ETIQUETAS: Record<Estatus, string> = {
  A: "Activo",
  B: "Baja",
  S: "Suspendido",
  E: "Eliminado",
};

/** Etiqueta legible; devuelve un guion si el estatus viene vacío o es desconocido. */
export function etiquetaEstatus(estatus: string | undefined | null): string {
  if (!estatus) return "—";
  return ETIQUETAS[estatus as Estatus] ?? estatus;
}

/** Solo `A` cuenta como vigente. */
export function esEstatusActivo(estatus: string | undefined | null): boolean {
  return estatus === "A";
}
