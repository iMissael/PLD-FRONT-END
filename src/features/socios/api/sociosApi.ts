import { apiClient } from "@/api/client";
import type {
  BusquedaAcreditados,
  PaginaAcreditados,
  AcreditadoExterno,
  AcreditadoPerfilRiesgo,
} from "@/features/acreditados/types/acreditados";

export async function buscarAcreditados(nombre: string) {
  const { data } = await apiClient.get<AcreditadoExterno[]>("/acreditados/buscar", {
    params: nombre ? { nombre } : undefined,
  });
  return data;
}

/** El backend filtra y pagina: PLD-SOCIOS siempre devuelve la lista completa. */
export async function buscarAcreditadosPaginados({
  criterio,
  valor,
  tipoPersona,
  pagina,
  tamanio,
}: BusquedaAcreditados) {
  const { data } = await apiClient.get<PaginaAcreditados>("/acreditados/pagina", {
    params: { criterio, valor: valor.trim() || undefined, tipoPersona, pagina, tamanio },
  });
  return data;
}

export async function obtenerPerfilRiesgoAcreditado(referencia: string) {
  const { data } = await apiClient.get<AcreditadoPerfilRiesgo>(
    `/acreditados/${encodeURIComponent(referencia)}/perfil-riesgo`,
  );
  return data;
}
