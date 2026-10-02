import { apiClient } from "@/api/client";
import { listarCatalogoCompleto } from "@/api/paginacion";
import type {
  ConsultaListasRequest,
  ListaRestrictiva,
  ResultadoConsultaListas,
} from "@/features/operacion/consulta-listas/types/Quienesquien";

export async function consultarListas(payload: ConsultaListasRequest) {
  const { data } = await apiClient.post<ResultadoConsultaListas>("/consulta-listas", payload);
  return data;
}

// El endpoint pagina: se traen todas las páginas porque esta tabla todavía no
// tiene controles de paginación propios.
export async function listarListasRestrictivas() {
  return listarCatalogoCompleto<ListaRestrictiva>("/catalogos/listas-restrictivas");
}
