import { listarCatalogoCompleto } from "@/api/paginacion";

import type { TipoPrestamoResponse } from "../types/tipoPrestamo";

const BASE_PATH = "/catalogos/tipos-prestamo";

/**
 * El backend ya filtra los eliminados (`estatus = 'E'`) en el listado.
 * Solo se expone la lectura: este feature todavía no tiene pantalla de gestión.
 * El endpoint pagina: se traen todas las páginas porque este selector necesita
 * el catálogo completo.
 */
export async function listarTiposPrestamo(): Promise<TipoPrestamoResponse[]> {
  return listarCatalogoCompleto<TipoPrestamoResponse>(BASE_PATH);
}
