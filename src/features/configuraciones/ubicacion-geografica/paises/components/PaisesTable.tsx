import type { PaisResponse } from "../types/pais";

interface PaisesTableProps {
  paises: PaisResponse[] | undefined;
  isLoading: boolean;
  seleccionadoId: string | null;
  /** Mapa idZona -> nombreZona, para mostrar el nombre en vez del id crudo. */
  nombresDeZona: Record<string, string>;
  onSeleccionar: (pais: PaisResponse) => void;
}

/**
 * Tabla de países, con el mismo layout de columnas que la pantalla legacy
 * de escritorio ("Configuración de Países"): Clave, País y PLD Zona
 * Geográfica. Un país puede tener varias zonas asignadas (el legacy solo
 * manejaba una), así que aquí se muestran separadas por coma.
 */
export function PaisesTable({
  paises,
  isLoading,
  seleccionadoId,
  nombresDeZona,
  onSeleccionar,
}: PaisesTableProps) {
  if (isLoading) {
    return (
      <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        Cargando países...
      </p>
    );
  }

  if (!paises || paises.length === 0) {
    return (
      <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        No hay países registrados.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-700">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-white">Clave</th>
            <th className="px-3 py-2 text-left font-medium text-white">País</th>
            <th className="px-3 py-2 text-left font-medium text-white">
              PLD Zona Geográfica
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {paises.map((pais) => {
            const nombresZonas = pais.zonasAsignadas
              .map((id) => nombresDeZona[id])
              .filter((nombre): nombre is string => Boolean(nombre));

            return (
              <tr
                key={pais.idPais}
                onClick={() => onSeleccionar(pais)}
                className={
                  pais.idPais === seleccionadoId
                    ? "cursor-pointer bg-emerald-50"
                    : "cursor-pointer hover:bg-slate-50"
                }
              >
                <td className="px-3 py-2 font-medium text-slate-800">{pais.idPais}</td>
                <td className="px-3 py-2 text-slate-700">{pais.nombre}</td>
                <td className="px-3 py-2 text-slate-700">
                  {nombresZonas.length > 0 ? nombresZonas.join(", ") : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
