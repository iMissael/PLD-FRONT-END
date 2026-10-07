import { apiClient } from "@/api/client";
import { listarCatalogoCompleto } from "@/api/paginacion";

import type { EstatusLista, ListaPaisInput, ListaPaisResponse, PaisEnListaResponse } from "../types/listaPais";

const BASE_PATH = "/catalogos/listas-paises";

export async function listarListas(estatus?: EstatusLista): Promise<ListaPaisResponse[]> {
  return listarCatalogoCompleto<ListaPaisResponse>(BASE_PATH, estatus ? { estatus } : undefined);
}

export async function crearLista(input: ListaPaisInput): Promise<ListaPaisResponse> {
  const { data } = await apiClient.post<ListaPaisResponse>(BASE_PATH, input);
  return data;
}

export async function actualizarLista(id: string, input: ListaPaisInput): Promise<ListaPaisResponse> {
  const { data } = await apiClient.put<ListaPaisResponse>(`${BASE_PATH}/${id}`, input);
  return data;
}

export async function eliminarLista(id: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/${id}`);
}

/** Países de una lista. Se pide solo al hacer clic en "Ver". */
export async function listarPaisesDeLista(id: string): Promise<PaisEnListaResponse[]> {
  const { data } = await apiClient.get<PaisEnListaResponse[]>(`${BASE_PATH}/${id}/paises`);
  return data;
}

export async function asignarPaisesALista(id: string, paisIds: string[]): Promise<void> {
  await apiClient.put(`${BASE_PATH}/${id}/paises`, { paisIds });
}
