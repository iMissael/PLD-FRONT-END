/**
 * Tipos del feature `localidades`, a partir de `LocalidadController` /
 * `MunicipioController` y sus DTOs en `denuncias-app`.
 *
 * Alcance confirmado con el usuario: esta pantalla es solo consulta +
 * cambio de nivel de riesgo (`PUT /{id}/nivel-riesgo`) — no hay alta ni
 * edición completa de localidades todavía (el legacy tampoco tiene botón
 * "+" aquí). `TipoAsentamiento` (enum de dominio, usado en
 * `CrearCatLocalidadRequest`/`ActualizarCatLocalidadRequest`) nunca se
 * confirmó porque no hace falta para este alcance.
 */

/** Igual a `CambiarCatNivelRiesgoLocalidadRequest`. */
export interface CambiarNivelRiesgoLocalidadInput {
  nivelRiesgoId: number;
}

/**
 * Igual a `PaginaResponse<T>` del backend.
 *
 * `cat_localidad` tiene ~296 mil filas activas, así que el listado es
 * paginado **del lado del servidor** — a diferencia de los catálogos chicos,
 * aquí no se puede traer todo y filtrar en memoria.
 */
export interface PaginaResponse<T> {
  contenido: T[];
  pagina: number;
  tamanio: number;
  totalElementos: number;
  totalPaginas: number;
}

/**
 * Igual a `CatLocalidadResponse`. `idLocalidad`/`idMunicipio` son texto
 * (consecutivo VARCHAR(10)), igual que el resto del catálogo geográfico.
 */
export interface LocalidadResponse {
  idLocalidad: string;
  idMunicipio: string;
  nombreMunicipio: string;
  nombre: string;
  tipoAsentamiento: string;
  idNivelRiesgo: number;
  nivelRiesgoValor: number;
  nivelRiesgoDescripcion: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Igual a `CatMunicipioResponse`. Búsqueda de solo lectura, usada en cascada
 * desde Entidad. `id`/`entidadId` son texto (consecutivo VARCHAR(10)), igual
 * que País/Zona/Entidad; `claveInegi` ya no existe en esta tabla.
 */
export interface MunicipioResponse {
  id: string;
  entidadId: string;
  nombreEntidad: string;
  nombre: string;
  createdAt: string;
  updatedAt: string;
}
