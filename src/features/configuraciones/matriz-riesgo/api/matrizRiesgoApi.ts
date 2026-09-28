import { apiClient } from "@/api/client";
import type {
  ConfiguracionMatrizRiesgo,
  ConfiguracionMatrizRiesgoRequest,
} from "@/features/configuraciones/matriz-riesgo/types/matrizRiesgo";

export async function obtenerConfiguracionActiva() {
  const { data } = await apiClient.get<ConfiguracionMatrizRiesgo>(
    "/configuracion-matriz/activa",
  );
  return data;
}

export async function listarVersiones() {
  const { data } = await apiClient.get<ConfiguracionMatrizRiesgo[]>(
    "/configuracion-matriz",
  );
  return data;
}

export async function obtenerVersionPorId(id: number) {
  const { data } = await apiClient.get<ConfiguracionMatrizRiesgo>(
    `/configuracion-matriz/${id}`,
  );
  return data;
}

export async function crearNuevaVersion(payload: ConfiguracionMatrizRiesgoRequest) {
  const { data } = await apiClient.post<ConfiguracionMatrizRiesgo>(
    "/configuracion-matriz",
    payload,
  );
  return data;
}
