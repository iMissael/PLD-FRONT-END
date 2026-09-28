/**
 * Tipos del feature `actividad-economica` (menú: "Configuración de actividad
 * económica"), a partir de `CatActividadEconomicaController` en
 * `denuncias-app`.
 *
 * Este catálogo es el más grande del sistema (~1,261 registros) y el backend
 * no expone paginación ni búsqueda: `GET` devuelve todo. El filtrado y la
 * paginación se hacen en el cliente.
 */

/**
 * Valores del enum `Estatus` del backend: A=Activa, B=Baja, S=Suspendido,
 * E=Eliminado. El formulario solo ofrece A y B.
 */
export type EstatusActividadEconomica = "A" | "B" | "S" | "E";

/**
 * Igual a `CrearCatActividadEconomicaRequest`.
 *
 * `esActividadVulnerable` es `@NotNull` en el backend pero no se captura en
 * esta pantalla: en el alta va en `false` (el valor de los 1,261 registros
 * actuales) y en la edición se reenvía el valor que ya tenía el registro,
 * para no apagar la bandera sin querer.
 */
export interface CrearActividadEconomicaInput {
  claveSat: string;
  descripcion: string;
  esActividadVulnerable: boolean;
  catNivelRiesgoId: number;
  estatus: EstatusActividadEconomica;
}

/** Igual a `ActualizarCatActividadEconomicaRequest` (mismo shape que Crear). */
export type ActualizarActividadEconomicaInput = CrearActividadEconomicaInput;

/** Igual a `CatActividadEconomicaResponse`. */
export interface ActividadEconomicaResponse {
  id: string;
  claveSat: string;
  descripcion: string;
  esActividadVulnerable: boolean;
  catNivelRiesgoId: number;
  estatus: EstatusActividadEconomica;
  createdAt: string;
  updatedAt: string;
}
