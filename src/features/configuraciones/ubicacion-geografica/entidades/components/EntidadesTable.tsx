import type { EntidadResponse } from "../types/entidad";

interface EntidadesTableProps {
  entidades: EntidadResponse[] | undefined;
  isLoading: boolean;
  seleccionadaId: string | null;
  onSeleccionar: (entidad: EntidadResponse) => void;
}

export function EntidadesTable({
  entidades,
  isLoading,
  seleccionadaId,
  onSeleccionar,
}: EntidadesTableProps) {
  if (isLoading) {
    return (
      <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        Cargando entidades...
      </p>
    );
  }

  if (!entidades || entidades.length === 0) {
    return (
      <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        No hay entidades registradas.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-slate-500">
              Clave CURP
            </th>
            <th className="px-3 py-2 text-left font-medium text-slate-500">Nombre</th>
            <th className="px-3 py-2 text-left font-medium text-slate-500">País</th>
            <th className="px-3 py-2 text-left font-medium text-slate-500">Zona</th>
            <th className="px-3 py-2 text-left font-medium text-slate-500">
              Nivel de riesgo
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {entidades.map((entidad) => (
            <tr
              key={entidad.idEntidad}
              onClick={() => onSeleccionar(entidad)}
              className={
                entidad.idEntidad === seleccionadaId
                  ? "cursor-pointer bg-emerald-50"
                  : "cursor-pointer hover:bg-slate-50"
              }
            >
              <td className="px-3 py-2 font-medium text-slate-800">
                {entidad.claveCurp}
              </td>
              <td className="px-3 py-2 text-slate-700">{entidad.nombre}</td>
              <td className="px-3 py-2 text-slate-700">{entidad.nombrePais}</td>
              <td className="px-3 py-2 text-slate-700">{entidad.nombreZona}</td>
              <td className="px-3 py-2 text-slate-700">
                {entidad.nivelRiesgoDescripcion} ({entidad.nivelRiesgoValor})
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
