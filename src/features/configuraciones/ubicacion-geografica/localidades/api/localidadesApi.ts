import { apiClient } from "@/api/client";

import type {
  CambiarNivelRiesgoLocalidadInput,
  LocalidadResponse,
} from "../types/localidad";

const BASE_PATH = "/catalogos/localidades";

export async function listarLocalidades(params?: {
  busqueda?: string;
  filtrarPor?: string;
  idMunicipio?: string;
  idNivelRiesgo?: number;
}): Promise<LocalidadResponse[]> {
  const { data } = await apiClient.get<LocalidadResponse[]>(BASE_PATH, { params });
  return data;
}

export async function cambiarNivelRiesgoLocalidad(
  id: string,
  input: CambiarNivelRiesgoLocalidadInput,
): Promise<LocalidadResponse> {
  const { data } = await apiClient.put<LocalidadResponse>(
    `${BASE_PATH}/${id}/nivel-riesgo`,
    input,
  );
  return data;
}
