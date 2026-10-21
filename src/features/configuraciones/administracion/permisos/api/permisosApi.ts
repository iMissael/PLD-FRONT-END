import { apiClient } from "@/api/client";
import { listarCatalogoCompleto } from "@/api/paginacion";
import type {
  CrearPermisoRequest,
  FiltroPermisos,
  PaginaPermisos,
  PermisoResponse,
} from "@/features/configuraciones/administracion/permisos/types/permisos";

const BASE = "/permisos";

export async function listarPermisos(
  filtro: FiltroPermisos,
  pagina: number,
  tamanio: number,
): Promise<PaginaPermisos> {
  const params = {
    ...Object.fromEntries(
      Object.entries(filtro).filter(([, valor]) => valor !== undefined && valor !== ""),
    ),
    pagina,
    tamanio,
  };
  const { data } = await apiClient.get<PaginaPermisos>(BASE, { params });
  return data;
}

/** Catálogo completo (todas las páginas), para selects/combos que necesitan verlo entero. */
export function listarTodosLosPermisos(): Promise<PermisoResponse[]> {
  return listarCatalogoCompleto<PermisoResponse>(BASE);
}

export async function crearPermiso(payload: CrearPermisoRequest) {
  const { data } = await apiClient.post<PermisoResponse>("/permisos", payload);
  return data;
}

export async function eliminarPermiso(id: number) {
  await apiClient.delete(`/permisos/${id}`);
}
