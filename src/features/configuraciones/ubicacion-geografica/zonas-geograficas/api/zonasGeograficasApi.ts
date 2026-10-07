import { apiClient } from "@/api/client";
import { listarCatalogoCompleto } from "@/api/paginacion";

import type {
  ActualizarZonaGeograficaInput,
  CrearZonaGeograficaInput,
  EntidadAsignadaResponse,
  EstatusZona,
  ZonaGeograficaResponse,
} from "../types/zonaGeografica";

const BASE_PATH = "/catalogos/zonas-geograficas";

// El endpoint pagina: se traen todas las páginas porque esta tabla todavía no
// tiene controles de paginación propios.
export async function listarZonas(
  estatus?: EstatusZona,
): Promise<ZonaGeograficaResponse[]> {
  return listarCatalogoCompleto<ZonaGeograficaResponse>(
    BASE_PATH,
    estatus ? { estatus } : undefined,
  );
}

export async function obtenerZona(id: string): Promise<ZonaGeograficaResponse> {
  const { data } = await apiClient.get<ZonaGeograficaResponse>(`${BASE_PATH}/${id}`);
  return data;
}

export async function crearZona(
  input: CrearZonaGeograficaInput,
): Promise<ZonaGeograficaResponse> {
  const { data } = await apiClient.post<ZonaGeograficaResponse>(BASE_PATH, input);
  return data;
}

export async function actualizarZona(
  id: string,
  input: ActualizarZonaGeograficaInput,
): Promise<ZonaGeograficaResponse> {
  const { data } = await apiClient.put<ZonaGeograficaResponse>(
    `${BASE_PATH}/${id}`,
    input,
  );
  return data;
}

export async function cambiarEstatusZona(
  id: string,
  estatus: EstatusZona,
): Promise<ZonaGeograficaResponse> {
  const { data } = await apiClient.patch<ZonaGeograficaResponse>(
    `${BASE_PATH}/${id}/estatus`,
    null,
    { params: { estatus } },
  );
  return data;
}

export async function eliminarZona(id: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/${id}`);
}

/** Todas las entidades del catálogo, cada una con la zona que tenga asignada (si tiene). */
export async function listarTodasLasEntidades(): Promise<EntidadAsignadaResponse[]> {
  const { data } = await apiClient.get<EntidadAsignadaResponse[]>(
    `${BASE_PATH}/entidades`,
  );
  return data;
}

/** Entidades asignadas a una zona específica. Se pide solo al hacer clic en "Ver". */
export async function listarEntidadesDeZona(
  id: string,
): Promise<EntidadAsignadaResponse[]> {
  const { data } = await apiClient.get<EntidadAsignadaResponse[]>(
    `${BASE_PATH}/${id}/entidades`,
  );
  return data;
}

export async function asignarEntidades(id: string, entidadIds: string[]): Promise<void> {
  await apiClient.put(`${BASE_PATH}/${id}/entidades`, { entidadIds });
}
