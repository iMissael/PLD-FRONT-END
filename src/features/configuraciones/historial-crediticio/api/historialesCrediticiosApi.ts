import { apiClient } from "@/api/client";
import { listarCatalogoCompleto } from "@/api/paginacion";

import type {
  CambiarNivelRiesgoHistorialInput,
  HistorialCrediticioResponse,
} from "../types/historialCrediticio";

/** El endpoint dice "historias" aunque la tabla y las clases digan "historial". */
const BASE_PATH = "/catalogos/historias-crediticias";

// El endpoint pagina: se traen todas las páginas porque esta tabla todavía no
// tiene controles de paginación propios.
export async function listarHistorialesCrediticios(): Promise<
  HistorialCrediticioResponse[]
> {
  return listarCatalogoCompleto<HistorialCrediticioResponse>(BASE_PATH);
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
