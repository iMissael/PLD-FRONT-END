import { apiClient } from "@/api/client";

import type {
  ActualizarSistemaInput,
  CredencialEmitidaResponse,
  EmitirCredencialInput,
  EstatusSistema,
  RegistrarSistemaInput,
  SistemaIntegracionResponse,
} from "../types/integraciones";

const BASE_PATH = "/integraciones";

export async function listarScopes(): Promise<string[]> {
  const { data } = await apiClient.get<string[]>(`${BASE_PATH}/scopes`);
  return data;
}

export async function listarSistemas(): Promise<SistemaIntegracionResponse[]> {
  const { data } = await apiClient.get<SistemaIntegracionResponse[]>(`${BASE_PATH}/sistemas`);
  return data;
}

export async function registrarSistema(input: RegistrarSistemaInput): Promise<SistemaIntegracionResponse> {
  const { data } = await apiClient.post<SistemaIntegracionResponse>(`${BASE_PATH}/sistemas`, input);
  return data;
}

export async function actualizarSistema(id: number, input: ActualizarSistemaInput): Promise<SistemaIntegracionResponse> {
  const { data } = await apiClient.put<SistemaIntegracionResponse>(`${BASE_PATH}/sistemas/${id}`, input);
  return data;
}

export async function cambiarEstatusSistema(id: number, estatus: EstatusSistema): Promise<SistemaIntegracionResponse> {
  const { data } = await apiClient.patch<SistemaIntegracionResponse>(`${BASE_PATH}/sistemas/${id}/estatus`, {
    estatus,
  });
  return data;
}

export async function emitirCredencial(id: number, input: EmitirCredencialInput): Promise<CredencialEmitidaResponse> {
  const { data } = await apiClient.post<CredencialEmitidaResponse>(`${BASE_PATH}/sistemas/${id}/credenciales`, input);
  return data;
}

export async function revocarCredencial(id: number, credencialId: number): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/sistemas/${id}/credenciales/${credencialId}`);
}
