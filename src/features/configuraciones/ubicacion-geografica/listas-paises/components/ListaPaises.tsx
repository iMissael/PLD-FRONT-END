import { card, emptyState } from "@/shared/components/ui/styles";

import { usePaisesDeLista } from "../hooks/useListasPaises";
import type { ListaPaisResponse } from "../types/listaPais";

interface ListaPaisesProps {
  lista: ListaPaisResponse;
  onCerrar: () => void;
}

/** Países de una lista, en solo lectura. Se asignan desde la pantalla de Países. */
export function ListaPaises({ lista, onCerrar }: ListaPaisesProps) {
  const { data, isLoading } = usePaisesDeLista(lista.id, true);
  const paises = Array.isArray(data) ? data : [];

  return (
    <div className={`flex flex-col gap-4 p-4 ${card}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Países de la lista: {lista.nombre}</h3>
        <button
          type="button"
          onClick={onCerrar}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Cerrar
        </button>
      </div>
      <p className="text-sm font-medium text-foreground">Países asignados ({paises.length})</p>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : paises.length > 0 ? (
        <ul className="max-h-96 divide-y divide-border overflow-y-auto rounded-md border border-border">
          {paises.map((pais) => (
            <li key={pais.id} className="px-3 py-2 text-sm text-foreground">
              {pais.nombre}
              {pais.codigoIso ? <span className="text-muted-foreground"> · {pais.codigoIso}</span> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className={emptyState}>Esta lista no tiene países asignados.</p>
      )}
    </div>
  );
}
