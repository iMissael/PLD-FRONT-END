import { useQuery } from "@tanstack/react-query";
import {
  listarActividadesEconomicas,
  listarCanalesPago,
  listarDestinosRecurso,
  listarEntidades,
  listarEstadosCiviles,
  listarLocalidades,
  listarMunicipios,
  listarNacionalidades,
  listarNivelesEstudios,
  listarOrigenesRecurso,
  listarPaises,
  listarPeps,
  listarPosesionesVivienda,
  listarSucursales,
  listarTiposAsentamiento,
  listarTiposComprobante,
  listarTiposCredito,
  listarTiposIdentificacion,
  listarTiposPago,
  listarTiposPersona,
  listarTiposVialidad,
} from "@/features/catalogos/api/catalogosApi";

export function useNacionalidades() {
  return useQuery({
    queryKey: ["catalogos", "nacionalidades"],
    queryFn: listarNacionalidades,
    staleTime: Infinity,
  });
}

export function useEstadosCiviles() {
  return useQuery({
    queryKey: ["catalogos", "estados-civiles"],
    queryFn: listarEstadosCiviles,
    staleTime: Infinity,
  });
}

export function useNivelesEstudios() {
  return useQuery({
    queryKey: ["catalogos", "niveles-estudios"],
    queryFn: listarNivelesEstudios,
    staleTime: Infinity,
  });
}

export function useTiposIdentificacion() {
  return useQuery({
    queryKey: ["catalogos", "tipos-identificacion"],
    queryFn: listarTiposIdentificacion,
    staleTime: Infinity,
  });
}

export function useSucursales() {
  return useQuery({
    queryKey: ["catalogos", "sucursales"],
    queryFn: listarSucursales,
    staleTime: Infinity,
  });
}

export function usePaises() {
  return useQuery({
    queryKey: ["catalogos", "paises"],
    queryFn: listarPaises,
    staleTime: Infinity,
  });
}

export function useEntidades() {
  return useQuery({
    queryKey: ["catalogos", "entidades"],
    queryFn: listarEntidades,
    staleTime: Infinity,
  });
}

export function useTiposComprobante() {
  return useQuery({
    queryKey: ["catalogos", "tipos-comprobante"],
    queryFn: listarTiposComprobante,
    staleTime: Infinity,
  });
}

export function useTiposVialidad() {
  return useQuery({
    queryKey: ["catalogos", "tipos-vialidad"],
    queryFn: listarTiposVialidad,
    staleTime: Infinity,
  });
}

export function usePosesionesVivienda() {
  return useQuery({
    queryKey: ["catalogos", "posesiones-vivienda"],
    queryFn: listarPosesionesVivienda,
    staleTime: Infinity,
  });
}

export function useTiposAsentamiento() {
  return useQuery({
    queryKey: ["catalogos", "tipos-asentamiento"],
    queryFn: listarTiposAsentamiento,
    staleTime: Infinity,
  });
}

export function useMunicipios(entidadId?: number) {
  return useQuery({
    queryKey: ["catalogos", "municipios", entidadId ?? null],
    queryFn: () => listarMunicipios(entidadId),
    staleTime: Infinity,
    enabled: Boolean(entidadId),
  });
}

export function useLocalidades(idMunicipio?: number) {
  return useQuery({
    queryKey: ["catalogos", "localidades", idMunicipio ?? null],
    queryFn: () => listarLocalidades(idMunicipio),
    staleTime: Infinity,
    enabled: Boolean(idMunicipio),
  });
}

export function useActividadesEconomicas() {
  return useQuery({
    queryKey: ["catalogos", "actividades-economicas"],
    queryFn: listarActividadesEconomicas,
    staleTime: Infinity,
  });
}

export function useTiposPersona() {
  return useQuery({
    queryKey: ["catalogos", "tipos-persona"],
    queryFn: listarTiposPersona,
    staleTime: Infinity,
  });
}

export function usePeps() {
  return useQuery({
    queryKey: ["catalogos", "peps"],
    queryFn: listarPeps,
    staleTime: Infinity,
  });
}

export function useTiposCredito() {
  return useQuery({
    queryKey: ["catalogos", "tipos-credito"],
    queryFn: listarTiposCredito,
    staleTime: Infinity,
  });
}

export function useOrigenesRecurso() {
  return useQuery({
    queryKey: ["catalogos", "origenes-recurso"],
    queryFn: listarOrigenesRecurso,
    staleTime: Infinity,
  });
}

export function useDestinosRecurso() {
  return useQuery({
    queryKey: ["catalogos", "destinos-recurso"],
    queryFn: listarDestinosRecurso,
    staleTime: Infinity,
  });
}

export function useCanalesPago() {
  return useQuery({
    queryKey: ["catalogos", "canales-pago"],
    queryFn: listarCanalesPago,
    staleTime: Infinity,
  });
}

export function useTiposPago() {
  return useQuery({
    queryKey: ["catalogos", "tipos-pago"],
    queryFn: listarTiposPago,
    staleTime: Infinity,
  });
}
