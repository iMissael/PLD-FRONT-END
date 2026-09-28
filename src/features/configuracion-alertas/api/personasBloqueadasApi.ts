import { apiClient } from "@/api/client";

import type {
  CargaMasivaResultado,
  ConsultaBloqueadosParams,
  PersonaBloqueadaInput,
  PersonaBloqueadaResponse,
  ResultadoBusquedaResponse,
  RfcCurpParams,
} from "../types/personaBloqueada";

const BASE_PATH = "/api/personas-bloqueadas";

/**
 * El backend real (`PersonaBloqueadaController`) también expone
 * `GET/PUT/DELETE /personas-bloqueadas/{id}`, pero el front NUNCA los llama
 * a propósito: todo flujo de negocio identifica a una persona bloqueada por
 * RFC o CURP, nunca por id interno. Si en algún momento se necesitan, van
 * aquí junto a los demás, no antes.
 */

export async function crearPersonaBloqueada(
  input: PersonaBloqueadaInput,
): Promise<PersonaBloqueadaResponse> {
  const { data } = await apiClient.post<PersonaBloqueadaResponse>(BASE_PATH, input);
  return data;
}

/**
 * `rfc`/`curp` van como query params en el request real (así los espera
 * `PersonaBloqueadaController.actualizarPorRfcOCurp`), pero eso es interno
 * a esta llamada de Axios: nunca aparecen en la URL visible del front.
 */
export async function actualizarPersonaBloqueadaPorRfcCurp(
  params: RfcCurpParams,
  input: PersonaBloqueadaInput,
): Promise<PersonaBloqueadaResponse> {
  const { data } = await apiClient.put<PersonaBloqueadaResponse>(BASE_PATH, input, {
    params,
  });
  return data;
}

/**
 * A pesar del verbo HTTP DELETE, el backend no borra el registro: cambia su
 * `estatus` (soft-delete). El front sigue el mismo patrón HTTP porque así
 * está expuesto el endpoint.
 */
export async function eliminarPersonaBloqueadaPorRfcCurp(
  params: RfcCurpParams,
): Promise<void> {
  await apiClient.delete(BASE_PATH, { params });
}

export async function consultarBloqueados(
  params: ConsultaBloqueadosParams,
): Promise<ResultadoBusquedaResponse[]> {
  const { data } = await apiClient.get<ResultadoBusquedaResponse[]>(
    `${BASE_PATH}/consulta-bloqueados`,
    { params },
  );
  return data;
}

/** Carga masiva por archivo (CSV/XLSX). */
export async function cargaMasivaPersonasBloqueadas(
  archivo: File,
): Promise<CargaMasivaResultado> {
  const formData = new FormData();
  formData.append("archivo", archivo);

  const { data } = await apiClient.post<CargaMasivaResultado>(
    `${BASE_PATH}/carga-masiva`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}
