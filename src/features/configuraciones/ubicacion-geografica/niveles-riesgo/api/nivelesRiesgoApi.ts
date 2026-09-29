import { apiClient } from "@/api/client";

import type { NivelRiesgoResponse } from "../types/nivelRiesgo";

const BASE_PATH = "/catalogos/niveles-riesgo";

/**
 * Catálogo de solo lectura desde el front: se usa como fuente de un
 * `<select>` en Zonas geográficas, Países y Localidades. El CRUD completo
 * existe en el backend (`CatNivelRiesgoController`) pero no tiene pantalla
 * propia todavía.
 */
export async function listarNivelesRiesgo(): Promise<NivelRiesgoResponse[]> {
  const { data } = await apiClient.get<NivelRiesgoResponse[]>(BASE_PATH);
  return data;
}
