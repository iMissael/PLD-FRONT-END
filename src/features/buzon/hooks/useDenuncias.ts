import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  agregarObservacion,
  adjuntarEvidencia,
  cambiarEstatusDenuncia,
  crearDenunciaAnonima,
  editarDenuncia,
  listarDenuncias,
  verDenunciaPorId,
} from "../api/buzonApi";
import type {
  AgregarObservacionInput,
  CambiarEstatusInput,
  CrearDenunciaInput,
  EditarDenunciaInput,
  ListarDenunciasParams,
} from "../types/buzon";

export const DENUNCIAS_QUERY_KEY = ["denuncias"];

export function useListarDenuncias(params?: ListarDenunciasParams) {
  return useQuery({
    queryKey: [...DENUNCIAS_QUERY_KEY, params],
    queryFn: ({ signal }) => listarDenuncias(params, signal),
    staleTime: 0,
  });
}

export function useDenunciaDetalle(id: number | null) {
  return useQuery({
    queryKey: [...DENUNCIAS_QUERY_KEY, id],
    queryFn: ({ signal }) => (id ? verDenunciaPorId(id, signal) : null),
    enabled: Boolean(id),
    staleTime: 0,
  });
}

export function useCrearDenuncia() {
  return useMutation({
    mutationFn: ({ input, evidencias }: { input: CrearDenunciaInput; evidencias?: File[] }) =>
      crearDenunciaAnonima(input, evidencias),
  });
}

export function useEditarDenuncia(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EditarDenunciaInput) => editarDenuncia(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DENUNCIAS_QUERY_KEY });
    },
  });
}

export function useCambiarEstatusDenuncia(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CambiarEstatusInput) => cambiarEstatusDenuncia(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DENUNCIAS_QUERY_KEY });
    },
  });
}

export function useAgregarObservacion(denunciaId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AgregarObservacionInput) => agregarObservacion(denunciaId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...DENUNCIAS_QUERY_KEY, denunciaId] });
    },
  });
}

export function useAdjuntarEvidencia(denunciaId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (archivo: File) => adjuntarEvidencia(denunciaId, archivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...DENUNCIAS_QUERY_KEY, denunciaId] });
    },
  });
}
