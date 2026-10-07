import { apiClient } from "@/api/client";
import { listarCatalogoCompleto } from "@/api/paginacion";

<<<<<<< HEAD
import type { EstatusLista, ListaPaisInput, ListaPaisResponse, PaisEnListaResponse } from "../types/listaPais";

const BASE_PATH = "/catalogos/listas-paises";

export async function listarListas(estatus?: EstatusLista): Promise<ListaPaisResponse[]> {
  return listarCatalogoCompleto<ListaPaisResponse>(BASE_PATH, estatus ? { estatus } : undefined);
}

export async function crearLista(input: ListaPaisInput): Promise<ListaPaisResponse> {
=======
import type {
  ActualizarListaPaisInput,
  CrearListaPaisInput,
  EstatusListaPais,
  ListaPaisResponse, 
  PaisAsignadoResponse,
} from "../types/listaPais";

const BASE_PATH = "/catalogos/listas-paises";

export async function listarListasPaises(
  estatus?: EstatusListaPais,
): Promise<ListaPaisResponse[]> {
  return listarCatalogoCompleto<ListaPaisResponse>(
    BASE_PATH,
    estatus ? { estatus } : undefined,
  );
}

export async function obtenerListaPais(id: string): Promise<ListaPaisResponse> {
  const { data } = await apiClient.get<ListaPaisResponse>(`${BASE_PATH}/${id}`);
  return data;
}

export async function crearListaPais(
  input: CrearListaPaisInput,
): Promise<ListaPaisResponse> {
>>>>>>> origin/develop
  const { data } = await apiClient.post<ListaPaisResponse>(BASE_PATH, input);
  return data;
}

<<<<<<< HEAD
export async function actualizarLista(id: string, input: ListaPaisInput): Promise<ListaPaisResponse> {
  const { data } = await apiClient.put<ListaPaisResponse>(`${BASE_PATH}/${id}`, input);
  return data;
}

export async function eliminarLista(id: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/${id}`);
}

/** Países de una lista. Se pide solo al hacer clic en "Ver". */
export async function listarPaisesDeLista(id: string): Promise<PaisEnListaResponse[]> {
  const { data } = await apiClient.get<PaisEnListaResponse[]>(`${BASE_PATH}/${id}/paises`);
  return data;
}

export async function asignarPaisesALista(id: string, paisIds: string[]): Promise<void> {
  await apiClient.put(`${BASE_PATH}/${id}/paises`, { paisIds });
}
=======
export async function actualizarListaPais(
  id: string,
  input: ActualizarListaPaisInput,
): Promise<ListaPaisResponse> {
  const { data } = await apiClient.put<ListaPaisResponse>(
    `${BASE_PATH}/${id}`,
    input,
  );
  return data;
}

export async function cambiarEstatusListaPais(
  id: string,
  estatus: EstatusListaPais,
): Promise<ListaPaisResponse> {
  const { data } = await apiClient.patch<ListaPaisResponse>(
    `${BASE_PATH}/${id}/estatus`,
    null,
    { params: { estatus } },
  );
  return data;
}

export async function eliminarListaPais(id: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/${id}`);
}

/** Países asignados a una lista específica (`GET /catalogos/listas-paises/{id}/paises`). */
export async function listarPaisesDeLista(id: string): Promise<PaisAsignadoResponse[]> {
  const { data } = await apiClient.get<PaisAsignadoResponse[]>(
    `${BASE_PATH}/${id}/paises`,
  );
  return data;
}

/** Asigna países a una lista (`PUT /catalogos/listas-paises/{id}/paises`). */
export async function asignarPaisesALista(
  id: string,
  paisIds: string[],
): Promise<void> {
  await apiClient.put(`${BASE_PATH}/${id}/paises`, { paisIds });
}

/** Todos los países con listas asociadas (`GET /catalogos/listas-paises/paises`). */
export async function listarTodosLosPaisesConListas(): Promise<PaisAsignadoResponse[]> {
  const { data } = await apiClient.get<PaisAsignadoResponse[]>(`${BASE_PATH}/paises`);
  return data;
}

/** Listas a las que pertenece un país (`GET /catalogos/listas-paises/paises/{idPais}/listas`). */
export async function obtenerListasDePais(idPais: string): Promise<ListaPaisResponse[]> {
  const { data } = await apiClient.get<ListaPaisResponse[]>(
    `${BASE_PATH}/paises/${idPais}/listas`,
  );
  return data;
}
>>>>>>> origin/develop
