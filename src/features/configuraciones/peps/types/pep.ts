/**
 * Tipos del feature `peps` (menú: "Configuración de PEPs"), a partir de
 * `CatPepsController` en `denuncias-app`.
 *
 * Ojo: hay **dos** catálogos de PEP y son distintos. Este es `cat_peps`
 * (`/catalogos/peps`), la condición de persona políticamente expuesta. El otro
 * es `cat_puestos_peps` (`/catalogos/puestos-peps`), el puesto que ocupa, y
 * todavía no tiene pantalla.
 */

/**
 * Valores del enum `Estatus` del backend: A=Activo, B=Baja, S=Suspendido,
 * E=Eliminado. El formulario solo ofrece A y B — `E` lo escribe el soft-delete
 * del backend y `S` no se usa en este catálogo.
 */
export type EstatusPep = "A" | "B" | "S" | "E";

/**
 * Valores aceptados por `tipo_pep`. El backend los valida en
 * `TipoPepValidador`; la columna es NOT NULL con default `NINGUNO`.
 */
export type TipoPep = "NACIONAL" | "INTERNACIONAL" | "NINGUNO";

/** Igual a `CrearCatPepsRequest`. Sin `id`: lo genera el adaptador como consecutivo. */
export interface CrearPepInput {
  nombre: string;
  catNivelRiesgoId: number;
  tipoPep: TipoPep;
  estatus: EstatusPep;
}

/** Igual a `ActualizarCatPepsRequest` (mismo shape que Crear). */
export type ActualizarPepInput = CrearPepInput;

/** Igual a `CatPepsResponse`. */
export interface PepResponse {
  id: string;
  nombre: string;
  catNivelRiesgoId: number;
  tipoPep: TipoPep;
  estatus: EstatusPep;
  createdAt: string;
  updatedAt: string;
}

/** Etiquetas de `tipoPep` para la interfaz; el valor crudo va al backend. */
export const ETIQUETAS_TIPO_PEP: Record<TipoPep, string> = {
  NACIONAL: "Nacional",
  INTERNACIONAL: "Internacional",
  NINGUNO: "Ninguno",
};
