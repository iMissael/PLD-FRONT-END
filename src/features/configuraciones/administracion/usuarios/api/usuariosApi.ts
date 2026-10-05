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

export async function cambiarRolUsuario(id: number, rolId: number) {
  const { data } = await apiClient.patch<UsuarioResponse>(`/usuarios/${id}/rol`, { rolId });
  return data;
}

/** A = activo, B = inactivo: un usuario inactivo no puede iniciar sesión. */
export async function cambiarEstadoUsuario(id: number, estado: "A" | "B") {
  const { data } = await apiClient.patch<UsuarioResponse>(`/usuarios/${id}/estado`, { estado });
  return data;
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
