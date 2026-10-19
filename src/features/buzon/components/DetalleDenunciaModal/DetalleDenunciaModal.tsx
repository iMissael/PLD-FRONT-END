import { useEffect, useState } from "react";
import {
  CheckCircleIcon,
  EditIcon,
  XIcon,
} from "@/shared/components/atoms/icons";
import { es } from "@/shared/i18n/es";
import { toast } from "sonner";
import { isAppError } from "@/api/interceptors/errorInterceptor";
import { obtenerPersonaPorRef, type PersonaItem } from "../../api/busquedaPersonasApi";
import { useRazonesAlertaPorTipo, useTiposAlertaBuzon } from "../../hooks/useCatalogosBuzon";
import {
  useAgregarObservacion,
  useCambiarEstatusDenuncia,
  useDenunciaDetalle,
  useEditarDenuncia,
  useEvidencias,
  useObservaciones,
} from "../../hooks/useDenuncias";
import type { EstadoDenuncia } from "../../types/buzon";

import { FichaPersonaModal } from "./FichaPersonaModal";
import { DenunciaEvidenciasList } from "./DenunciaEvidenciasList";
import { DenunciaObservacionesSection } from "./DenunciaObservacionesSection";
import { DenunciaEdicionForm } from "./DenunciaEdicionForm";
import { DenunciaInfoSection } from "./DenunciaInfoSection";

export interface DetalleDenunciaModalProps {
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
  const { data: denuncia, isLoading: loadingDetalle } = useDenunciaDetalle(denunciaId);
  const { data: obsList = [], isLoading: loadingObs } = useObservaciones(denunciaId);
  const { data: evidList = [], isLoading: loadingEvid } = useEvidencias(denunciaId);

  const cambiarEstatus = useCambiarEstatusDenuncia(denunciaId ?? 0);
  const agregarObs = useAgregarObservacion(denunciaId ?? 0);
  const editarDenuncia = useEditarDenuncia(denunciaId ?? 0);

  const [feedback, setFeedback] = useState<{ msg: string; type: "success" | "error" | "warning" } | null>(null);

  // Estados para Modo Edición (Solo en REVISIÓN 'V')
  const [isEditing, setIsEditing] = useState(false);
  const [editTipoAlertaId, setEditTipoAlertaId] = useState<number>(0);
  const [editRazonAlertaId, setEditRazonAlertaId] = useState<number>(0);
  const [editDenunciadoVerificadoRef, setEditDenunciadoVerificadoRef] = useState<string>("");
  const [editObservaciones, setEditObservaciones] = useState<string>("");
  const [selectedPersona, setSelectedPersona] = useState<PersonaItem | null>(null);

  // Modal / Panel de Visualización de Datos de la Persona
  const [personaModalData, setPersonaModalData] = useState<PersonaItem | null>(null);

  // Catálogos para el modo edición
  const { data: tiposAlerta = [], isLoading: loadingTipos } = useTiposAlertaBuzon();
  const { data: razonesAlerta = [], isLoading: loadingRazones } = useRazonesAlertaPorTipo(
    editTipoAlertaId > 0 ? editTipoAlertaId : null,
  );

  useEffect(() => {
    if (denuncia) {
      setEditTipoAlertaId(denuncia.catTipoAlertaId || (tiposAlerta[0]?.id ?? 0));
      setEditRazonAlertaId(denuncia.catRazonAlertaId || 0);
      const ref = denuncia.denunciadoVerificadoRef || "";
      setEditDenunciadoVerificadoRef(ref);
      if (ref) {
        const resolved = obtenerPersonaPorRef(ref);
        setSelectedPersona(resolved);
      } else {
        setSelectedPersona(null);
      }
      setEditObservaciones("");
      setIsEditing(false);
    }
  }, [denuncia, tiposAlerta]);

  if (!denunciaId) return null;

  const observacionesCombined = denuncia?.observaciones?.length ? denuncia.observaciones : obsList;
  const evidenciasCombined = denuncia?.evidencias?.length ? denuncia.evidencias : evidList;
  const tieneObservaciones = observacionesCombined.length > 0;

  const selectedEditRazon = razonesAlerta?.find((r) => r.id === editRazonAlertaId);
  const selectedRazonDescripcion =
    selectedEditRazon?.descripcionRazonAlerta ||
    (selectedEditRazon as unknown as { descripcion?: string })?.descripcion ||
    "";

  // Guardar Cambios de Edición
  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRazonAlertaId || editRazonAlertaId <= 0) {
      toast.warning("Debes seleccionar una razón de alerta válida.");
      setFeedback({ msg: "Debes seleccionar una razón de alerta válida.", type: "warning" });
      return;
    }

    setFeedback(null);
    try {
      await editarDenuncia.mutateAsync({
        catRazonAlertaId: editRazonAlertaId,
        denunciadoVerificadoRef: editDenunciadoVerificadoRef.trim() || undefined,
        observaciones: editObservaciones.trim() || undefined,
      });
      setIsEditing(false);
      toast.success("Denuncia actualizada en revisión exitosamente.");
      setFeedback({ msg: "Denuncia actualizada en revisión exitosamente.", type: "success" });
    } catch (err: unknown) {
      const msg = isAppError(err) ? err.message : err instanceof Error ? err.message : "Error al guardar los cambios de la denuncia.";
      toast.error(msg);
      setFeedback({ msg, type: "error" });
    }
  };

  // Cambiar Estatus con Regla de Negocio
  const handleStatusChange = async (nuevoEstatus: EstadoDenuncia) => {
    setFeedback(null);

    if ((nuevoEstatus === "A" || nuevoEstatus === "D") && !tieneObservaciones) {
      toast.warning("Para dictaminar (A o D) se requiere al menos una observación.");
      setFeedback({ msg: "Para dictaminar (A o D) se requiere al menos una observación.", type: "warning" });
      return;
    }

    try {
      await cambiarEstatus.mutateAsync({ nuevoEstatus });
      toast.success(`Estatus actualizado a: ${es.buzon.statusLabels[nuevoEstatus]}`);
      setFeedback({ msg: `Estatus actualizado a: ${es.buzon.statusLabels[nuevoEstatus]}`, type: "success" });
      setIsEditing(false);
    } catch (err: unknown) {
      const msg = isAppError(err) ? err.message : err instanceof Error ? err.message : "Error al actualizar el estatus.";
      toast.error(msg);
      setFeedback({ msg, type: "error" });
    }
  };

  const handleAddObservation = async (obs: string) => {
    try {
      await agregarObs.mutateAsync({ observacion: obs });
      toast.success("Observación agregada al expediente.");
    } catch (err: unknown) {
      const msg = isAppError(err) ? err.message : "Error al guardar observación.";
      toast.error(msg);
    }
  };

  const isLoading = loadingDetalle || loadingObs || loadingEvid;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl text-foreground">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-base font-bold text-foreground">Denuncia #{denunciaId}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Registrada el: {denuncia?.createdAt ? new Date(denuncia.createdAt).toLocaleString("es-MX") : "-"}
            </p> 
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none cursor-pointer"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {feedback && (
          <div
            className={`mt-4 rounded-lg px-3.5 py-2 text-xs font-medium ${
              feedback.type === "success"
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
          <div className="py-12 text-center text-xs text-muted-foreground">{es.common.loading}</div>
        ) : denuncia ? (
          <div className="mt-5 space-y-6 text-xs">
            {/* Status Header & Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 p-3.5">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">Estatus actual:</span>
                <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${BADGE_STYLES[denuncia.estado]}`}>
                  {es.buzon.statusLabels[denuncia.estado]}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {denuncia.estado === "V" && (
                  <button
                    type="button"
                    onClick={() => setIsEditing((prev) => !prev)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                      isEditing
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                    }`}
                  >
                    <EditIcon className="h-3.5 w-3.5" />
                    {isEditing ? "Cancelar Edición" : "Editar Denuncia"}
                  </button>
                )}

                {denuncia.estado === "R" && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("V")}
                    disabled={cambiarEstatus.isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                  >
                    Iniciar Revisión (V)
                  </button>
                )}

                {denuncia.estado === "V" && !isEditing && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStatusChange("A")}
                      disabled={cambiarEstatus.isPending || !tieneObservaciones}
                      title={!tieneObservaciones ? "Requiere al menos 1 observación" : "Aceptar Denuncia"}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 font-medium text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      Aceptar Denuncia (A)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange("D")}
                      disabled={cambiarEstatus.isPending || !tieneObservaciones}
                      title={!tieneObservaciones ? "Requiere al menos 1 observación" : "Denegar Denuncia"}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700 px-3.5 py-1.5 font-medium text-white hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                    >
                      <XIcon className="h-4 w-4" />
                      Denegar Denuncia (D)
                    </button>
                  </>
                )}

                {(denuncia.estado === "A" || denuncia.estado === "D") && (
                  <span className="text-xs text-muted-foreground font-medium italic">
                    Expediente finalizado ({es.buzon.statusLabels[denuncia.estado]})
                  </span>
                )}
              </div>
            </div>

            {/* Modo Edición en Revisión */}
            {isEditing && denuncia.estado === "V" ? (
              <DenunciaEdicionForm
                denunciaId={denuncia.id}
                nombreDenunciadoOriginal={denuncia.nombreDenunciado}
                tiposAlerta={tiposAlerta}
                razonesAlerta={razonesAlerta}
                loadingTipos={loadingTipos}
                loadingRazones={loadingRazones}
                editTipoAlertaId={editTipoAlertaId}
                setEditTipoAlertaId={setEditTipoAlertaId}
                editRazonAlertaId={editRazonAlertaId}
                setEditRazonAlertaId={setEditRazonAlertaId}
                editDenunciadoVerificadoRef={editDenunciadoVerificadoRef}
                setEditDenunciadoVerificadoRef={setEditDenunciadoVerificadoRef}
                selectedPersona={selectedPersona}
                setSelectedPersona={setSelectedPersona}
                editObservaciones={editObservaciones}
                setEditObservaciones={setEditObservaciones}
                selectedRazonDescripcion={selectedRazonDescripcion}
                isPending={editarDenuncia.isPending}
                onVerFichaPersona={setPersonaModalData}
                onCancel={() => setIsEditing(false)}
                onSubmit={handleGuardarEdicion}
              />
            ) : null}

            {/* Consulta General */}
            <DenunciaInfoSection
              denuncia={denuncia}
              tipoAlertaNombre={tiposAlerta?.find((t) => t.id === denuncia.catTipoAlertaId)?.nombre}
              razonAlertaNombre={razonesAlerta?.find((r) => r.id === denuncia.catRazonAlertaId)?.nombre}
              selectedPersona={selectedPersona}
              onVerFichaPersona={setPersonaModalData}
            />

            {/* Evidencias */}
            <DenunciaEvidenciasList
              evidencias={evidenciasCombined}
              onError={(msg) => setFeedback({ msg, type: "error" })}
            />

            {/* Observaciones */}
            <DenunciaObservacionesSection
              observaciones={observacionesCombined}
              estado={denuncia.estado}
              isPending={agregarObs.isPending}
              onAddObservacion={handleAddObservation}
            />
          </div>
        ) : null}
      </div>

      {/* Ficha de Persona */}
      <FichaPersonaModal
        persona={personaModalData}
        onClose={() => setPersonaModalData(null)}
      />
    </div>
  );
}
