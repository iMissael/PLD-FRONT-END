/**
 * Tipos del feature `peps` (menú: "Configuración de PEPs"), a partir de
 * `CatPepsController` en `denuncias-app`.
 *
 * Ojo: hay **dos** catálogos de PEP y son distintos. Este es `cat_peps`
 * (`/catalogos/peps`), la condición de persona políticamente expuesta, y es el
 * que `EvaluadorSubfactor` lee para puntuar el subfactor 6. El otro es
 * `cat_puestos_peps` (`/catalogos/puestos-peps`), el puesto que ocupa, que ya
 * no interviene en la evaluación y no tiene pantalla.
 *
 * El catálogo es cerrado: no hay alta ni baja desde el front, solo el ajuste
 * del nivel de riesgo. Por eso no existen `CrearPepInput` ni
 * `ActualizarPepInput`.
 */

/**
 * Valores del enum `Estatus` del backend: A=Activo, B=Baja, S=Suspendido,
 * E=Eliminado. El soft-delete escribe `E`; `S` no se usa en este catálogo.
 */
export type EstatusPep = "A" | "B" | "S" | "E";

/**
 * Valores aceptados por `tipo_pep`. El backend los valida en
 * `TipoPepValidador`; la columna es NOT NULL con default `NINGUNO`.
 *
 * Se muestra pero no se captura: el formulario solo ajusta el nivel de riesgo.
 */
export type TipoPep = "NACIONAL" | "INTERNACIONAL" | "NINGUNO";

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

/**
 * Único cambio que admite la pantalla. Viaja por el `PUT /{id}` general con
 * solo este campo: el backend hace actualización parcial, así que `nombre`,
 * `tipoPep` y `estatus` llegan en null y conservan su valor guardado.
 */
export interface CambiarNivelRiesgoPepInput {
  catNivelRiesgoId: number;
}

/** Etiquetas de `tipoPep` para la interfaz; el valor crudo va al backend. */
export const ETIQUETAS_TIPO_PEP: Record<TipoPep, string> = {
  NACIONAL: "Nacional",
  INTERNACIONAL: "Internacional",
  NINGUNO: "Ninguno",
};
