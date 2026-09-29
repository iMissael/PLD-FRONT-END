import { apiClient } from "@/api/client";
import type {
  CanalPagoResponse,
  CatActividadEconomicaResponse,
  CatalogoIdentidadResponse,
  DestinoRecursoResponse,
  EntidadGeograficaResponse,
  LocalidadResponse,
  MunicipioResponse,
  OrigenRecursoResponse,
  PaisResponse,
  PepResponse,
  SucursalResponse,
  TipoCreditoResponse,
  TipoPagoResponse,
  TipoPersonaResponse,
} from "@/features/catalogos/types/catalogos";

export async function listarNacionalidades() {
  const { data } = await apiClient.get<CatalogoIdentidadResponse[]>(
    "/catalogos/identidad/nacionalidades",
  );
  return data;
}

export async function listarEstadosCiviles() {
  const { data } = await apiClient.get<CatalogoIdentidadResponse[]>(
    "/catalogos/identidad/estados-civiles",
  );
  return data;
}

export async function listarNivelesEstudios() {
  const { data } = await apiClient.get<CatalogoIdentidadResponse[]>(
    "/catalogos/identidad/niveles-estudios",
  );
  return data;
}

export async function listarTiposIdentificacion() {
  const { data } = await apiClient.get<CatalogoIdentidadResponse[]>(
    "/catalogos/identidad/tipos-identificacion",
  );
  return data;
}

export async function listarSucursales() {
  const { data } = await apiClient.get<SucursalResponse[]>("/catalogos/sucursales");
  return data;
}

export async function listarPaises() {
  const { data } = await apiClient.get<PaisResponse[]>("/catalogos/paises");
  return data;
}

export async function listarEntidades() {
  const { data } =
    await apiClient.get<EntidadGeograficaResponse[]>("/catalogos/entidades");
  return data;
}

export async function listarTiposComprobante() {
  const { data } = await apiClient.get<CatalogoIdentidadResponse[]>(
    "/catalogos/identidad/tipos-comprobante",
  );
  return data;
}

export async function listarTiposVialidad() {
  const { data } = await apiClient.get<CatalogoIdentidadResponse[]>(
    "/catalogos/identidad/tipos-vialidad",
  );
  return data;
}

export async function listarPosesionesVivienda() {
  const { data } = await apiClient.get<CatalogoIdentidadResponse[]>(
    "/catalogos/identidad/posesiones-vivienda",
  );
  return data;
}

export async function listarTiposAsentamiento() {
  const { data } = await apiClient.get<CatalogoIdentidadResponse[]>(
    "/catalogos/identidad/tipos-asentamiento",
  );
  return data;
}

export async function listarMunicipios(entidadId?: number) {
  const { data } = await apiClient.get<MunicipioResponse[]>("/catalogos/municipios", {
    params: entidadId ? { entidadId } : undefined,
  });
  return data;
}

export async function listarLocalidades(idMunicipio?: number) {
  const { data } = await apiClient.get<LocalidadResponse[]>("/catalogos/localidades", {
    params: idMunicipio ? { idMunicipio } : undefined,
  });
  return data;
}

export async function listarActividadesEconomicas() {
  const { data } = await apiClient.get<CatActividadEconomicaResponse[]>(
    "/catalogos/actividades-economicas",
  );
  return data;
}

export async function listarTiposPersona() {
  const { data } = await apiClient.get<TipoPersonaResponse[]>("/catalogos/tipos-persona");
  return data;
}

export async function listarPeps() {
  const { data } = await apiClient.get<PepResponse[]>("/catalogos/peps");
  return data;
}

export async function listarTiposCredito() {
  const { data } = await apiClient.get<TipoCreditoResponse[]>("/catalogos/tipos-credito");
  return data;
}

export async function listarOrigenesRecurso() {
  const { data } = await apiClient.get<OrigenRecursoResponse[]>(
    "/catalogos/origenes-recurso",
  );
  return data;
}

export async function listarDestinosRecurso() {
  const { data } = await apiClient.get<DestinoRecursoResponse[]>(
    "/catalogos/destinos-recurso",
  );
  return data;
}

export async function listarCanalesPago() {
  const { data } = await apiClient.get<CanalPagoResponse[]>("/catalogos/canales-pago");
  return data;
}

export async function listarTiposPago() {
  const { data } = await apiClient.get<TipoPagoResponse[]>("/catalogos/tipos-pago");
  return data;
}
