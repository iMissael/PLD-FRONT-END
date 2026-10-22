import { apiClient } from "@/api/client";

import type { PaginaNotificaciones } from "../types/notificaciones";

const BASE = "/notificaciones";

export async function listarNotificaciones(
  soloNoLeidas: boolean,
  pagina: number,
  tamanio: number,
): Promise<PaginaNotificaciones> {
  const { data } = await apiClient.get<PaginaNotificaciones>(BASE, {
    params: { soloNoLeidas, pagina, tamanio },
  });
  return data;
}

export async function contarNoLeidas(): Promise<number> {
  const { data } = await apiClient.get<{ total: number }>(`${BASE}/no-leidas`);
  return data.total;
}

export async function marcarLeida(id: number): Promise<void> {
  await apiClient.patch(`${BASE}/${id}/leida`);
}

export async function marcarTodasLeidas(): Promise<number> {
  const { data } = await apiClient.patch<{ total: number }>(`${BASE}/leidas`);
  return data.total;
}
