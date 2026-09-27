/**
 * Tipo del catálogo de Niveles de Riesgo (`CatNivelRiesgoController` /
 * `CatNivelRiesgoResponse` en `denuncias-app`). El backend expone todos los
 * catálogos en camelCase, igual que los DTOs de geográfico, así que estas
 * llaves van tal cual llegan — no hay capa de transformación.
 */
export interface NivelRiesgoResponse {
  id: number;
  nivelRiesgoValor: number;
  nivelRiesgoDescripcion: string;
  valorMinimo: number;
  valorMaximo: number;
  estatus: string;
  createdAt: string;
  updatedAt: string;
}
