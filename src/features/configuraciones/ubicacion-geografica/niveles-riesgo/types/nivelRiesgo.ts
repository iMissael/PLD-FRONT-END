/**
 * Tipo del catálogo de Niveles de Riesgo (`CatNivelRiesgoController` /
 * `CatNivelRiesgoResponse` en `denuncias-app`). Es una excepción en el
 * backend: la respuesta usa `@JsonProperty` en snake_case en vez del
 * camelCase que usa el resto de los DTOs, así que estas llaves van tal cual
 * llegan del backend — no hay capa de transformación a camelCase.
 */
export interface NivelRiesgoResponse {
  id: number;
  nivel_riesgo_valor: number;
  nivel_riesgo_descripcion: string;
  valor_minimo: number;
  valor_maximo: number;
  estatus: string;
  created_at: string;
  updated_at: string;
}
