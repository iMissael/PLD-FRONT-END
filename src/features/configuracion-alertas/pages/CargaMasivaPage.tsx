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
      ? "border-success/30 bg-success-soft text-success-hover"
      : tone === "warn"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <div className={`flex-1 rounded-lg border p-4 ${toneClasses}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
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
        <h2 className="text-xl font-semibold text-slate-900">Carga masiva</h2>
        <p className="text-sm text-slate-500">
          Sube un archivo CSV o XLSX con personas bloqueadas para procesarlas en lote.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-slate-200 px-4 py-10 text-center transition-colors hover:border-primary hover:bg-primary-soft/40"
        >
          <span className="bg-primary text-primary-foreground flex h-11 w-11 items-center justify-center rounded-full">
            <UploadIcon className="h-5 w-5" />
          </span>
          <span className="text-sm font-medium text-slate-700">
            {archivo ? archivo.name : "Haz clic para elegir un archivo (.csv, .xlsx)"}
          </span>
          {archivo && (
            <span className="text-xs text-slate-400">
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
            <p className="text-sm text-red-600">
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
            className="bg-primary hover:bg-primary-hover rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-slate-600">
                      Fila
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-600">
                      Error
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {resultado.detalleErrores.map((detalle, index) => (
                    // No hay id único en el DTO; fila+índice es estable para esta lista de solo lectura.
                    <tr key={`${detalle.numeroFila}-${index}`}>
                      <td className="px-4 py-2 text-slate-800">{detalle.numeroFila}</td>
                      <td className="px-4 py-2 text-slate-800">{detalle.motivo}</td>
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
