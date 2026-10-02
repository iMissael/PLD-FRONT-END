import { apiClient } from "@/api/client";
import { listarCatalogoCompleto } from "@/api/paginacion";

import type {
  ActualizarExperienciaActividadInput,
  CrearExperienciaActividadInput,
  ExperienciaActividadResponse,
} from "../types/experienciaActividad";

const BASE_PATH = "/catalogos/experiencias-actividad";

/**
 * El backend hace soft-delete (`estatus = 'E'`) y ya filtra los eliminados
 * en el listado, así que no hace falta ningún parámetro de estatus. El
 * endpoint pagina: se traen todas las páginas porque esta tabla todavía no
 * tiene controles de paginación propios.
 */
export async function listarExperienciasActividad(): Promise<
  ExperienciaActividadResponse[]
> {
  return listarCatalogoCompleto<ExperienciaActividadResponse>(BASE_PATH);
}

export async function obtenerExperienciaActividad(
  id: string,
): Promise<ExperienciaActividadResponse> {
  const { data } = await apiClient.get<ExperienciaActividadResponse>(
    `${BASE_PATH}/${id}`,
  );
  return data;
}

export async function crearExperienciaActividad(
  input: CrearExperienciaActividadInput,
): Promise<ExperienciaActividadResponse> {
  const { data } = await apiClient.post<ExperienciaActividadResponse>(BASE_PATH, input);
  return data;
}

export async function actualizarExperienciaActividad(
  id: string,
  input: ActualizarExperienciaActividadInput,
): Promise<ExperienciaActividadResponse> {
  const { data } = await apiClient.put<ExperienciaActividadResponse>(
    `${BASE_PATH}/${id}`,
    input,
  );
  return data;
}

export async function eliminarExperienciaActividad(id: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/${id}`);
}
