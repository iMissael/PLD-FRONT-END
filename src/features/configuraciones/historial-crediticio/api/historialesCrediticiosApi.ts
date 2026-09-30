import { apiClient } from "@/api/client";

import type {
  CambiarNivelRiesgoHistorialInput,
  HistorialCrediticioResponse,
} from "../types/historialCrediticio";

/** El endpoint dice "historias" aunque la tabla y las clases digan "historial". */
const BASE_PATH = "/catalogos/historias-crediticias";

export async function listarHistorialesCrediticios(): Promise<
  HistorialCrediticioResponse[]
> {
  const { data } = await apiClient.get<HistorialCrediticioResponse[]>(BASE_PATH);
  return data;
}

/**
 * Cambia solo el nivel de riesgo. No hay endpoint dedicado como en Localidades
 * (`PUT /{id}/nivel-riesgo`), así que se usa el `PUT /{id}` general enviando
 * únicamente ese campo: el backend conserva `nombre` y `estatus` porque los
 * recibe en null y el dominio no los sobrescribe.
 */
export async function cambiarNivelRiesgoHistorial(
  id: string,
  input: CambiarNivelRiesgoHistorialInput,
): Promise<HistorialCrediticioResponse> {
  const { data } = await apiClient.put<HistorialCrediticioResponse>(
    `${BASE_PATH}/${id}`,
    input,
  );
  return data;
}
