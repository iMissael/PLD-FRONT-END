import { apiClient } from "@/api/client";
import type { SocioExterno, SocioPerfilRiesgo } from "@/features/socios/types/socios";

export async function buscarSocios(nombre: string) {
  const { data } = await apiClient.get<SocioExterno[]>("/socios/buscar", {
    params: nombre ? { nombre } : undefined,
  });
  return data;
}

export async function obtenerPerfilRiesgoSocio(referencia: string) {
  const { data } = await apiClient.get<SocioPerfilRiesgo>(
    `/socios/${encodeURIComponent(referencia)}/perfil-riesgo`,
  );
  return data;
}
