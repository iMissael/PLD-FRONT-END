import { apiClient } from "@/api/client";
import type {
  CrearPermisoRequest,
  PermisoResponse,
} from "@/features/configuraciones/administracion/permisos/types/permisos";

export async function listarPermisos() {
  const { data } = await apiClient.get<PermisoResponse[]>("/permisos");
  return data;
}

export async function crearPermiso(payload: CrearPermisoRequest) {
  const { data } = await apiClient.post<PermisoResponse>("/permisos", payload);
  return data;
}

export async function eliminarPermiso(id: number) {
  await apiClient.delete(`/permisos/${id}`);
}
