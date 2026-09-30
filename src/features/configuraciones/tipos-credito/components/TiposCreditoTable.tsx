import { emptyState, table } from "@/shared/components/ui/styles";

import { useTiposPrestamo } from "../../tipos-prestamo/hooks/useTiposPrestamo";
import { useNivelesRiesgo } from "../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { TipoCreditoResponse } from "../types/tipoCredito";

interface TiposCreditoTableProps {
  tipos: TipoCreditoResponse[] | undefined;
  isLoading: boolean;
  seleccionadoId: string | null;
  onSeleccionar: (tipo: TipoCreditoResponse) => void;
}

export function TiposCreditoTable({
  tipos,
  isLoading,
  seleccionadoId,
  onSeleccionar,
}: TiposCreditoTableProps) {
  const { data: niveles } = useNivelesRiesgo();
  const { data: tiposPrestamo } = useTiposPrestamo();

  const descripcionNivel = (catNivelRiesgoId: number) => {
    const nivel = niveles?.find((item) => item.id === catNivelRiesgoId);
    if (!nivel) return String(catNivelRiesgoId);
    return `${nivel.nivelRiesgoDescripcion} (${nivel.nivelRiesgoValor})`;
  };

  /**
   * Un `catTipoPrestamoId` vacío significa "sin asignar", no un dato faltante.
   * Si trae un id que ya no existe en el catálogo se muestra el id crudo, para
   * que el dato real quede visible en vez de desaparecer.
   */
  const nombreTipoPrestamo = (catTipoPrestamoId: string) => {
    if (!catTipoPrestamoId) return "— sin asignar —";
    const tipo = tiposPrestamo?.find((item) => item.id === catTipoPrestamoId);
    return tipo ? tipo.nombre : catTipoPrestamoId;
  };

  if (isLoading) {
    return <p className={emptyState}>Cargando tipos de crédito...</p>;
  }

  if (!tipos || tipos.length === 0) {
    return <p className={emptyState}>No hay tipos de crédito registrados.</p>;
  }

  return (
    <div className={table.wrapper}>
      <table className={table.root}>
        <thead className={table.head}>
          <tr>
            <th className={`w-16 ${table.headCell}`}>#</th>
            <th className={table.headCell}>Tipo de préstamo</th>
            <th className={table.headCell}>Nivel de riesgo</th>
          </tr>
        </thead>
        <tbody className={table.body}>
          {tipos.map((tipo, indice) => (
            <tr
              key={tipo.id}
              onClick={() => onSeleccionar(tipo)}
              className={table.row(tipo.id === seleccionadoId)}
            >
              {/* Consecutivo de fila, no el id del registro. */}
              <td className={table.cellMuted}>{indice + 1}</td>
              <td className={table.cellStrong}>
                {nombreTipoPrestamo(tipo.catTipoPrestamoId)}
              </td>
              <td className={table.cell}>{descripcionNivel(tipo.catNivelRiesgoId)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
