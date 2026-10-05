import { apiClient } from "@/api/client";
import type {
  CrearPermisoRequest,
  PermisoResponse,
} from "@/features/configuraciones/administracion/permisos/types/permisos";

export async function listarPermisos() {
  const { data } = await apiClient.get<PermisoResponse[]>("/permisos");
  return data;
}

/** Recursos que protegen los endpoints del backend: son las opciones para crear un permiso. */
export async function listarRecursosPermiso() {
  const { data } = await apiClient.get<string[]>("/permisos/recursos");
  return data;
}

export async function crearPermiso(payload: CrearPermisoRequest) {
  const { data } = await apiClient.post<PermisoResponse>("/permisos", payload);
  return data;
}

export async function eliminarPermiso(id: number) {
  await apiClient.delete(`/permisos/${id}`);
}
