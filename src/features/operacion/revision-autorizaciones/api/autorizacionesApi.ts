import { apiClient } from "@/api/client";
import { listarCatalogoCompleto } from "@/api/paginacion";

import type {
  FiltroAutorizaciones,
  PaginaAutorizaciones,
  RevisionAutorizacion,
} from "../types/autorizaciones";

const BASE = "/v1/pld/alertas-autorizacion";

function parametros(filtro: FiltroAutorizaciones): Record<string, string> {
  const params: Record<string, string> = {};
  if (filtro.desde) params.desde = filtro.desde;
  if (filtro.hasta) params.hasta = filtro.hasta;
  if (filtro.estatus.length > 0) params.estatus = filtro.estatus.join(",");
  return params;
}

export async function listarAutorizaciones(
  filtro: FiltroAutorizaciones,
  pagina: number,
  tamanio: number,
): Promise<PaginaAutorizaciones> {
  const { data } = await apiClient.get<PaginaAutorizaciones>(BASE, {
    params: { ...parametros(filtro), pagina, tamanio },
  });
  return data;
}

export function listarTodasAutorizaciones(
  filtro: FiltroAutorizaciones,
): Promise<RevisionAutorizacion[]> {
  return listarCatalogoCompleto<RevisionAutorizacion>(BASE, parametros(filtro));
}

export async function obtenerAutorizacion(id: number): Promise<RevisionAutorizacion> {
  const { data } = await apiClient.get<RevisionAutorizacion>(`${BASE}/${id}`);
  return data;
}
