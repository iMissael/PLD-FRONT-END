/**
 * Tipos del feature `recursos/origen` (menú: "Configuración de recursos ›
 * Origen"), a partir de `CatOrigenRecursoController` en `denuncias-app`.
 *
 * La columna `descripcion` existió en la tabla pero nunca se usó (siempre
 * NULL) y se retiró del esquema, del backend y de aquí: el catálogo se
 * identifica solo por `nombre`.
 */

/** A=Activo, I=Inactivo, B=Baja (borrado lógico). */
export type EstatusOrigenRecurso = "A" | "I" | "B";

/**
 * Igual a `CrearCatOrigenRecursoRequest`. Sin `id`: lo genera el adaptador
 * como consecutivo.
 */
export interface CrearOrigenRecursoInput {
  nombre: string;
  catNivelRiesgoId: number;
  estatus: EstatusOrigenRecurso;
}

/** Igual a `ActualizarCatOrigenRecursoRequest` (mismo shape que Crear). */
export type ActualizarOrigenRecursoInput = CrearOrigenRecursoInput;

/** Igual a `CatOrigenRecursoResponse`. */
export interface OrigenRecursoResponse {
  id: string;
  nombre: string;
  catNivelRiesgoId: number;
  estatus: EstatusOrigenRecurso;
  createdAt: string;
  updatedAt: string;
}
