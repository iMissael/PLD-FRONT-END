import { apiClient } from "@/api/client";

import type { MunicipioResponse } from "../types/localidad";

const BASE_PATH = "/catalogos/municipios";

/**
 * `MunicipioController` tiene CRUD completo, pero en el front es solo un
 * buscador: no hay pantalla de menú propia para Municipios, se usa
 * únicamente como filtro en cascada (Entidad -> Municipio) dentro de
 * Localidades. Colocado aquí porque no se usa en ningún otro lado.
 */
export async function listarMunicipios(params?: {
  busqueda?: string;
  filtrarPor?: string;
  entidadId?: string;
}): Promise<MunicipioResponse[]> {
  const { data } = await apiClient.get<MunicipioResponse[]>(BASE_PATH, { params });
  return data;
}
