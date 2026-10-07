import { card, emptyState } from "@/shared/components/ui/styles";
import { usePaisesDeLista } from "../hooks/useListasPaises";
import type { ListaPaisResponse } from "../types/listaPais";

interface ListaPaisAsignacionesProps {
  lista: ListaPaisResponse;
  onCerrar: () => void;
}

export function ListaPaisAsignaciones({ lista, onCerrar }: ListaPaisAsignacionesProps) {
  const { data: paisesDeLista, isLoading } = usePaisesDeLista(lista.id);

  const listaPaises = Array.isArray(paisesDeLista)
    ? paisesDeLista
    : Array.isArray((paisesDeLista as unknown as { contenido?: typeof paisesDeLista })?.contenido)
    ? ((paisesDeLista as unknown as { contenido: typeof paisesDeLista }).contenido ?? [])
    : [];

  return (
    <div className={`flex flex-col gap-4 p-4 ${card}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Países de la lista: {lista.nombre}
        </h3>
        <button
          type="button"
          onClick={onCerrar}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Cerrar
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">
          Países asignados ({listaPaises.length})
        </p>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando países...</p>
        ) : listaPaises.length > 0 ? (
          <ul className="max-h-96 divide-y divide-border overflow-y-auto rounded-md border border-border">
            {listaPaises.map((pais) => (
              <li key={pais.id} className="flex items-center justify-between px-3 py-2 text-sm text-foreground">
                <span>{pais.nombre}</span>
                {pais.codigoIso ? (
                  <span className="font-mono text-xs text-muted-foreground">
                    {pais.codigoIso}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className={emptyState}>Esta lista no tiene países asignados.</p>
        )}
      </div>
    </div>
  );
}
