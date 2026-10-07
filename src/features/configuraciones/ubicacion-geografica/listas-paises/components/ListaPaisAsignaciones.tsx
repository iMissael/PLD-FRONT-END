import { useMemo } from "react";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import { Button } from "@/shared/components/ui/CatalogoButton";
import { card } from "@/shared/components/ui/styles";
import { usePaisesDeLista } from "../hooks/useListasPaises";
import type { ListaPaisResponse, PaisAsignadoResponse } from "../types/listaPais";

interface ListaPaisAsignacionesProps {
  lista: ListaPaisResponse;
  onCerrar: () => void;
}

/**
 * Panel de visualización paginado de los países asignados a una lista de países de riesgo.
 */
export function ListaPaisAsignaciones({ lista, onCerrar }: ListaPaisAsignacionesProps) {
  const { data: paisesDeLista, isLoading } = usePaisesDeLista(lista.id);

  const listaPaises = useMemo(() => {
    if (!paisesDeLista) return [];
    if (Array.isArray(paisesDeLista)) return paisesDeLista;
    if (
      Array.isArray(
        (paisesDeLista as unknown as { contenido?: PaisAsignadoResponse[] })?.contenido,
      )
    ) {
      return (
        (paisesDeLista as unknown as { contenido: PaisAsignadoResponse[] }).contenido ??
        []
      );
    }
    return [];
  }, [paisesDeLista]);

  const columns: ColumnDef<PaisAsignadoResponse>[] = useMemo(
    () => [
      {
        header: "Clave",
        accessorKey: "id",
        className: "font-mono font-semibold text-foreground",
        width: "120px",
      },
      {
        header: "Código ISO",
        cell: (pais) => (
          <span className="font-mono uppercase text-muted-foreground">
            {pais.codigoIso || "—"}
          </span>
        ),
        width: "130px",
      },
      {
        header: "País",
        accessorKey: "nombre",
        className: "font-medium text-foreground",
      },
    ],
    [],
  );

  return (
    <div className={`flex flex-col gap-4 p-4 ${card}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Países de la lista: {lista.nombre}
          </h3>
          <p className="text-xs text-muted-foreground">
            Consulta los países asignados a esta lista de riesgo.
          </p>
        </div>
        <Button variante="secundario" size="sm" onClick={onCerrar}>
          Cerrar
        </Button>
      </div>

      <DataTable
        data={listaPaises}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="Cargando países asignados..."
        emptyMessage="Esta lista no tiene países asignados."
        getRowId={(pais) => pais.id}
        search={{
          placeholder: "Buscar país por nombre, clave o código ISO...",
          filterFn: (pais, term) => {
            const t = term.toLowerCase().trim();
            return (
              (pais.nombre?.toLowerCase().includes(t) ?? false) ||
              (pais.id?.toLowerCase().includes(t) ?? false) ||
              (pais.codigoIso?.toLowerCase().includes(t) ?? false)
            );
          },
        }}
        pagination={{
          mode: "client",
          defaultRowsPerPage: 5,
          rowsPerPageOptions: [10, 25, 30],
        }}
      />
    </div>
  );
}
