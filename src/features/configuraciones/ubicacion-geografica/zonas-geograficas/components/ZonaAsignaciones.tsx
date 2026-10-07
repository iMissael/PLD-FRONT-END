<<<<<<< HEAD
import { card, emptyState } from "@/shared/components/ui/styles";

import { useEntidadesDeZona } from "../hooks/useZonasGeograficas";
import type { ZonaGeograficaResponse } from "../types/zonaGeografica";
=======
import { useMemo } from "react";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import { Button } from "@/shared/components/ui/CatalogoButton";
import { card } from "@/shared/components/ui/styles";
import { useEntidadesDeZona } from "../hooks/useZonasGeograficas";
import type {
  EntidadAsignadaResponse,
  ZonaGeograficaResponse,
} from "../types/zonaGeografica";
>>>>>>> origin/develop

interface ZonaAsignacionesProps {
  zona: ZonaGeograficaResponse;
  onCerrar: () => void;
}

/**
<<<<<<< HEAD
 * Panel de "Ver" de una zona: solo lectura, con las entidades que ya están en
 * esa zona. La asignación se hace desde la pantalla de Entidades.
 */
export function ZonaAsignaciones({ zona, onCerrar }: ZonaAsignacionesProps) {
  const { data, isLoading } = useEntidadesDeZona(zona.id, true);
  const entidades = Array.isArray(data) ? data : [];
=======
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
>>>>>>> origin/develop

  return (
    <div className={`flex flex-col gap-4 p-4 ${card}`}>
      <div className="flex items-center justify-between">
        <div>
<<<<<<< HEAD
          <h3 className="text-sm font-semibold text-foreground">Entidades de la zona: {zona.nombre}</h3>
          {zona.esEntidadEspecial ? (
            <p className="text-xs text-muted-foreground">
              Zona especial: cada entidad conserva el nivel de su zona principal.
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onCerrar}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
=======
          <h3 className="text-sm font-semibold text-foreground">
            Entidades de la zona: {zona.nombre}
          </h3>
          <p className="text-xs text-muted-foreground">
            Consulta las entidades federativas asignadas a esta zona de riesgo.
          </p>
        </div>
        <Button variante="secundario" size="sm" onClick={onCerrar}>
>>>>>>> origin/develop
          Cerrar
        </Button>
      </div>

<<<<<<< HEAD
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">Entidades asignadas ({entidades.length})</p>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando...</p>
        ) : entidades.length > 0 ? (
          <ul className="max-h-96 divide-y divide-border overflow-y-auto rounded-md border border-border">
            {entidades.map((entidad) => (
              <li key={entidad.id} className="px-3 py-2 text-sm text-foreground">
                {entidad.nombre}
              </li>
            ))}
          </ul>
        ) : (
          <p className={emptyState}>Esta zona no tiene entidades asignadas.</p>
        )}
      </div>
=======
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
>>>>>>> origin/develop
    </div>
  );
}
