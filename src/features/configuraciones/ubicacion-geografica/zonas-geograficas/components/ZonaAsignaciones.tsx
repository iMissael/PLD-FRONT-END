import { useMemo } from "react";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import { Button } from "@/shared/components/ui/CatalogoButton";
import { card } from "@/shared/components/ui/styles";
import { useEntidadesDeZona } from "../hooks/useZonasGeograficas";
import type {
  EntidadAsignadaResponse,
  ZonaGeograficaResponse,
} from "../types/zonaGeografica";

interface ZonaAsignacionesProps {
  zona: ZonaGeograficaResponse;
  onCerrar: () => void;
}

/**
 * Panel de visualización paginado de las entidades asignadas a una zona geográfica de riesgo.
 */
export function ZonaAsignaciones({ zona, onCerrar }: ZonaAsignacionesProps) {
  const { data: entidadesDeZona, isLoading } = useEntidadesDeZona(zona.id, true);

  const listaEntidades = useMemo(() => {
    if (!entidadesDeZona) return [];
    if (Array.isArray(entidadesDeZona)) return entidadesDeZona;
    if (
      Array.isArray(
        (entidadesDeZona as unknown as { contenido?: EntidadAsignadaResponse[] })
          ?.contenido,
      )
    ) {
      return (
        (entidadesDeZona as unknown as { contenido: EntidadAsignadaResponse[] })
          .contenido ?? []
      );
    }
    return [];
  }, [entidadesDeZona]);

  const columns: ColumnDef<EntidadAsignadaResponse>[] = useMemo(
    () => [
      {
        header: "Clave CURP",
        accessorKey: "claveCurp",
        className: "font-mono font-semibold text-foreground",
        width: "150px",
      },
      {
        header: "Entidad",
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
            Entidades de la zona: {zona.nombre}
          </h3>
          <p className="text-xs text-muted-foreground">
            Consulta las entidades federativas asignadas a esta zona de riesgo.
          </p>
        </div>
        <Button variante="secundario" size="sm" onClick={onCerrar}>
          Cerrar
        </Button>
      </div>

      <DataTable
        data={listaEntidades}
        columns={columns}
        isLoading={isLoading}
        loadingMessage="Cargando entidades asignadas..."
        emptyMessage="Esta zona no tiene entidades asignadas."
        getRowId={(entidad) => entidad.id}
        search={{
          placeholder: "Buscar entidad por nombre o CURP...",
          filterFn: (entidad, term) => {
            const t = term.toLowerCase().trim();
            return (
              (entidad.nombre?.toLowerCase().includes(t) ?? false) ||
              (entidad.claveCurp?.toLowerCase().includes(t) ?? false) ||
              (entidad.id?.toLowerCase().includes(t) ?? false)
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
