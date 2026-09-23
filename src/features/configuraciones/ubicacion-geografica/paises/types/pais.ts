/**
 * Tipos del feature `paises`, a partir de `PaisController` / sus DTOs en
 * `denuncias-app`. A diferencia de la pantalla legacy (que usa un solo
 * combo de "Zona"), el backend modela `zonaIds` como una lista — un país
 * puede pertenecer a varias zonas de riesgo — así que el front usa un
 * multi-select en vez del combo simple del sistema de escritorio.
 */

/** Igual a `CrearCatPaisRequest`. `codigoIso` es opcional (columna nullable). */
export interface CrearPaisInput {
  tipo: string;
  codigoIso: string;
  nombre: string;
  nacionalidad: string;
  zonaIds: string[];
}

/** Igual a `ActualizarCatPaisRequest`. */
export interface ActualizarPaisInput {
  tipo: string;
  codigoIso: string;
  nombre: string;
  nacionalidad: string;
  zonaIds: string[];
}

/** Igual a `CatPaisResponse`. */
export interface PaisResponse {
  idPais: string;
  tipo: string;
  codigoIso: string;
  nombre: string;
  nacionalidad: string;
  zonasAsignadas: string[];
  createdAt: string;
  updatedAt: string;
}
