import { apiClient } from "@/api/client";
import type {
  ConsultaListasRequest,
  ListaRestrictiva,
  ResultadoConsultaListas,
} from "@/features/operacion/consulta-listas/types/Quienesquien";

export async function consultarListas(payload: ConsultaListasRequest) {
  const { data } = await apiClient.post<ResultadoConsultaListas>("/consulta-listas", payload);
  return data;
}

export async function listarListasRestrictivas() {
  const { data } = await apiClient.get<ListaRestrictiva[]>(
    "/catalogos/listas-restrictivas",
  );
  return data;
}
