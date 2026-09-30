import { apiClient } from "@/api/client";
import { isAppError } from "@/api/interceptors/errorInterceptor";
import type {
  ActualizarUsuarioRequest,
  CrearUsuarioRequest,
  DomicilioUsuarioRequest,
  DomicilioUsuarioResponse,
  OficialRequest,
  OficialResponse,
  UsuarioResponse,
} from "@/features/configuraciones/administracion/usuarios/types/usuarios";

async function nullSiNoExiste<T>(peticion: Promise<{ data: T }>) {
  try {
    return (await peticion).data;
  } catch (error) {
    if (isAppError(error) && error.status === 404) return null;
    throw error;
  }
}

export async function listarUsuarios() {
  const { data } = await apiClient.get<UsuarioResponse[]>("/usuarios");
  return data;
}

export async function obtenerUsuario(id: number) {
  const { data } = await apiClient.get<UsuarioResponse>(`/usuarios/${id}`);
  return data;
}

export async function crearUsuario(payload: CrearUsuarioRequest) {
  const { data } = await apiClient.post<UsuarioResponse>("/usuarios", payload);
  return data;
}

export async function eliminarUsuario(id: number) {
  await apiClient.delete(`/usuarios/${id}`);
}

export async function crearDomicilioUsuario(
  usuarioId: number,
  payload: DomicilioUsuarioRequest,
) {
  const { data } = await apiClient.post<DomicilioUsuarioResponse>(
    `/usuarios/${usuarioId}/domicilio`,
    payload,
  );
  return data;
}

// El backend ya no tiene /usuarios/{id}/oficial (ver types/usuarios.ts): estas tres
// funciones quedan apuntando a un endpoint que ya no existe, solo para no romper en
// runtime el import de la feature "oficial-cumplimiento" mientras se decide su rediseño.
export async function crearOficial(usuarioId: number, payload: OficialRequest) {
  const { data } = await apiClient.post<OficialResponse>(
    `/usuarios/${usuarioId}/oficial`,
    payload,
  );
  return data;
}

export function obtenerOficial(usuarioId: number) {
  return nullSiNoExiste(apiClient.get<OficialResponse>(`/usuarios/${usuarioId}/oficial`));
}

export async function guardarOficial(usuarioId: number, payload: OficialRequest) {
  const { data } = await apiClient.put<OficialResponse>(
    `/usuarios/${usuarioId}/oficial`,
    payload,
  );
  return data;
}

// El PUT de usuario reemplaza el registro completo: hay que reenviar todos los campos.
export async function actualizarUsuario(id: number, payload: ActualizarUsuarioRequest) {
  const { data } = await apiClient.put<UsuarioResponse>(`/usuarios/${id}`, payload);
  return data;
}

export function obtenerDomicilioUsuario(usuarioId: number) {
  return nullSiNoExiste(
    apiClient.get<DomicilioUsuarioResponse>(`/usuarios/${usuarioId}/domicilio`),
  );
}

export async function guardarDomicilioUsuario(
  usuarioId: number,
  payload: DomicilioUsuarioRequest,
) {
  const { data } = await apiClient.put<DomicilioUsuarioResponse>(
    `/usuarios/${usuarioId}/domicilio`,
    payload,
  );
  return data;
}
