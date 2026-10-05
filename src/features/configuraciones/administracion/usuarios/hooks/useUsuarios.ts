import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  actualizarUsuario,
  cambiarEstadoUsuario,
  cambiarRolUsuario,
  crearDomicilioUsuario,
  crearOficial,
  crearUsuario,
  eliminarUsuario,
  guardarDomicilioUsuario,
  guardarOficial,
  listarUsuarios,
  obtenerDomicilioUsuario,
  obtenerOficial,
} from "@/features/configuraciones/administracion/usuarios/api/usuariosApi";
import type {
  ActualizarUsuarioRequest,
  CrearUsuarioRequest,
  DomicilioUsuarioRequest,
  OficialRequest,
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
  oficial?: OficialRequest;
}

function mensajeDe(error: unknown) {
  return error instanceof Error ? error.message : "error desconocido";
}

export function useCrearUsuarioCompleto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ usuario, domicilio, oficial }: CrearUsuarioCompletoInput) => {
      const usuarioCreado = await crearUsuario(usuario);
      if (!usuarioCreado.idUsuario) {
        throw new Error("El usuario se creó sin id");
      }
      // Son tres llamadas: si falla la segunda o la tercera el usuario ya existe, y reintentar
      // el alta chocaría con su username. El mensaje dice qué parte quedó pendiente.
      try {
        await crearDomicilioUsuario(usuarioCreado.idUsuario, domicilio);
      } catch (error) {
        throw new Error(
          `El usuario "${usuarioCreado.username}" se creó, pero no se guardó su domicilio: ${mensajeDe(error)}`,
        );
      }
      if (oficial) {
        try {
          await crearOficial(usuarioCreado.idUsuario, oficial);
        } catch (error) {
          throw new Error(
            `El usuario "${usuarioCreado.username}" se creó, pero no se guardaron sus datos de oficial: ${mensajeDe(error)}`,
          );
        }
      }
      return usuarioCreado;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.all });
      // Registrar un oficial activa su rol en el backend: la lista de roles cambia de estado.
      queryClient.invalidateQueries({ queryKey: ["roles"] });
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

/** Domicilio y datos de oficial del usuario a editar; null si todavía no tiene. */
export function useDetalleUsuario(id: number | undefined) {
  return useQuery({
    queryKey: [...usuariosKeys.all, id, "detalle"],
    queryFn: async () => {
      const [domicilio, oficial] = await Promise.all([
        obtenerDomicilioUsuario(id!),
        obtenerOficial(id!),
      ]);
      return { domicilio, oficial };
    },
    enabled: id !== undefined,
    staleTime: 0,
  });
}

export interface ActualizarUsuarioCompletoInput {
  id: number;
  usuario: ActualizarUsuarioRequest;
  /** Solo si cambió: el rol tiene su propia operación. */
  rolId?: number;
  domicilio: DomicilioUsuarioRequest;
  oficial?: OficialRequest;
}

export function useActualizarUsuarioCompleto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, usuario, rolId, domicilio, oficial }: ActualizarUsuarioCompletoInput) => {
      const actualizado = await actualizarUsuario(id, usuario);
      if (rolId !== undefined) {
        await cambiarRolUsuario(id, rolId);
      }
      await guardarDomicilioUsuario(id, domicilio);
      if (oficial) {
        await guardarOficial(id, oficial);
      }
      return actualizado;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.all });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useCambiarEstadoUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: "A" | "B" }) =>
      cambiarEstadoUsuario(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.all });
    },
  });
}
