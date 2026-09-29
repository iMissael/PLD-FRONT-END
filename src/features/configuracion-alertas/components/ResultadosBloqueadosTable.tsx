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
      <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
        {label}
      </dt>
      <dd className="text-foreground text-sm">{value ?? "—"}</dd>
    </div>
  );
}

function ResultadoCard({ resultado }: { resultado: ResultadoBusquedaResponse }) {
  const { personaPrincipal, alias, coincidenciaViaAlias, aliasCoincidentes } = resultado;

  return (
    <li className="border-border bg-card rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-foreground text-base font-semibold">
          {personaPrincipal.nombreCompleto}
        </h3>
        <div className="flex gap-2">
          <span className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-xs font-medium">
            {personaPrincipal.estatus}
          </span>
          <span
            className={
              coincidenciaViaAlias
                ? "bg-warning-soft text-warning-hover rounded-full px-2 py-0.5 text-xs font-medium"
                : "rounded-full bg-success-soft text-success-hover px-2 py-0.5 text-xs font-medium"
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
        <p className="text-warning-hover mt-3 text-sm">
          Coincidió por el/los alias: {aliasCoincidentes.join(", ")}
        </p>
      ) : null}

      {alias.length > 0 ? (
        <div className="border-border mt-3 border-t pt-3">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            Alias registrados ({alias.length})
          </p>
          <ul className="mt-1 flex flex-col gap-1">
            {alias.map((unAlias) => (
              <li key={unAlias.id} className="text-muted-foreground text-sm">
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
      <p className="border-border text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
        Ingresa al menos un criterio y presiona "Buscar" para consultar.
      </p>
    );
  }

  if (isLoading) {
    return (
      <p className="border-border bg-card text-muted-foreground rounded-lg border p-6 text-center text-sm">
        Buscando coincidencias...
      </p>
    );
  }

  if (isError) {
    const mensaje = isAppError(error) ? error.message : "Ocurrió un error inesperado.";
    return (
      <p className="border-destructive-soft bg-destructive-soft text-destructive rounded-lg border p-6 text-center text-sm">
        {mensaje}
      </p>
    );
  }

  if (!resultados || resultados.length === 0) {
    return (
      <p className="border-border bg-card text-muted-foreground rounded-lg border p-6 text-center text-sm">
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
