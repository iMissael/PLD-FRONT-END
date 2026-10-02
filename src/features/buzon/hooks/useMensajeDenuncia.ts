import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getCurrentTenantId } from "@/shared/tenant/tenantStore";
import {
  actualizarMensajeDenunciaAdmin,
  obtenerMensajeDenunciaAdmin,
  obtenerMensajeDenunciaPublico,
  obtenerNombreTenantPublico,
} from "../api/buzonApi";
import type {
  ActualizarMensajeDenunciaInput,
  MensajeDenunciaResponse,
} from "../types/buzon";

export const MENSAJE_DENUNCIA_PUBLICO_KEY = ["mensaje_denuncia_publico"];
export const MENSAJE_DENUNCIA_ADMIN_KEY = ["mensaje_denuncia_admin"];
export const TENANT_NOMBRE_PUBLICO_KEY = ["tenant_nombre_publico"];

export function useMensajeDenunciaPublico(customTenantId?: string) {
  const { tenantId: routeTenantId } = useParams<{ tenantId: string }>();
  const activeTenantId = customTenantId || routeTenantId || getCurrentTenantId() || "";

  return useQuery<MensajeDenunciaResponse>({
    queryKey: [...MENSAJE_DENUNCIA_PUBLICO_KEY, activeTenantId],
    queryFn: ({ signal }) => obtenerMensajeDenunciaPublico(signal),
    enabled: Boolean(activeTenantId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useNombreTenantPublico(customTenantId?: string) {
  const { tenantId: routeTenantId } = useParams<{ tenantId: string }>();
  const activeTenantId = customTenantId || routeTenantId || getCurrentTenantId() || "";

  return useQuery<{ nombreComercial: string }>({
    queryKey: [...TENANT_NOMBRE_PUBLICO_KEY, activeTenantId],
    queryFn: ({ signal }) => obtenerNombreTenantPublico(signal),
    enabled: Boolean(activeTenantId),
    staleTime: 10 * 60 * 1000,
  });
}

export function useMensajeDenunciaAdmin(customTenantId?: string) {
  const { tenantId: routeTenantId } = useParams<{ tenantId: string }>();
  const activeTenantId = customTenantId || routeTenantId || getCurrentTenantId() || "";

  return useQuery<MensajeDenunciaResponse>({
    queryKey: [...MENSAJE_DENUNCIA_ADMIN_KEY, activeTenantId],
    queryFn: ({ signal }) => obtenerMensajeDenunciaAdmin(signal),
    enabled: Boolean(activeTenantId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useActualizarMensajeDenunciaAdmin() {
  const queryClient = useQueryClient();
  const { tenantId: routeTenantId } = useParams<{ tenantId: string }>();

  return useMutation({
    mutationFn: ({
      input,
    }: {
      tenantId?: string;
      input: ActualizarMensajeDenunciaInput;
    }) => {
      return actualizarMensajeDenunciaAdmin(input);
    },
    onSuccess: (_, variables) => {
      const activeTenantId = variables.tenantId || routeTenantId || getCurrentTenantId() || "";
      queryClient.invalidateQueries({
        queryKey: [...MENSAJE_DENUNCIA_ADMIN_KEY, activeTenantId],
      });
      queryClient.invalidateQueries({
        queryKey: [...MENSAJE_DENUNCIA_PUBLICO_KEY, activeTenantId],
      });
      queryClient.invalidateQueries({
        queryKey: [...TENANT_NOMBRE_PUBLICO_KEY, activeTenantId],
      });
    },
  });
}
