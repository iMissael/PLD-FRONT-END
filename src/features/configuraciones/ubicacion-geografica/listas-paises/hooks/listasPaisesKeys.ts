<<<<<<< HEAD
import type { EstatusLista } from "../types/listaPais";

export const listasPaisesKeys = {
  all: ["listas-paises"] as const,
  listas: () => [...listasPaisesKeys.all, "lista"] as const,
  lista: (estatus?: EstatusLista) => [...listasPaisesKeys.listas(), estatus ?? null] as const,
  paisesDeLista: (id: string) => [...listasPaisesKeys.all, "paises", id] as const,
=======
import type { EstatusListaPais } from "../types/listaPais";

export const listasPaisesKeys = {
  all: ["listas-paises"] as const,
  lists: () => [...listasPaisesKeys.all, "list"] as const,
  list: (estatus?: EstatusListaPais) =>
    [...listasPaisesKeys.lists(), { estatus }] as const,
  details: () => [...listasPaisesKeys.all, "detail"] as const,
  detail: (id: string) => [...listasPaisesKeys.details(), id] as const,
  paisesDeLista: (id: string) =>
    [...listasPaisesKeys.detail(id), "paises"] as const,
  paisesConListas: () => [...listasPaisesKeys.all, "paises-con-listas"] as const,
  listasDePais: (idPais: string) =>
    [...listasPaisesKeys.all, "pais", idPais, "listas"] as const,
>>>>>>> origin/develop
};
