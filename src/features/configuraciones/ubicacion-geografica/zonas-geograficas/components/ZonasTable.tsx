import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { emptyState, table } from "@/shared/components/ui/styles";

import type { ZonaGeograficaResponse } from "../types/zonaGeografica";

interface ZonasTableProps {
  zonas: ZonaGeograficaResponse[] | undefined;
  isLoading: boolean;
  seleccionadaId: string | null;
  verId: string | null;
  onSeleccionar: (zona: ZonaGeograficaResponse) => void;
  onVer: (zona: ZonaGeograficaResponse) => void;
}

export function ZonasTable({
  zonas,
  isLoading,
  seleccionadaId,
  verId,
  onSeleccionar,
  onVer,
}: ZonasTableProps) {
  if (isLoading) {
    return <p className={emptyState}>Cargando zonas...</p>;
  }

  if (!zonas || zonas.length === 0) {
    return <p className={emptyState}>No hay zonas registradas.</p>;
  }

  return (
    <div className={table.wrapper}>
      <table className={table.root}>
        <thead className={table.head}>
          <tr>
            <th className={table.headCell}>Nombre</th>
            <th className={table.headCell}>Nivel de riesgo</th>
            <th className={table.headCell}>Entidades</th>
            <th className={table.headCell}>Países</th>
            <th className={table.headCell}>Estatus</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody className={table.body}>
          {zonas.map((zona) => (
            <tr
              key={zona.id}
              onClick={() => onSeleccionar(zona)}
              className={table.row(zona.id === seleccionadaId)}
            >
              <td className={table.cellStrong}>{zona.nombre}</td>
              <td className={table.cell}>
                {zona.nivelRiesgoDescripcion} ({zona.nivelRiesgoValor})
              </td>
              <td className={table.cell}>{zona.totalEntidadesAsignadas}</td>
              <td className={table.cell}>{zona.totalPaisesAsignados}</td>
              <td className="px-3 py-2">
                <Badge tono={zona.estatus === "A" ? "activo" : "inactivo"}>
                  {zona.estatus === "A" ? "Activa" : "Inactiva"}
                </Badge>
              </td>
              <td className="px-3 py-2 text-right">
                <Button
                  variante="secundario"
                  className={`px-3 py-1 text-xs ${zona.id === verId ? "border-fg text-fg" : ""}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onVer(zona);
                  }}
                >
                  Ver
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
