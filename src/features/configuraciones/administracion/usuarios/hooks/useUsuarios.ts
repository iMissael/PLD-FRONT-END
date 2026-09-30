import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  crearDomicilioUsuario,
  crearUsuario,
  eliminarUsuario,
  listarUsuarios,
} from "@/features/configuraciones/administracion/usuarios/api/usuariosApi";
import type {
  CrearUsuarioRequest,
  DomicilioUsuarioRequest,
} from "@/features/configuraciones/administracion/usuarios/types/usuarios";

const usuariosKeys = {
  all: ["usuarios"] as const,
};

export function useUsuarios() {
  return useQuery({
    queryKey: usuariosKeys.all,
    queryFn: listarUsuarios,
  });
}

export function useCrearUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.all });
    },
  });
}

export interface CrearUsuarioCompletoInput {
  usuario: CrearUsuarioRequest;
  domicilio: DomicilioUsuarioRequest;
}

export function useCrearUsuarioCompleto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ usuario, domicilio }: CrearUsuarioCompletoInput) => {
      const usuarioCreado = await crearUsuario(usuario);
      if (!usuarioCreado.idUsuario) {
        throw new Error("El usuario se creó sin id");
      }
      await crearDomicilioUsuario(usuarioCreado.idUsuario, domicilio);
      return usuarioCreado;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.all });
    },
  });
}

export function useEliminarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eliminarUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.all });
    },
  });
}
