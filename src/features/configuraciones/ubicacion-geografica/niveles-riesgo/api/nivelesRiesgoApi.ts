import { listarCatalogoCompleto } from "@/api/paginacion";

import type { NivelRiesgoResponse } from "../types/nivelRiesgo";

const BASE_PATH = "/catalogos/niveles-riesgo";

/**
 * Catálogo de solo lectura desde el front: se usa como fuente de un
 * `<select>` en Zonas geográficas, Países y Localidades. El CRUD completo
 * existe en el backend (`CatNivelRiesgoController`) pero no tiene pantalla
 * propia todavía. El endpoint pagina: se traen todas las páginas porque este
 * selector necesita el catálogo completo.
 */
export async function listarNivelesRiesgo(): Promise<NivelRiesgoResponse[]> {
  return listarCatalogoCompleto<NivelRiesgoResponse>(BASE_PATH);
}
