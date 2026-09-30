import { useRef, useState } from "react";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { UploadIcon } from "@/shared/components/icons";

import { useCargaMasivaPersonasBloqueadas } from "../hooks/usePersonasBloqueadasMutations";

const ACCEPTED_EXTENSIONS = ".csv,.xlsx";

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "brand" | "neutral" | "warn";
}) {
  const toneClasses =
    tone === "brand"
      ? "border-success/30 bg-success-soft text-success dark:text-success"
      : tone === "warn"
        ? "border-warning/30 bg-warning-soft text-warning dark:text-warning"
        : "border-border bg-muted/50 text-foreground";

  return (
    <div className={`flex-1 rounded-xl border p-4 shadow-xs ${toneClasses}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

export function CargaMasivaPage() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mutation = useCargaMasivaPersonasBloqueadas();

  const handleArchivoSeleccionado = (files: FileList | null) => {
    const seleccionado = files?.[0] ?? null;
    setArchivo(seleccionado);
    mutation.reset();
  };

  const handleSubir = () => {
    if (!archivo) return;
    mutation.mutate(archivo);
  };

  const resultado = mutation.data;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Carga masiva</h2>
        <p className="text-sm text-muted-foreground">
          Sube un archivo CSV o XLSX con personas bloqueadas para procesarlas en lote.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-10 text-center transition-colors hover:border-primary hover:bg-primary/5 cursor-pointer"
        >
          <span className="bg-primary text-primary-foreground flex h-11 w-11 items-center justify-center rounded-full shadow-xs">
            <UploadIcon className="h-5 w-5" />
          </span>
          <span className="text-sm font-medium text-foreground">
            {archivo ? archivo.name : "Haz clic para elegir un archivo (.csv, .xlsx)"}
          </span>
          {archivo && (
            <span className="text-xs text-muted-foreground">
              {(archivo.size / 1024).toFixed(1)} KB
            </span>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          className="hidden"
          onChange={(event) => handleArchivoSeleccionado(event.target.files)}
        />

        <div className="mt-4 flex items-center justify-between gap-4">
          {mutation.isError ? (
            <p className="text-sm text-destructive">
              {isAppError(mutation.error)
                ? mutation.error.message
                : "Ocurrió un error inesperado al subir el archivo."}
            </p>
          ) : (
            <span />
          )}
          <button
            type="button"
            disabled={!archivo || mutation.isPending}
            onClick={handleSubir}
            className="bg-primary hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mutation.isPending ? "Procesando..." : "Subir archivo"}
          </button>
        </div>
      </div>

      {resultado && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <StatCard
              label="Total de filas"
              value={resultado.totalFilas}
              tone="neutral"
            />
            <StatCard label="Exitosos" value={resultado.exitosos} tone="brand" />
            <StatCard label="Fallidos" value={resultado.fallidos} tone="warn" />
          </div>

          {resultado.detalleErrores.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-muted-foreground">
                      Fila
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-muted-foreground">
                      Error
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {resultado.detalleErrores.map((detalle, index) => (
                    // No hay id único en el DTO; fila+índice es estable para esta lista de solo lectura.
                    <tr key={`${detalle.numeroFila}-${index}`} className="hover:bg-muted/30">
                      <td className="px-4 py-2 text-foreground font-mono">{detalle.numeroFila}</td>
                      <td className="px-4 py-2 text-foreground">{detalle.motivo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
