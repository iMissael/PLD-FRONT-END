import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  actualizarUsuario,
  guardarDomicilioUsuario,
  guardarOficial,
  obtenerDomicilioUsuario,
  obtenerOficial,
  obtenerUsuario,
} from "@/features/configuraciones/administracion/usuarios/api/usuariosApi";
import type {
  ActualizarUsuarioRequest,
  DomicilioUsuarioRequest,
  OficialRequest,
} from "@/features/configuraciones/administracion/usuarios/types/usuarios";

const oficialKeys = {
  usuario: (id: string) => ["usuarios", id] as const,
  domicilio: (id: string) => ["usuarios", id, "domicilio"] as const,
  oficial: (id: string) => ["usuarios", id, "oficial"] as const,
};

export function useOficialCumplimiento(usuarioId: string | undefined) {
  const id = usuarioId ?? "";
  const usuario = useQuery({
    queryKey: oficialKeys.usuario(id),
    queryFn: () => obtenerUsuario(id),
    enabled: Boolean(usuarioId),
  });
  const domicilio = useQuery({
    queryKey: oficialKeys.domicilio(id),
    queryFn: () => obtenerDomicilioUsuario(id),
    enabled: Boolean(usuarioId),
  });
  const oficial = useQuery({
    queryKey: oficialKeys.oficial(id),
    queryFn: () => obtenerOficial(id),
    enabled: Boolean(usuarioId),
  });

  return {
    usuario: usuario.data,
    domicilio: domicilio.data,
    oficial: oficial.data,
    cargando: usuario.isPending || domicilio.isPending || oficial.isPending,
    hayError: usuario.isError || domicilio.isError || oficial.isError,
  };
}

export interface GuardarOficialInput {
  usuario: ActualizarUsuarioRequest;
  domicilio: DomicilioUsuarioRequest;
  oficial: OficialRequest;
}

export function useGuardarOficialCumplimiento(usuarioId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ usuario, domicilio, oficial }: GuardarOficialInput) => {
      await actualizarUsuario(usuarioId, usuario);
      await guardarDomicilioUsuario(usuarioId, domicilio);
      await guardarOficial(usuarioId, oficial);
    },
    // Los tres PUT no son atómicos: se refresca aunque falle uno para mostrar lo que sí quedó guardado.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
    },
  });
}
