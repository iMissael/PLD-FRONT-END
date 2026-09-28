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
    return (
      <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        Cargando zonas...
      </p>
    );
  }

  if (!zonas || zonas.length === 0) {
    return (
      <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        No hay zonas registradas.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-slate-500">Nombre</th>
            <th className="px-3 py-2 text-left font-medium text-slate-500">
              Nivel de riesgo
            </th>
            <th className="px-3 py-2 text-left font-medium text-slate-500">Entidades</th>
            <th className="px-3 py-2 text-left font-medium text-slate-500">Países</th>
            <th className="px-3 py-2 text-left font-medium text-slate-500">Estatus</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {zonas.map((zona) => {
            const activa = zona.id === seleccionadaId;
            return (
              <tr
                key={zona.id}
                onClick={() => onSeleccionar(zona)}
                className={
                  activa
                    ? "cursor-pointer bg-success-soft/50"
                    : "cursor-pointer hover:bg-slate-50"
                }
              >
                <td className="px-3 py-2 font-medium text-slate-800">{zona.nombre}</td>
                <td className="px-3 py-2 text-slate-700">
                  {zona.nivelRiesgoDescripcion} ({zona.nivelRiesgoValor})
                </td>
                <td className="px-3 py-2 text-slate-700">
                  {zona.totalEntidadesAsignadas}
                </td>
                <td className="px-3 py-2 text-slate-700">{zona.totalPaisesAsignados}</td>
                <td className="px-3 py-2">
                  <span
                    className={
                      zona.estatus === "A"
                        ? "rounded-full bg-success-soft text-success-hover px-2 py-0.5 text-xs font-medium"
                        : "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                    }
                  >
                    {zona.estatus === "A" ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onVer(zona);
                    }}
                    className={
                      zona.id === verId
                        ? "rounded-md border border-slate-400 px-3 py-1 text-xs font-medium text-slate-800"
                        : "rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    }
                  >
                    Ver
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
