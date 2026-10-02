import { listarCatalogoCompleto } from "@/api/paginacion";

import type { MunicipioResponse } from "../types/localidad";

const BASE_PATH = "/catalogos/municipios";

/**
 * `MunicipioController` tiene CRUD completo, pero en el front es solo un
 * buscador: no hay pantalla de menú propia para Municipios, se usa
 * únicamente como filtro en cascada (Entidad -> Municipio) dentro de
 * Localidades. Colocado aquí porque no se usa en ningún otro lado. El
 * endpoint pagina (cat_municipio tiene ~2,478 filas): se traen todas las
 * páginas porque este selector necesita el catálogo completo de la entidad.
 */
export async function listarMunicipios(params?: {
  busqueda?: string;
  filtrarPor?: string;
  entidadId?: string;
}): Promise<MunicipioResponse[]> {
  return listarCatalogoCompleto<MunicipioResponse>(BASE_PATH, params);
}
