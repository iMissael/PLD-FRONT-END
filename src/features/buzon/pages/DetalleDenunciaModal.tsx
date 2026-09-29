import { useState } from "react";
import { PaperclipIcon, XIcon } from "@/shared/components/icons";
import { es } from "@/shared/i18n/es";
import {
  useAgregarObservacion,
  useCambiarEstatusDenuncia,
  useDenunciaDetalle,
} from "../hooks/useDenuncias";
import type { EstadoDenuncia } from "../types/buzon";

interface DetalleDenunciaModalProps {
  denunciaId: number | null;
  onClose: () => void;
}

const BADGE_COLORS: Record<EstadoDenuncia, string> = {
  R: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  V: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
  A: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
  D: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export function DetalleDenunciaModal({ denunciaId, onClose }: DetalleDenunciaModalProps) {
  const { data: denuncia, isLoading } = useDenunciaDetalle(denunciaId);
  const cambiarEstatus = useCambiarEstatusDenuncia(denunciaId ?? 0);
  const agregarObs = useAgregarObservacion(denunciaId ?? 0);

  const [nuevaObservacion, setNuevaObservacion] = useState("");

  if (!denunciaId) return null;

  const handleStatusChange = async (nuevoEstatus: EstadoDenuncia) => {
    try {
      await cambiarEstatus.mutateAsync({ nuevoEstatus });
    } catch {
      // Handled in UI
    }
  };

  const handleAddObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaObservacion.trim()) return;
    try {
      await agregarObs.mutateAsync({ observacion: nuevaObservacion });
      setNuevaObservacion("");
    } catch {
      // Handled in UI
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Denuncia #{denunciaId}
            </h2>
            <p className="text-xs text-slate-500">
              Registrada: {denuncia?.createdAt ? new Date(denuncia.createdAt).toLocaleString("es-MX") : "-"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-500">{es.common.loading}</div>
        ) : denuncia ? (
          <div className="mt-4 space-y-5 text-xs">
            {/* Status Header & Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
              <div>
                <span className="text-slate-500">Estatus actual: </span>
                <span className={`inline-block rounded-full px-2.5 py-0.5 font-bold ${BADGE_COLORS[denuncia.estado]}`}>
                  {es.buzon.statusLabels[denuncia.estado]}
                </span>
              </div>

              {/* Lifecycle transitions */}
              <div className="flex gap-1.5">
                {denuncia.estado === "R" && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("V")}
                    className="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Iniciar Revisión (V)
                  </button>
                )}
                {denuncia.estado === "V" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStatusChange("A")}
                      className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      Atender / Generar Alerta (A)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange("D")}
                      className="rounded-md bg-slate-600 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-700"
                    >
                      Desechar (D)
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <span className="font-semibold text-slate-500">Fecha Incidente:</span>
                <p className="text-slate-800 dark:text-slate-200">
                  {new Date(denuncia.fechaIncidente).toLocaleDateString("es-MX")}
                </p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Denunciado:</span>
                <p className="text-slate-800 dark:text-slate-200">
                  {denuncia.nombreDenunciado || "No especificado"}
                </p>
              </div>
            </div>

            <div>
              <span className="font-semibold text-slate-500">Descripción:</span>
              <p className="mt-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-800 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200">
                {denuncia.descripcion}
              </p>
            </div>

            {/* Evidencias */}
            <div>
              <span className="font-semibold text-slate-500">Evidencias:</span>
              {denuncia.evidencias && denuncia.evidencias.length > 0 ? (
                <ul className="mt-1 space-y-1">
                  {denuncia.evidencias.map((ev) => (
                    <li key={ev.id} className="flex items-center gap-1.5 rounded-md bg-slate-100 p-2 dark:bg-slate-800">
                      <PaperclipIcon className="h-3.5 w-3.5 text-slate-400" />
                      <span>{ev.nombre || `Archivo #${ev.id}`} ({ev.tipoArchivo || "Desconocido"})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400 italic mt-0.5">Sin evidencias adjuntas</p>
              )}
            </div>

            {/* Observaciones */}
            <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                {es.buzon.observationsTitle}
              </h3>
              {denuncia.observaciones && denuncia.observaciones.length > 0 ? (
                <ul className="space-y-2 mb-3">
                  {denuncia.observaciones.map((obs) => (
                    <li key={obs.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/50">
                      <p className="text-slate-800 dark:text-slate-200">{obs.observacion}</p>
                      <span className="text-[10px] text-slate-400">
                        {obs.verificoRef || "Sistema"} · {new Date(obs.createdAt).toLocaleString("es-MX")}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400 italic mb-3">No hay observaciones registradas</p>
              )}

              {denuncia.estado === "V" && (
                <form onSubmit={handleAddObservation} className="flex gap-2">
                  <input
                    type="text"
                    value={nuevaObservacion}
                    onChange={(e) => setNuevaObservacion(e.target.value)}
                    placeholder="Escribe una observación de seguimiento..."
                    className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={!nuevaObservacion.trim() || agregarObs.isPending}
                    className="rounded-md bg-emerald-600 px-3 py-1.5 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {es.buzon.addObservation}
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
