import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { CheckCircleIcon, EyeIcon, PaperclipIcon, XIcon } from "@/shared/components/icons";
import { es } from "@/shared/i18n/es";
import {
  useAgregarObservacion,
  useCambiarEstatusDenuncia,
  useDenunciaDetalle,
  useEvidencias,
  useObservaciones,
  verEvidenciaPorId
} from "../hooks/useDenuncias";
import type { EstadoDenuncia } from "../types/buzon";

interface DetalleDenunciaModalProps {
  denunciaId: number | null;
  onClose: () => void;
}

const BADGE_STYLES: Record<EstadoDenuncia, string> = {
  R: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  V: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  A: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  D: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20",
};

export function DetalleDenunciaModal({ denunciaId, onClose }: DetalleDenunciaModalProps) {
  const { user } = useAuth();
  const { data: denuncia, isLoading: loadingDetalle } = useDenunciaDetalle(denunciaId);
  const { data: obsList = [], isLoading: loadingObs } = useObservaciones(denunciaId);
  const { data: evidList = [], isLoading: loadingEvid } = useEvidencias(denunciaId);



  const cambiarEstatus = useCambiarEstatusDenuncia(denunciaId ?? 0);
  const agregarObs = useAgregarObservacion(denunciaId ?? 0);

  const [nuevaObservacion, setNuevaObservacion] = useState("");
  const [openingEvidenciaId, setOpeningEvidenciaId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ msg: string; type: "success" | "error" | "warning" } | null>(null);

  const handleVerEvidencia = async (evidenciaId: number, nombre?: string) => {
    setOpeningEvidenciaId(evidenciaId);
    try {
      const blob = await verEvidenciaPorId(evidenciaId);
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch {
      setFeedback({
        msg: `No se pudo abrir la evidencia ${nombre || `#${evidenciaId}`}. Verifica que el archivo exista en el servidor.`,
        type: "error",
      });
    } finally {
      setOpeningEvidenciaId(null);
    }
  };

  if (!denunciaId) return null;

  const observacionesCombined = denuncia?.observaciones?.length ? denuncia.observaciones : obsList;
  const evidenciasCombined = denuncia?.evidencias?.length ? denuncia.evidencias : evidList;
  const tieneObservaciones = observacionesCombined.length > 0;

  const handleStatusChange = async (nuevoEstatus: EstadoDenuncia) => {
    setFeedback(null);

    // Regla de Negocio: En estado 'V', requiere al menos una observación antes de Aceptar (A) o Denegar (D)
    if ((nuevoEstatus === "A" || nuevoEstatus === "D") && !tieneObservaciones) {
      if (nuevaObservacion.trim()) {
        try {
          await agregarObs.mutateAsync({
            observacion: nuevaObservacion.trim(),
            verificoRef: user?.username ?? "Oficial PLD",
          });
          setNuevaObservacion("");
        } catch {
          setFeedback({
            msg: "Ocurrió un error al guardar la observación requerida.",
            type: "error",
          });
          return;
        }
      } else {
        setFeedback({
          msg: "Regla de Negocio: Debe agregar al menos una observación de revisión antes de Aceptar o Denegar la denuncia.",
          type: "warning",
        });
        return;
      }
    }

    try {
      await cambiarEstatus.mutateAsync({ nuevoEstatus });
      setFeedback({ msg: `Estatus actualizado a ${es.buzon.statusLabels[nuevoEstatus]} exitosamente.`, type: "success" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo actualizar el estatus.";
      setFeedback({ msg, type: "error" });
    }
  };

  const handleAddObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaObservacion.trim()) return;
    setFeedback(null);
    try {
      await agregarObs.mutateAsync({
        observacion: nuevaObservacion.trim(),
        verificoRef: user?.username ?? "Oficial PLD",
      });
      setNuevaObservacion("");
      setFeedback({ msg: "Observación de seguimiento agregada exitosamente.", type: "success" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al registrar observación.";
      setFeedback({ msg, type: "error" });
    }
  };

  const isLoading = loadingDetalle || loadingObs || loadingEvid;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-line bg-panel p-6 shadow-2xl text-fg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <h2 className="text-base font-bold text-fg">
              Denuncia #{denunciaId}
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Registrada el: {denuncia?.createdAt ? new Date(denuncia.createdAt).toLocaleString("es-MX") : "-"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="rounded-lg p-1.5 text-muted hover:bg-hover hover:text-fg focus-visible:outline-none"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {feedback && (
          <div
            className={`mt-4 rounded-lg px-3.5 py-2 text-xs font-medium ${feedback.type === "success"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : feedback.type === "warning"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
              }`}
          >
            {feedback.msg}
          </div>
        )}

        {isLoading && !denuncia ? (
          <div className="py-12 text-center text-xs text-muted">{es.common.loading}</div>
        ) : denuncia ? (
          <div className="mt-5 space-y-6 text-xs">
            {/* Status Header & Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-bg p-3.5">
              <div className="flex items-center gap-2">
                <span className="text-muted font-medium">Estatus actual:</span>
                <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${BADGE_STYLES[denuncia.estado]}`}>
                  {es.buzon.statusLabels[denuncia.estado]}
                </span>
              </div>

              {/* Status Actions based on Business Rules */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Rule: Recibido (R) -> SOLO puede pasar a Revision (V) */}
                {denuncia.estado === "R" && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("V")}
                    disabled={cambiarEstatus.isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    Iniciar Revisión (V)
                  </button>
                )}

                {/* Rule: En Revision (V) -> Puede pasar a Aceptado (A) o Denegado (D) con al menos 1 observación */}
                {denuncia.estado === "V" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStatusChange("A")}
                      disabled={cambiarEstatus.isPending || (!tieneObservaciones && !nuevaObservacion.trim())}
                      title={!tieneObservaciones && !nuevaObservacion.trim() ? "Requiere al menos 1 observación" : "Aceptar Denuncia"}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      Aceptar Denuncia (A)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange("D")}
                      disabled={cambiarEstatus.isPending || (!tieneObservaciones && !nuevaObservacion.trim())}
                      title={!tieneObservaciones && !nuevaObservacion.trim() ? "Requiere al menos 1 observación" : "Denegar Denuncia"}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700 px-3.5 py-1.5 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                    >
                      <XIcon className="h-4 w-4" />
                      Denegar Denuncia (D)
                    </button>
                  </>
                )}

                {(denuncia.estado === "A" || denuncia.estado === "D") && (
                  <span className="text-xs text-muted font-medium italic">
                    Expediente finalizado ({es.buzon.statusLabels[denuncia.estado]})
                  </span>
                )}
              </div>
            </div>

            {/* General Info Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-line bg-bg p-3">
                <span className="text-muted font-semibold block mb-0.5">Fecha del Incidente</span>
                <p className="text-fg font-medium">
                  {denuncia.fechaIncidente
                    ? new Date(denuncia.fechaIncidente).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                    : "No especificada"}
                </p>
              </div>
              <div className="rounded-xl border border-line bg-bg p-3">
                <span className="text-muted font-semibold block mb-0.5">Persona / Entidad Denunciada</span>
                <p className="text-fg font-medium">
                  {denuncia.nombreDenunciado || "Anónimo / No especificado"}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <span className="text-muted font-semibold block mb-1.5">Descripción de los Hechos</span>
              <div className="rounded-xl border border-line bg-bg p-3.5 text-fg leading-relaxed whitespace-pre-wrap">
                {denuncia.descripcion}
              </div>
            </div>

            {/* Evidences */}
            <div>
              <span className="text-muted font-semibold block mb-1.5">Evidencias Adjuntas</span>
              {evidenciasCombined && evidenciasCombined.length > 0 ? (
                <ul className="space-y-1.5">
                  {evidenciasCombined.map((ev) => (
                    <li
                      key={ev.id}
                      className="flex items-center justify-between rounded-lg border border-line bg-bg p-2.5 transition-colors hover:border-accent-line hover:bg-hover/40"
                    >
                      <div className="flex items-center gap-2 truncate mr-2">
                        <PaperclipIcon className="h-4 w-4 shrink-0 text-muted" />
                        <span className="font-medium truncate text-fg" title={ev.nombre}>
                          {ev.nombre || `Evidencia #${ev.id}`}
                        </span>
                        <span className="text-[11px] text-muted shrink-0">
                          ({ev.tipoArchivo || "Archivo"})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleVerEvidencia(ev.id, ev.nombre)}
                        disabled={openingEvidenciaId === ev.id}
                        className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 shrink-0 focus-visible:outline-none"
                        title="Ver evidencia en nueva pestaña"
                      >
                        {openingEvidenciaId === ev.id ? (
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
                        ) : (
                          <EyeIcon className="h-3.5 w-3.5" />
                        )}
                        <span>{openingEvidenciaId === ev.id ? "Cargando..." : "Ver archivo"}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted italic">Sin evidencias adjuntas en el expediente.</p>
              )}
            </div>

            {/* Observations History & Input Form */}
            <div className="border-t border-line pt-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-fg">
                  Historial de Observaciones ({observacionesCombined.length})
                </h3>
                {denuncia.estado === "V" && !tieneObservaciones && (
                  <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                    Obligatorio registrar al menos 1 observación en revisión
                  </span>
                )}
              </div>

              {/* Observation Timeline List displaying User ID & Date */}
              {observacionesCombined && observacionesCombined.length > 0 ? (
                <ul className="space-y-2.5 mb-4 max-h-60 overflow-y-auto pr-1">
                  {observacionesCombined.map((obs) => (
                    <li
                      key={obs.id}
                      className="rounded-xl border border-line bg-bg p-3 space-y-1"
                    >
                      <p className="text-fg leading-normal">{obs.observacion}</p>
                      <div className="flex items-center justify-between text-[11px] text-muted pt-1 border-t border-line/40">
                        <span className="font-medium">
                          Usuario: <span className="text-fg">{obs.verificoRef || user?.username || "Oficial PLD"}</span>
                        </span>
                        <span>{new Date(obs.createdAt).toLocaleString("es-MX")}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted italic mb-4">No hay observaciones registradas aún.</p>
              )}

              {/* Form to add more observations without requiring to close/change status */}
              {(denuncia.estado === "R" || denuncia.estado === "V") && (
                <form onSubmit={handleAddObservation} className="space-y-2 pt-2 border-t border-line">
                  <label htmlFor="nuevaObsInput" className="block text-xs font-semibold text-fg">
                    Agregar Observación de Seguimiento
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="nuevaObsInput"
                      type="text"
                      value={nuevaObservacion}
                      onChange={(e) => setNuevaObservacion(e.target.value)}
                      placeholder="Escribe una observación de revisión (puedes agregar múltiples)..."
                      className="flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-xs text-fg focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!nuevaObservacion.trim() || agregarObs.isPending}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50 focus-visible:outline-none"
                    >
                      {agregarObs.isPending ? "Guardando..." : "Agregar Observación"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
