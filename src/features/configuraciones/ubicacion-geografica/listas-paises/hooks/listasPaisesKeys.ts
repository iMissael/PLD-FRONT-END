import type { EstatusLista } from "../types/listaPais";

export const listasPaisesKeys = {
  all: ["listas-paises"] as const,
  listas: () => [...listasPaisesKeys.all, "lista"] as const,
  lista: (estatus?: EstatusLista) => [...listasPaisesKeys.listas(), estatus ?? null] as const,
  paisesDeLista: (id: string) => [...listasPaisesKeys.all, "paises", id] as const,
};
