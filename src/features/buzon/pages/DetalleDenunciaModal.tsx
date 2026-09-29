import { useEffect, useState } from "react";
import { useAuthStore } from "@/shared/auth/authStore";
import {
  CheckCircleIcon,
  EditIcon,
  EyeIcon,
  InfoIcon,
  PaperclipIcon,
  SearchIcon,
  UserCheckIcon,
  XIcon,
} from "@/shared/components/icons";
import { es } from "@/shared/i18n/es";
import { buscarPersonasDenunciadas, obtenerPersonaPorRef, type PersonaItem } from "../api/busquedaPersonasApi";
import { useRazonesAlertaPorTipo, useTiposAlertaBuzon } from "../hooks/useCatalogosBuzon";
import {
  useAgregarObservacion,
  useCambiarEstatusDenuncia,
  useDenunciaDetalle,
  useEditarDenuncia,
  useEvidencias,
  useObservaciones,
  verEvidenciaPorId,
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
  const user = useAuthStore((state) => state.usuario);
  const { data: denuncia, isLoading: loadingDetalle } = useDenunciaDetalle(denunciaId);
  const { data: obsList = [], isLoading: loadingObs } = useObservaciones(denunciaId);
  const { data: evidList = [], isLoading: loadingEvid } = useEvidencias(denunciaId);

  const cambiarEstatus = useCambiarEstatusDenuncia(denunciaId ?? 0);
  const agregarObs = useAgregarObservacion(denunciaId ?? 0);
  const editarDenuncia = useEditarDenuncia(denunciaId ?? 0);

  // Estados de Observación y Multimedia
  const [nuevaObservacion, setNuevaObservacion] = useState("");
  const [openingEvidenciaId, setOpeningEvidenciaId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ msg: string; type: "success" | "error" | "warning" } | null>(null);

  // Estados para Modo Edición (Solo en REVISIÓN 'V')
  const [isEditing, setIsEditing] = useState(false);
  const [editTipoAlertaId, setEditTipoAlertaId] = useState<number>(0);
  const [editRazonAlertaId, setEditRazonAlertaId] = useState<number>(0);
  const [editDenunciadoVerificadoRef, setEditDenunciadoVerificadoRef] = useState<string>("");
  const [editObservaciones, setEditObservaciones] = useState<string>("");

  // Buscador de Personas (Socios y Empleados)
  const [searchPersonQuery, setSearchPersonQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PersonaItem[]>([]);
  const [isSearchingPersons, setIsSearchingPersons] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<PersonaItem | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Modal / Panel de Visualización de Datos de la Persona
  const [personaModalData, setPersonaModalData] = useState<PersonaItem | null>(null);

  // Catálogos para el modo edición
  const { data: tiposAlerta = [], isLoading: loadingTipos } = useTiposAlertaBuzon();
  const { data: razonesAlerta = [], isLoading: loadingRazones } = useRazonesAlertaPorTipo(
    editTipoAlertaId > 0 ? editTipoAlertaId : null,
  );

  // Sincronizar datos iniciales al abrir o recibir denuncia
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
      setShowDropdown(false);
    }
  }, [denuncia, tiposAlerta]);

  // Manejador de búsqueda debounced para empleados y socios
  useEffect(() => {
    if (!searchPersonQuery.trim()) {
      setSearchResults([]);
      setIsSearchingPersons(false);
      return;
    }

    const controller = new AbortController();
    setIsSearchingPersons(true);

    const timer = setTimeout(async () => {
      try {
        const results = await buscarPersonasDenunciadas(searchPersonQuery, controller.signal);
        setSearchResults(results);
        setShowDropdown(true);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearchingPersons(false);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchPersonQuery]);

  if (!denunciaId) return null;

  const observacionesCombined = denuncia?.observaciones?.length ? denuncia.observaciones : obsList;
  const evidenciasCombined = denuncia?.evidencias?.length ? denuncia.evidencias : evidList;
  const tieneObservaciones = observacionesCombined.length > 0;

  const selectedEditRazon = razonesAlerta?.find((r) => r.id === editRazonAlertaId);
  const selectedRazonDescripcion =
    selectedEditRazon?.descripcionRazonAlerta ||
    (selectedEditRazon as unknown as { descripcion?: string })?.descripcion ||
    "";

  // Visualizar / Descargar Evidencia en nueva pestaña
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

  // Guardar Cambios de Edición (PUT /SICANETSC/PLD/{tenantId}/buzon/denuncias/{id})
  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRazonAlertaId || editRazonAlertaId <= 0) {
      setFeedback({
        msg: "Debes seleccionar una razón de alerta válida.",
        type: "warning",
      });
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
      setFeedback({
        msg: "Denuncia actualizada en revisión exitosamente.",
        type: "success",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al guardar los cambios de la denuncia.";
      setFeedback({ msg, type: "error" });
    }
  };

  // Cambiar Estatus con Regla de Negocio
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

  // Agregar Observación individual
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
                {/* Botón de Editar Denuncia (Solo habilitado en REVISIÓN 'V') */}
                {denuncia.estado === "V" && (
                  <button
                    type="button"
                    onClick={() => setIsEditing((prev) => !prev)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                      isEditing
                        ? "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white"
                        : "bg-indigo-600/10 text-indigo-600 hover:bg-indigo-600/20 dark:text-indigo-400 border border-indigo-500/20"
                    }`}
                  >
                    <EditIcon className="h-3.5 w-3.5" />
                    {isEditing ? "Cancelar Edición" : "Editar Denuncia"}
                  </button>
                )}

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
                {denuncia.estado === "V" && !isEditing && (
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

            {/* FORMULARIO DE EDICIÓN EN REVISIÓN (PUT /buzon/denuncias/{id}) */}
            {isEditing && denuncia.estado === "V" ? (
              <form onSubmit={handleGuardarEdicion} className="space-y-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4">
                <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
                  <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <EditIcon className="h-4 w-4" />
                    Editar Denuncia en Revisión
                  </h3>
                  <span className="text-[11px] text-muted">PUT /buzon/denuncias/{denunciaId}</span>
                </div>

                {/* Selectores de Tipo y Razón de Alerta */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="editTipoAlertaSelect" className="block text-xs font-medium text-fg mb-1">
                      Tipo de Alerta
                    </label>
                    <select
                      id="editTipoAlertaSelect"
                      value={editTipoAlertaId}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setEditTipoAlertaId(val);
                        setEditRazonAlertaId(0);
                      }}
                      disabled={loadingTipos}
                      className="w-full rounded-lg border border-line bg-bg p-2 text-xs text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring"
                    >
                      {loadingTipos ? (
                        <option value={0}>Cargando catálogo...</option>
                      ) : (
                        tiposAlerta.map((tipo) => (
                          <option key={tipo.id} value={tipo.id}>
                            {tipo.nombre}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="editRazonAlertaSelect" className="block text-xs font-medium text-fg mb-1">
                      Razón de Alerta
                    </label>
                    <select
                      id="editRazonAlertaSelect"
                      value={editRazonAlertaId}
                      onChange={(e) => setEditRazonAlertaId(Number(e.target.value))}
                      disabled={loadingRazones || editTipoAlertaId <= 0}
                      className="w-full rounded-lg border border-line bg-bg p-2 text-xs text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring"
                    >
                      {loadingRazones ? (
                        <option value={0}>Cargando razones...</option>
                      ) : razonesAlerta && razonesAlerta.length > 0 ? (
                        razonesAlerta.map((razon) => (
                          <option key={razon.id} value={razon.id}>
                            {razon.nombre}
                          </option>
                        ))
                      ) : (
                        <option value={0}>Sin razones disponibles</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Previsualización de la descripción de la razón */}
                {selectedRazonDescripcion && (
                  <div className="rounded-lg border border-line/60 bg-bg/80 p-2.5 text-[11px] text-muted leading-relaxed">
                    <span className="font-semibold text-fg block mb-0.5">Descripción de la Razón:</span>
                    {selectedRazonDescripcion}
                  </div>
                )}

                {/* Contexto: Persona Denunciada Original */}
                <div className="rounded-lg border border-line/70 bg-bg p-2.5 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-muted block font-medium">Persona Denunciada (Original):</span>
                    <span className="font-semibold text-fg">{denuncia.nombreDenunciado || "Anónimo / No especificado"}</span>
                  </div>
                  <span className="text-[10px] text-muted italic bg-panel px-2 py-0.5 rounded border border-line">Dato original de la denuncia</span>
                </div>

                {/* BLOQUE FUSIONADO: BUSCADOR Y TABLA DE PERSONA VERIFICADA (SOCIOS Y EMPLEADOS) */}
                <div className="space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-fg">
                      Corregir / Verificar Persona Denunciada (`denunciadoVerificadoRef`)
                    </label>
                    {editDenunciadoVerificadoRef && (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <UserCheckIcon className="h-3.5 w-3.5" /> Persona vinculada
                      </span>
                    )}
                  </div>

                  {/* Si ya hay persona asignada: Muestra tabla de sólo lectura */}
                  {editDenunciadoVerificadoRef ? (
                    <div className="overflow-hidden rounded-xl border border-line bg-bg shadow-xs">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-line bg-panel text-muted font-semibold text-[11px]">
                          <tr>
                            <th className="px-3 py-2">Ref</th>
                            <th className="px-3 py-2">Nombre</th>
                            <th className="px-3 py-2">Empleado / Socio</th>
                            <th className="px-3 py-2 text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line/60">
                          <tr className="hover:bg-hover/40 transition-colors">
                            <td className="px-3 py-2.5 font-mono font-bold text-fg">
                              {editDenunciadoVerificadoRef}
                            </td>
                            <td className="px-3 py-2.5 font-medium text-fg">
                              {selectedPersona?.nombreCompleto || "Registro en Catálogo"}
                            </td>
                            <td className="px-3 py-2.5">
                              <span
                                className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                                  selectedPersona?.tipo === "EMPLEADO"
                                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                    : selectedPersona?.tipo === "SOCIO"
                                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                }`}
                              >
                                {selectedPersona?.tipo || "VERIFICADO"}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-right space-x-1.5 whitespace-nowrap">
                              {selectedPersona && (
                                <button
                                  type="button"
                                  onClick={() => setPersonaModalData(selectedPersona)}
                                  className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-indigo-700 focus-visible:outline-none"
                                  title="Ver más datos de la persona"
                                >
                                  <InfoIcon className="h-3 w-3" />
                                  Ver más datos
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditDenunciadoVerificadoRef("");
                                  setSelectedPersona(null);
                                  setSearchPersonQuery("");
                                }}
                                className="inline-flex items-center gap-1 rounded-md border border-line bg-panel px-2 py-1 text-[11px] font-medium text-muted hover:text-red-600 hover:border-red-500/30 focus-visible:outline-none"
                                title="Cambiar persona"
                              >
                                <XIcon className="h-3 w-3" />
                                Cambiar
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    /* Si no hay persona asignada: Muestra el buscador */
                    <div className="space-y-1">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-muted">
                          <SearchIcon className="h-4 w-4" />
                        </div>
                        <input
                          id="buscarPersonaInput"
                          type="text"
                          value={searchPersonQuery}
                          onChange={(e) => {
                            setSearchPersonQuery(e.target.value);
                            setShowDropdown(true);
                          }}
                          onFocus={() => {
                            if (searchResults.length > 0) setShowDropdown(true);
                          }}
                          placeholder="Buscar empleado o socio por nombre, RFC o número..."
                          className="w-full rounded-lg border border-line bg-bg pl-8 pr-8 py-2 text-xs text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring"
                        />
                        {isSearchingPersons && (
                          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center">
                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                          </div>
                        )}
                      </div>

                      {/* Dropdown de resultados */}
                      {showDropdown && searchResults.length > 0 && (
                        <div className="absolute z-20 mt-1 w-full max-h-52 overflow-y-auto rounded-xl border border-line bg-panel shadow-xl divide-y divide-line">
                          {searchResults.map((item) => (
                            <button
                              key={`${item.tipo}-${item.id}`}
                              type="button"
                              onClick={() => {
                                setEditDenunciadoVerificadoRef(item.referencia || String(item.id));
                                setSelectedPersona(item);
                                setShowDropdown(false);
                                setSearchPersonQuery("");
                              }}
                              className="w-full text-left p-2.5 hover:bg-hover flex items-center justify-between transition-colors text-xs"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                      item.tipo === "EMPLEADO"
                                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                        : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                    }`}
                                  >
                                    {item.tipo}
                                  </span>
                                  <span className="font-semibold text-fg">{item.nombreCompleto}</span>
                                </div>
                                <p className="text-[11px] text-muted mt-0.5">
                                  Ref: <span className="font-mono text-fg">{item.referencia}</span>
                                  {item.puesto ? ` • ${item.puesto}` : ""}
                                  {item.identificador ? ` • ${item.identificador}` : ""}
                                </p>
                              </div>
                              <UserCheckIcon className="h-4 w-4 text-muted shrink-0" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Observaciones de la edición */}
                <div>
                  <label htmlFor="editObservacionesInput" className="block text-xs font-medium text-fg mb-1">
                    Observaciones de la Modificación
                  </label>
                  <textarea
                    id="editObservacionesInput"
                    rows={2}
                    value={editObservaciones}
                    onChange={(e) => setEditObservaciones(e.target.value)}
                    placeholder="Escribe el motivo del cambio o notas de dictaminación..."
                    className="w-full rounded-lg border border-line bg-bg p-2 text-xs text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring"
                  />
                </div>

                {/* Botones de acción de edición */}
                <div className="flex justify-end gap-2 pt-2 border-t border-indigo-500/20">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-lg border border-line px-3.5 py-1.5 text-xs font-medium text-fg hover:bg-hover"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={editarDenuncia.isPending}
                    className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {editarDenuncia.isPending ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </div>
              </form>
            ) : null}

            {/* General Info Grid (Modo Consulta) */}
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
                <span className="text-muted font-semibold block mb-0.5">Persona Denunciada (Original)</span>
                <p className="text-fg font-medium">
                  {denuncia.nombreDenunciado || "Anónimo / No especificado"}
                </p>
              </div>

              {/* Campo separado: Persona Denunciada Verificada */}
              <div className="rounded-xl border border-line bg-bg p-3 sm:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted font-semibold block">Persona Denunciada Verificada</span>
                  {denuncia.denunciadoVerificadoRef ? (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <UserCheckIcon className="h-3 w-3" /> Verificado
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      Pendiente de verificación
                    </span>
                  )}
                </div>

                {denuncia.denunciadoVerificadoRef ? (
                  <div className="overflow-hidden rounded-lg border border-line bg-panel">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-line bg-bg text-[10px] text-muted font-semibold">
                        <tr>
                          <th className="px-3 py-1.5">Ref</th>
                          <th className="px-3 py-1.5">Nombre</th>
                          <th className="px-3 py-1.5">Empleado / Socio</th>
                          <th className="px-3 py-1.5 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line/60">
                        <tr>
                          <td className="px-3 py-2 font-mono font-bold text-fg">
                            {denuncia.denunciadoVerificadoRef}
                          </td>
                          <td className="px-3 py-2 font-medium text-fg">
                            {selectedPersona?.nombreCompleto || "Registro en Catálogo"}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                                selectedPersona?.tipo === "EMPLEADO"
                                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                  : selectedPersona?.tipo === "SOCIO"
                                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              }`}
                            >
                              {selectedPersona?.tipo || "VERIFICADO"}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            {selectedPersona ? (
                              <button
                                type="button"
                                onClick={() => setPersonaModalData(selectedPersona)}
                                className="inline-flex items-center gap-1 rounded bg-indigo-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-indigo-700 focus-visible:outline-none"
                                title="Ver más datos de la persona"
                              >
                                <InfoIcon className="h-3 w-3" />
                                Ver más datos
                              </button>
                            ) : (
                              <span className="text-[11px] text-muted">Sin ficha</span>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-muted italic">
                    No se ha asignado una persona verificada. Puedes asignarla editando la denuncia mientras esté en estado de Revisión.
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <span className="text-muted font-semibold block mb-1.5">Descripción de los Hechos</span>
              <div className="rounded-xl border border-line bg-bg p-3.5 text-fg leading-relaxed whitespace-pre-wrap">
                {denuncia.descripcion}
              </div>
            </div>

            {/* Evidences con apertura en nueva pestaña */}
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
                      className="flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-xs text-fg focus-visible:ring-2 focus-visible:ring-accent-ring"
                    />
                    <button
                      type="submit"
                      disabled={!nuevaObservacion.trim() || agregarObs.isPending}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
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

      {/* PANEL MODAL PARA VISUALIZAR MÁS DATOS DE LA PERSONA (SOCIOS / EMPLEADOS) */}
      {personaModalData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-line bg-panel p-5 shadow-2xl text-fg space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-bold ${
                    personaModalData.tipo === "EMPLEADO"
                      ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                      : "bg-purple-500/20 text-purple-600 dark:text-purple-400"
                  }`}
                >
                  {personaModalData.tipo}
                </span>
                <h3 className="text-sm font-bold text-fg">Ficha de la Persona</h3>
              </div>
              <button
                type="button"
                onClick={() => setPersonaModalData(null)}
                className="rounded-lg p-1 text-muted hover:bg-hover hover:text-fg"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl border border-line bg-bg p-3 space-y-1">
                <span className="text-[11px] text-muted font-semibold block">Nombre Completo</span>
                <p className="text-sm font-bold text-fg">{personaModalData.nombreCompleto}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-line bg-bg p-2.5">
                  <span className="text-[10px] text-muted block font-medium">Referencia / No.</span>
                  <p className="font-mono font-bold text-fg">{personaModalData.referencia}</p>
                </div>
                <div className="rounded-lg border border-line bg-bg p-2.5">
                  <span className="text-[10px] text-muted block font-medium">RFC / CURP</span>
                  <p className="font-mono text-fg">{personaModalData.identificador || "No registrado"}</p>
                </div>
              </div>

              {personaModalData.puesto && (
                <div className="rounded-lg border border-line bg-bg p-2.5">
                  <span className="text-[10px] text-muted block font-medium">Puesto / Cargo / Régimen</span>
                  <p className="text-fg font-medium">{personaModalData.puesto}</p>
                </div>
              )}

              {personaModalData.departamento && (
                <div className="rounded-lg border border-line bg-bg p-2.5">
                  <span className="text-[10px] text-muted block font-medium">Departamento / Área</span>
                  <p className="text-fg font-medium">{personaModalData.departamento}</p>
                </div>
              )}

              {(personaModalData.email || personaModalData.telefono) && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-line bg-bg p-2.5">
                    <span className="text-[10px] text-muted block font-medium">Correo Electrónico</span>
                    <p className="text-fg truncate">{personaModalData.email || "No registrado"}</p>
                  </div>
                  <div className="rounded-lg border border-line bg-bg p-2.5">
                    <span className="text-[10px] text-muted block font-medium">Teléfono</span>
                    <p className="text-fg">{personaModalData.telefono || "No registrado"}</p>
                  </div>
                </div>
              )}

              {personaModalData.sucursal && (
                <div className="rounded-lg border border-line bg-bg p-2.5">
                  <span className="text-[10px] text-muted block font-medium">Sucursal / Oficina</span>
                  <p className="text-fg">{personaModalData.sucursal}</p>
                </div>
              )}

              {personaModalData.estatus && (
                <div className="flex items-center justify-between px-1">
                  <span className="text-muted">Estado del Registro:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {personaModalData.estatus}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-line">
              <button
                type="button"
                onClick={() => setPersonaModalData(null)}
                className="rounded-lg bg-slate-200 dark:bg-slate-800 px-4 py-1.5 text-xs font-medium text-fg hover:bg-hover"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
