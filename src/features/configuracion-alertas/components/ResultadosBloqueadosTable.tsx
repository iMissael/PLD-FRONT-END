import { isAppError } from "@/api/interceptors/errorInterceptor";

import type { ResultadoBusquedaResponse } from "../types/personaBloqueada";

interface ResultadosBloqueadosTableProps {
  resultados: ResultadoBusquedaResponse[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  /** true cuando aún no se ha disparado ninguna búsqueda (query deshabilitado). */
  sinBusqueda: boolean;
}

function Campo({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="text-sm text-slate-800">{value ?? "—"}</dd>
    </div>
  );
}

function ResultadoCard({ resultado }: { resultado: ResultadoBusquedaResponse }) {
  const { personaPrincipal, alias, coincidenciaViaAlias, aliasCoincidentes } = resultado;

  return (
    <li className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-900">
          {personaPrincipal.nombreCompleto}
        </h3>
        <div className="flex gap-2">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {personaPrincipal.estatus}
          </span>
          <span
            className={
              coincidenciaViaAlias
                ? "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                : "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
            }
          >
            {coincidenciaViaAlias ? "Coincidencia vía alias" : "Coincidencia directa"}
          </span>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Campo label="RFC" value={personaPrincipal.rfc} />
        <Campo label="CURP" value={personaPrincipal.curp} />
        <Campo label="País" value={personaPrincipal.pais} />
        <Campo label="Lista" value={personaPrincipal.nombreLista} />
        <Campo label="Fecha de nacimiento" value={personaPrincipal.fechaNacimiento} />
        <Campo label="Fecha de publicación" value={personaPrincipal.fechaPublicacion} />
        <Campo label="Oficio" value={personaPrincipal.oficio} />
      </dl>

      {coincidenciaViaAlias && aliasCoincidentes.length > 0 ? (
        <p className="mt-3 text-sm text-amber-800">
          Coincidió por el/los alias: {aliasCoincidentes.join(", ")}
        </p>
      ) : null}

      {alias.length > 0 ? (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Alias registrados ({alias.length})
          </p>
          <ul className="mt-1 flex flex-col gap-1">
            {alias.map((unAlias) => (
              <li key={unAlias.id} className="text-sm text-slate-600">
                {unAlias.nombreCompleto}
                {unAlias.rfc ? ` · RFC ${unAlias.rfc}` : ""}
                {unAlias.curp ? ` · CURP ${unAlias.curp}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

export function ResultadosBloqueadosTable({
  resultados,
  isLoading,
  isError,
  error,
  sinBusqueda,
}: ResultadosBloqueadosTableProps) {
  if (sinBusqueda) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
        Ingresa al menos un criterio y presiona "Buscar" para consultar.
      </p>
    );
  }

  if (isLoading) {
    return (
      <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        Buscando coincidencias...
      </p>
    );
  }

  if (isError) {
    const mensaje = isAppError(error) ? error.message : "Ocurrió un error inesperado.";
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
        {mensaje}
      </p>
    );
  }

  if (!resultados || resultados.length === 0) {
    return (
      <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        Sin coincidencias.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {resultados.map((resultado) => (
        <ResultadoCard key={resultado.personaPrincipal.id} resultado={resultado} />
      ))}
    </ul>
  );
}
