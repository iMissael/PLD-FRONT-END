import { apiClient } from "@/api/client";

import type { TipoPrestamoResponse } from "../types/tipoPrestamo";

const BASE_PATH = "/catalogos/tipos-prestamo";

/**
 * El backend ya filtra los eliminados (`estatus = 'E'`) en el listado.
 * Solo se expone la lectura: este feature todavía no tiene pantalla de gestión.
 */
export async function listarTiposPrestamo(): Promise<TipoPrestamoResponse[]> {
  const { data } = await apiClient.get<TipoPrestamoResponse[]>(BASE_PATH);
  return data;
}
