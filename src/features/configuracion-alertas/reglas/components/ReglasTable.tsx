import { Badge } from "@/shared/components/ui/CatalogoBadge";
import { TablePagination } from "@/shared/components/ui/TablePagination";
import { card, emptyState, table } from "@/shared/components/ui/styles";

import type { ReglaAlerta } from "../types/reglaAlerta";

interface ReglasTableProps {
  reglas: ReglaAlerta[] | undefined;
  isLoading: boolean;
  seleccionadaId: string | null;
  onSeleccionar: (regla: ReglaAlerta) => void;
  pagina: number;
  tamanio: number;
  totalElementos: number;
  onCambiarPagina: (pagina: number) => void;
  onCambiarTamanio: (tamanio: number) => void;
}

/** Celdas compactas: la tabla es un selector, el detalle se ve en el formulario. */
const celda = "px-3 py-1.5";
const encabezado = `${table.headCell} sticky top-0 bg-muted py-1.5`;

/**
 * Listado de reglas: #, tipo de alerta, descripción y estatus; el resto se ve en el formulario
 * al seleccionar una. Altura fija con scroll (~7 renglones). No usa `table.wrapper`
 * porque trae `overflow-hidden` y anula el scroll.
 */
export function ReglasTable({
  reglas,
  isLoading,
  seleccionadaId,
  onSeleccionar,
  pagina,
  tamanio,
  totalElementos,
  onCambiarPagina,
  onCambiarTamanio,
}: ReglasTableProps) {
  if (isLoading) return <p className={emptyState}>Cargando reglas de alerta...</p>;
  if (!reglas || reglas.length === 0)
    return <p className={emptyState}>No hay reglas con estos filtros.</p>;

  return (
    <div className={card}>
      <div className="max-h-72 overflow-auto">
        <table className={table.root}>
          <thead className={table.head}>
            <tr>
              <th className={`${encabezado} w-12`}>#</th>
              <th className={`${encabezado} w-28 text-center`}>Tipo de alerta</th>
              <th className={encabezado}>Descripción</th>
              <th className={`${encabezado} w-28`}>Estatus</th>
            </tr>
          </thead>
          <tbody className={table.body}>
            {reglas.map((regla, i) => (
              <tr
                key={regla.idConfiguracionAlerta}
                onClick={() => onSeleccionar(regla)}
                className={table.row(regla.idConfiguracionAlerta === seleccionadaId)}
              >
                <td className={`${celda} text-muted-foreground`}>
                  {pagina * tamanio + i + 1}
                </td>
                <td
                  className={`${celda} text-foreground text-center font-medium`}
                  title={regla.tipoAlertaDescripcion ?? undefined}
                >
                  {regla.alertaAcronimo}
                </td>
                <td
                  className={`${celda} text-foreground max-w-0 truncate`}
                  title={regla.descripcion}
                >
                  {regla.descripcion}
                </td>
                <td className={celda}>
                  <Badge tono={regla.estado === "ACTIVO" ? "activo" : "inactivo"}>
                    {regla.estado === "ACTIVO" ? "Activa" : "Inactiva"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TablePagination
        count={totalElementos}
        page={pagina}
        rowsPerPage={tamanio}
        onPageChange={(_, nuevaPagina) => onCambiarPagina(nuevaPagina)}
        onRowsPerPageChange={(e) => onCambiarTamanio(Number(e.target.value))}
        rowsPerPageOptions={[10, 20, 50]}
      />
    </div>
  );
}
