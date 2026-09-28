import { apiClient } from "@/api/client";
import type {
  ConsultaLista,
  ConsultaListasRequest,
  ListaRestrictiva,
} from "@/features/operacion/consulta-listas/types/consultaListas";

export async function consultarListas(payload: ConsultaListasRequest) {
  const { data } = await apiClient.post<ConsultaLista[]>("/consulta-listas", payload);
  return data;
}

export async function listarListasRestrictivas() {
  const { data } = await apiClient.get<ListaRestrictiva[]>(
    "/catalogos/listas-restrictivas",
  );
  return data;
}
