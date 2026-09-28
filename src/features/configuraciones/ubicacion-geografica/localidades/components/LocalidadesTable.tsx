import type { LocalidadResponse } from "../types/localidad";

interface LocalidadesTableProps {
  localidades: LocalidadResponse[] | undefined;
  isLoading: boolean;
  seleccionadaId: string | null;
  onSeleccionar: (localidad: LocalidadResponse) => void;
}

export function LocalidadesTable({
  localidades,
  isLoading,
  seleccionadaId,
  onSeleccionar,
}: LocalidadesTableProps) {
  if (isLoading) {
    return (
      <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        Cargando localidades...
      </p>
    );
  }

  if (!localidades || localidades.length === 0) {
    return (
      <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        No hay localidades registradas.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-slate-500">Nombre</th>
            <th className="px-3 py-2 text-left font-medium text-slate-500">Municipio</th>
            <th className="px-3 py-2 text-left font-medium text-slate-500">
              Tipo de asentamiento
            </th>
            <th className="px-3 py-2 text-left font-medium text-slate-500">
              Nivel de riesgo
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {localidades.map((localidad) => (
            <tr
              key={localidad.idLocalidad}
              onClick={() => onSeleccionar(localidad)}
              className={
                localidad.idLocalidad === seleccionadaId
                  ? "cursor-pointer bg-success-soft/50"
                  : "cursor-pointer hover:bg-slate-50"
              }
            >
              <td className="px-3 py-2 font-medium text-slate-800">{localidad.nombre}</td>
              <td className="px-3 py-2 text-slate-700">{localidad.nombreMunicipio}</td>
              <td className="px-3 py-2 text-slate-700">{localidad.tipoAsentamiento}</td>
              <td className="px-3 py-2 text-slate-700">
                {localidad.nivelRiesgoDescripcion} ({localidad.nivelRiesgoValor})
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
