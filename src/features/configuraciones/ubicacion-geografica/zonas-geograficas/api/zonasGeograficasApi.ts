import { apiClient } from "@/api/client";

import type {
  ActualizarZonaGeograficaInput,
  CrearZonaGeograficaInput,
  EntidadAsignadaResponse,
  EstatusZona,
  PaisAsignadoResponse,
  ZonaGeograficaResponse,
} from "../types/zonaGeografica";

const BASE_PATH = "/api/catalogos/zonas-geograficas";

export async function listarZonas(
  estatus?: EstatusZona,
): Promise<ZonaGeograficaResponse[]> {
  const { data } = await apiClient.get<ZonaGeograficaResponse[]>(BASE_PATH, {
    params: estatus ? { estatus } : undefined,
  });
  return data;
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

/** Todos los países del catálogo, cada uno con la zona que tenga asignada (si tiene). */
export async function listarTodosLosPaisesConZonas(): Promise<PaisAsignadoResponse[]> {
  const { data } = await apiClient.get<PaisAsignadoResponse[]>(`${BASE_PATH}/paises`);
  return data;
}

/** Países asignados a una zona específica. Se pide solo al hacer clic en "Ver". */
export async function listarPaisesDeZona(id: string): Promise<PaisAsignadoResponse[]> {
  const { data } = await apiClient.get<PaisAsignadoResponse[]>(
    `${BASE_PATH}/${id}/paises`,
  );
  return data;
}

export async function asignarPaises(id: string, paisIds: string[]): Promise<void> {
  await apiClient.put(`${BASE_PATH}/${id}/paises`, { paisIds });
}
