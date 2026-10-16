import { apiClient } from "@/api/client";
import type {
  BusquedaSocios,
  PaginaSocios,
  SocioExterno,
  SocioPerfilRiesgo,
} from "@/features/socios/types/socios";

export async function buscarSocios(nombre: string) {
  const { data } = await apiClient.get<SocioExterno[]>("/acreditados/buscar", {
    params: nombre ? { nombre } : undefined,
  });
  return data;
}

/** El backend filtra y pagina: PLD-SOCIOS siempre devuelve la lista completa. */
export async function buscarSociosPaginados({
  criterio,
  valor,
  tipoPersona,
  pagina,
  tamanio,
}: BusquedaSocios) {
  const { data } = await apiClient.get<PaginaSocios>("/socios/pagina", {
    params: { criterio, valor: valor.trim() || undefined, tipoPersona, pagina, tamanio },
  });
  return data;
}

export async function obtenerPerfilRiesgoSocio(referencia: string) {
  const { data } = await apiClient.get<SocioPerfilRiesgo>(
    `/socios/${encodeURIComponent(referencia)}/perfil-riesgo`,
  );
  return data;
}
