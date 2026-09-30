/**
 * Tipos del feature `recursos/destino` (menú: "Configuración de recursos ›
 * Destino"), a partir de `CatDestinoRecursoController` en `denuncias-app`.
 *
 * El contrato es idéntico al de `recursos/origen`: el catálogo se identifica
 * solo por `nombre` y su nivel de riesgo asociado.
 */

/** Valores del enum `Estatus` del backend. El formulario solo ofrece A y B. */
export type EstatusDestinoRecurso = "A" | "B" | "S" | "E";

/**
 * Igual a `CrearCatDestinoRecursoRequest`. Sin `id`: lo genera el adaptador
 * como consecutivo.
 */
export interface CrearDestinoRecursoInput {
  nombre: string;
  catNivelRiesgoId: number;
  estatus: EstatusDestinoRecurso;
}

/** Igual a `ActualizarCatDestinoRecursoRequest` (mismo shape que Crear). */
export type ActualizarDestinoRecursoInput = CrearDestinoRecursoInput;

/** Igual a `CatDestinoRecursoResponse`. */
export interface DestinoRecursoResponse {
  id: string;
  nombre: string;
  catNivelRiesgoId: number;
  estatus: EstatusDestinoRecurso;
  createdAt: string;
  updatedAt: string;
}
