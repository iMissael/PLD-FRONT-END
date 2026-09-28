import { apiClient } from "@/api/client";
import type { PermisoResponse } from "@/features/configuraciones/administracion/permisos/types/permisos";
import type {
  CrearRolRequest,
  RolResponse,
} from "@/features/configuraciones/administracion/roles/types/roles";

export async function listarRoles() {
  const { data } = await apiClient.get<RolResponse[]>("/roles");
  return data;
}

export async function crearRol(payload: CrearRolRequest) {
  const { data } = await apiClient.post<RolResponse>("/roles", payload);
  return data;
}

export async function eliminarRol(id: string) {
  await apiClient.delete(`/roles/${id}`);
}

export async function listarPermisosDeRol(rolId: string) {
  const { data } = await apiClient.get<PermisoResponse[]>(`/roles/${rolId}/permisos`);
  return data;
}

export async function asignarPermisoARol(rolId: string, permisoId: string) {
  await apiClient.post(`/roles/${rolId}/permisos/${permisoId}`);
}

export async function revocarPermisoDeRol(rolId: string, permisoId: string) {
  await apiClient.delete(`/roles/${rolId}/permisos/${permisoId}`);
}
