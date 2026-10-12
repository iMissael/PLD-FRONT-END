import { apiClient } from "@/api/client";
import { listarCatalogoCompleto } from "@/api/paginacion";
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
  return listarCatalogoCompleto<SucursalResponse>("/catalogos/sucursales");
}

export async function listarPaises() {
  return listarCatalogoCompleto<PaisResponse>("/catalogos/paises");
}

export async function listarEntidades() {
  return listarCatalogoCompleto<EntidadGeograficaResponse>("/catalogos/entidades");
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
  return listarCatalogoCompleto<MunicipioResponse>(
    "/catalogos/municipios",
    entidadId ? { entidadId } : undefined,
  );
}

export async function listarLocalidades(idMunicipio?: number) {
  return listarCatalogoCompleto<LocalidadResponse>(
    "/catalogos/localidades",
    idMunicipio ? { idMunicipio } : undefined,
  );
}

export async function listarActividadesEconomicas() {
  return listarCatalogoCompleto<CatActividadEconomicaResponse>(
    "/catalogos/actividades-economicas",
  );
}

export async function listarTiposPersona() {
  return listarCatalogoCompleto<TipoPersonaResponse>("/catalogos/tipos-persona");
}

/**
 * Condición de PEP, para el `<select>` del subfactor 6 de la evaluación de
 * riesgo.
 *
 * Tiene que apuntar al mismo catálogo con el que el backend puntúa el
 * subfactor (`cat_peps`, ver `ConsultaAdapter.obtenerPuntajePep`). Los dos
 * catálogos de PEP empiezan en el id 1, así que apuntar al equivocado no da
 * error: puntúa un registro distinto con el mismo número.
 */
export async function listarPeps() {
  return listarCatalogoCompleto<PepResponse>("/catalogos/peps");
}

export async function listarTiposCredito() {
  return listarCatalogoCompleto<TipoCreditoResponse>("/catalogos/tipos-credito");
}

export async function listarOrigenesRecurso() {
  return listarCatalogoCompleto<OrigenRecursoResponse>("/catalogos/origenes-recurso");
}

export async function listarDestinosRecurso() {
  return listarCatalogoCompleto<DestinoRecursoResponse>("/catalogos/destinos-recurso");
}

export async function listarCanalesPago() {
  return listarCatalogoCompleto<CanalPagoResponse>("/catalogos/canales-pago");
}

export async function listarTiposPago() {
  return listarCatalogoCompleto<TipoPagoResponse>("/catalogos/tipos-pago");
}
