import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  actualizarSistema,
  cambiarEstatusSistema,
  emitirCredencial,
  listarScopes,
  listarSistemas,
  registrarSistema,
  revocarCredencial,
} from "../api/integracionesApi";
import type {
  ActualizarSistemaInput,
  EmitirCredencialInput,
  EstatusSistema,
  RegistrarSistemaInput,
} from "../types/integraciones";
import { integracionesKeys } from "./integracionesKeys";

export function useSistemasIntegracion() {
  return useQuery({ queryKey: integracionesKeys.sistemas(), queryFn: listarSistemas });
}

export function useScopesIntegracion() {
  return useQuery({ queryKey: integracionesKeys.scopes(), queryFn: listarScopes, staleTime: Infinity });
}

function useInvalidarSistemas() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: integracionesKeys.sistemas() });
}

export function useRegistrarSistema() {
  const invalidar = useInvalidarSistemas();
  return useMutation({ mutationFn: (input: RegistrarSistemaInput) => registrarSistema(input), onSuccess: invalidar });
}

export function useActualizarSistema() {
  const invalidar = useInvalidarSistemas();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ActualizarSistemaInput }) => actualizarSistema(id, input),
    onSuccess: invalidar,
  });
}

export function useCambiarEstatusSistema() {
  const invalidar = useInvalidarSistemas();
  return useMutation({
    mutationFn: ({ id, estatus }: { id: number; estatus: EstatusSistema }) => cambiarEstatusSistema(id, estatus),
    onSuccess: invalidar,
  });
}

export function useEmitirCredencial() {
  const invalidar = useInvalidarSistemas();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: EmitirCredencialInput }) => emitirCredencial(id, input),
    onSuccess: invalidar,
  });
}

export function useRevocarCredencial() {
  const invalidar = useInvalidarSistemas();
  return useMutation({
    mutationFn: ({ id, credencialId }: { id: number; credencialId: number }) => revocarCredencial(id, credencialId),
    onSuccess: invalidar,
  });
}
