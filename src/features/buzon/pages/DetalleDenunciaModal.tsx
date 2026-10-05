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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl text-foreground">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Denuncia #{denunciaId}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Registrada el: {denuncia?.createdAt ? new Date(denuncia.createdAt).toLocaleString("es-MX") : "-"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none"
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

              {/* Status Actions based on Business Rules */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Botón de Editar Denuncia (Solo habilitado en REVISIÓN 'V') */}
                {denuncia.estado === "V" && (
                  <button
                    type="button"
                    onClick={() => setIsEditing((prev) => !prev)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                      isEditing
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
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
                  <span className="text-xs text-muted-foreground font-medium italic">
                    Expediente finalizado ({es.buzon.statusLabels[denuncia.estado]})
                  </span>
                )}
              </div>
            </div>

            {/* FORMULARIO DE EDICIÓN EN REVISIÓN (PUT /buzon/denuncias/{id}) */}
            {isEditing && denuncia.estado === "V" ? (
              <form onSubmit={handleGuardarEdicion} className="space-y-4 rounded-xl border border-primary/40 bg-card p-4 shadow-md ring-1 ring-primary/20">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <EditIcon className="h-4 w-4" />
                    Editar Denuncia en Revisión
                  </h3>
                  <span className="text-[11px] text-muted-foreground font-mono">PUT /buzon/denuncias/{denunciaId}</span>
                </div>

                {/* Selectores de Tipo y Razón de Alerta */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="editTipoAlertaSelect" className="block text-xs font-medium text-foreground mb-1">
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
                      className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                    <label htmlFor="editRazonAlertaSelect" className="block text-xs font-medium text-foreground mb-1">
                      Razón de Alerta
                    </label>
                    <select
                      id="editRazonAlertaSelect"
                      value={editRazonAlertaId}
                      onChange={(e) => setEditRazonAlertaId(Number(e.target.value))}
                      disabled={loadingRazones || editTipoAlertaId <= 0}
                      className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                  <div className="rounded-lg border border-border bg-muted/60 p-2.5 text-[11px] text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground block mb-0.5">Descripción de la Razón:</span>
                    {selectedRazonDescripcion}
                  </div>
                )}

                {/* Contexto: Persona Denunciada Original */}
                <div className="rounded-lg border border-border bg-muted/40 p-2.5 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-muted-foreground block font-medium">Persona Denunciada (Original):</span>
                    <span className="font-semibold text-foreground">{denuncia.nombreDenunciado || "Anónimo / No especificado"}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground italic bg-card px-2 py-0.5 rounded border border-border">Dato original de la denuncia</span>
                </div>

                {/* BLOQUE FUSIONADO: BUSCADOR Y TABLA DE PERSONA VERIFICADA (SOCIOS Y EMPLEADOS) */}
                <div className="space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-foreground">
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
                    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
                      <Table className="w-full text-left text-xs">
                        <TableHeader>
                          <TableRow className="border-b border-border bg-muted/50 text-muted-foreground font-semibold text-[11px]">
                            <TableHead className="px-3 py-2">Ref</TableHead>
                            <TableHead className="px-3 py-2">Nombre</TableHead>
                            <TableHead className="px-3 py-2">Empleado / Socio</TableHead>
                            <TableHead className="px-3 py-2 text-right">Acción</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="hover:bg-muted/30 transition-colors">
                            <TableCell className="px-3 py-2.5 font-mono font-bold text-foreground">
                              {editDenunciadoVerificadoRef}
                            </TableCell>
                            <TableCell className="px-3 py-2.5 font-medium text-foreground">
                              {selectedPersona?.nombreCompleto || "Registro en Catálogo"}
                            </TableCell>
                            <TableCell className="px-3 py-2.5">
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
                            </TableCell>
                            <TableCell className="px-3 py-2.5 text-right space-x-1.5 whitespace-nowrap">
                              {selectedPersona && (
                                <button
                                  type="button"
                                  onClick={() => setPersonaModalData(selectedPersona)}
                                  className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-white hover:bg-primary-hover focus-visible:outline-none"
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
                                className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-destructive hover:border-destructive/30 focus-visible:outline-none"
                                title="Cambiar persona"
                              >
                                <XIcon className="h-3 w-3" />
                                Cambiar
                              </button>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    /* Si no hay persona asignada: Muestra el buscador */
                    <div className="space-y-1">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-muted-foreground">
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
                          className="w-full rounded-lg border border-border bg-background pl-8 pr-8 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        {isSearchingPersons && (
                          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center">
                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          </div>
                        )}
                      </div>

                      {/* Dropdown de resultados */}
                      {showDropdown && searchResults.length > 0 && (
                        <div className="absolute z-20 mt-1 w-full max-h-52 overflow-y-auto rounded-xl border border-border bg-card shadow-xl divide-y divide-border">
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
                              className="w-full text-left p-2.5 hover:bg-muted/50 flex items-center justify-between transition-colors text-xs"
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
                                  <span className="font-semibold text-foreground">{item.nombreCompleto}</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                  Ref: <span className="font-mono text-foreground">{item.referencia}</span>
                                  {item.puesto ? ` • ${item.puesto}` : ""}
                                  {item.identificador ? ` • ${item.identificador}` : ""}
                                </p>
                              </div>
                              <UserCheckIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Observaciones de la edición */}
                <div>
                  <label htmlFor="editObservacionesInput" className="block text-xs font-medium text-foreground mb-1">
                    Observaciones de la Modificación
                  </label>
                  <textarea
                    id="editObservacionesInput"
                    rows={2}
                    value={editObservaciones}
                    onChange={(e) => setEditObservaciones(e.target.value)}
                    placeholder="Escribe el motivo del cambio o notas de dictaminación..."
                    className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                {/* Botones de acción de edición */}
                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-lg border border-border px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={editarDenuncia.isPending}
                    className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-white hover:bg-primary-hover disabled:opacity-50"
                  >
                    {editarDenuncia.isPending ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </div>
              </form>
            ) : null}

            {/* General Info Grid (Modo Consulta) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <span className="text-muted-foreground font-semibold block mb-0.5">Fecha del Incidente</span>
                <p className="text-foreground font-medium">
                  {denuncia.fechaIncidente
                    ? new Date(denuncia.fechaIncidente).toLocaleDateString("es-MX", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "No especificada"}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <span className="text-muted-foreground font-semibold block mb-0.5">Persona Denunciada (Original)</span>
                <p className="text-foreground font-medium">
                  {denuncia.nombreDenunciado || "Anónimo / No especificado"}
                </p>
              </div>

              {/* Campo separado: Persona Denunciada Verificada */}
              <div className="rounded-xl border border-border bg-muted/30 p-3 sm:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground font-semibold block">Persona Denunciada Verificada</span>
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
                  <div className="overflow-hidden rounded-lg border border-border bg-card">
                    <Table className="w-full text-left text-xs">
                      <TableHeader>
                        <TableRow className="border-b border-border bg-muted/50 text-[10px] text-muted-foreground font-semibold">
                          <TableHead className="px-3 py-1.5">Ref</TableHead>
                          <TableHead className="px-3 py-1.5">Nombre</TableHead>
                          <TableHead className="px-3 py-1.5">Empleado / Socio</TableHead>
                          <TableHead className="px-3 py-1.5 text-right">Acción</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="px-3 py-2 font-mono font-bold text-foreground">
                            {denuncia.denunciadoVerificadoRef}
                          </TableCell>
                          <TableCell className="px-3 py-2 font-medium text-foreground">
                            {selectedPersona?.nombreCompleto || "Registro en Catálogo"}
                          </TableCell>
                          <TableCell className="px-3 py-2">
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
                          </TableCell>
                          <TableCell className="px-3 py-2 text-right">
                            {selectedPersona ? (
                              <button
                                type="button"
                                onClick={() => setPersonaModalData(selectedPersona)}
                                className="inline-flex items-center gap-1 rounded bg-primary px-2.5 py-1 text-[11px] font-medium text-white hover:bg-primary-hover focus-visible:outline-none"
                                title="Ver más datos de la persona"
                              >
                                <InfoIcon className="h-3 w-3" />
                                Ver más datos
                              </button>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">Sin ficha</span>
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No se ha asignado una persona verificada. Puedes asignarla editando la denuncia mientras esté en estado de Revisión.
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <span className="text-muted-foreground font-semibold block mb-1.5">Descripción de los Hechos</span>
              <div className="rounded-xl border border-border bg-muted/30 p-3.5 text-foreground leading-relaxed whitespace-pre-wrap">
                {denuncia.descripcion}
              </div>
            </div>

            {/* Evidences con apertura en nueva pestaña */}
            <div>
              <span className="text-muted-foreground font-semibold block mb-1.5">Evidencias Adjuntas</span>
              {evidenciasCombined && evidenciasCombined.length > 0 ? (
                <ul className="space-y-1.5">
                  {evidenciasCombined.map((ev) => (
                    <li
                      key={ev.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-card p-2.5 transition-colors hover:border-primary/50 hover:bg-muted/40"
                    >
                      <div className="flex items-center gap-2 truncate mr-2">
                        <PaperclipIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="font-medium truncate text-foreground" title={ev.nombre}>
                          {ev.nombre || `Evidencia #${ev.id}`}
                        </span>
                        <span className="text-[11px] text-muted-foreground shrink-0">
                          ({ev.tipoArchivo || "Archivo"})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleVerEvidencia(ev.id, ev.nombre)}
                        disabled={openingEvidenciaId === ev.id}
                        className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground hover:bg-secondary-hover disabled:opacity-50 shrink-0 focus-visible:outline-none"
                        title="Ver evidencia en nueva pestaña"
                      >
                        {openingEvidenciaId === ev.id ? (
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        ) : (
                          <EyeIcon className="h-3.5 w-3.5" />
                        )}
                        <span>{openingEvidenciaId === ev.id ? "Cargando..." : "Ver archivo"}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground italic">Sin evidencias adjuntas en el expediente.</p>
              )}
            </div>

            {/* Observations History & Input Form */}
            <div className="border-t border-border pt-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-foreground">
                  Historial de Observaciones ({observacionesCombined.length})
                </h3>
                {denuncia.estado === "V" && !tieneObservaciones && (
                  <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                    Obligatorio registrar al menos 1 observación en revisión
                  </span>
                )}
              </div>

              {/* Observation Timeline List */}
              {observacionesCombined && observacionesCombined.length > 0 ? (
                <ul className="space-y-2.5 mb-4 max-h-60 overflow-y-auto pr-1">
                  {observacionesCombined.map((obs) => (
                    <li
                      key={obs.id}
                      className="rounded-xl border border-border bg-muted/30 p-3 space-y-1"
                    >
                      <p className="text-foreground leading-normal">{obs.observacion}</p>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                        <span className="font-medium">
                          Usuario: <span className="text-foreground">{obs.verificoRef || user?.nombre || "Oficial PLD"}</span>
                        </span>
                        <span>{new Date(obs.createdAt).toLocaleString("es-MX")}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground italic mb-4">No hay observaciones registradas aún.</p>
              )}

              {/* Form to add more observations */}
              {(denuncia.estado === "R" || denuncia.estado === "V") && (
                <form onSubmit={handleAddObservation} className="space-y-2 pt-2 border-t border-border">
                  <label htmlFor="nuevaObsInput" className="block text-xs font-semibold text-foreground">
                    Agregar Observación de Seguimiento
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="nuevaObsInput"
                      type="text"
                      value={nuevaObservacion}
                      onChange={(e) => setNuevaObservacion(e.target.value)}
                      placeholder="Escribe una observación de revisión (puedes agregar múltiples)..."
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <button
                      type="submit"
                      disabled={!nuevaObservacion.trim() || agregarObs.isPending}
                      className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary-hover disabled:opacity-50"
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
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl text-foreground space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
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
                <h3 className="text-sm font-bold text-foreground">Ficha de la Persona</h3>
              </div>
              <button
                type="button"
                onClick={() => setPersonaModalData(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-1">
                <span className="text-[11px] text-muted-foreground font-semibold block">Nombre Completo</span>
                <p className="text-sm font-bold text-foreground">{personaModalData.nombreCompleto}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-border bg-muted/30 p-2.5">
                  <span className="text-[10px] text-muted-foreground block font-medium">Referencia / No.</span>
                  <p className="font-mono font-bold text-foreground">{personaModalData.referencia}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-2.5">
                  <span className="text-[10px] text-muted-foreground block font-medium">RFC / CURP</span>
                  <p className="font-mono text-foreground">{personaModalData.identificador || "No registrado"}</p>
                </div>
              </div>

              {personaModalData.puesto && (
                <div className="rounded-lg border border-border bg-muted/30 p-2.5">
                  <span className="text-[10px] text-muted-foreground block font-medium">Puesto / Cargo / Régimen</span>
                  <p className="text-foreground font-medium">{personaModalData.puesto}</p>
                </div>
              )}

              {personaModalData.departamento && (
                <div className="rounded-lg border border-border bg-muted/30 p-2.5">
                  <span className="text-[10px] text-muted-foreground block font-medium">Departamento / Área</span>
                  <p className="text-foreground font-medium">{personaModalData.departamento}</p>
                </div>
              )}

              {(personaModalData.email || personaModalData.telefono) && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-border bg-muted/30 p-2.5">
                    <span className="text-[10px] text-muted-foreground block font-medium">Correo Electrónico</span>
                    <p className="text-foreground truncate">{personaModalData.email || "No registrado"}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-2.5">
                    <span className="text-[10px] text-muted-foreground block font-medium">Teléfono</span>
                    <p className="text-foreground">{personaModalData.telefono || "No registrado"}</p>
                  </div>
                </div>
              )}

              {personaModalData.sucursal && (
                <div className="rounded-lg border border-border bg-muted/30 p-2.5">
                  <span className="text-[10px] text-muted-foreground block font-medium">Sucursal / Oficina</span>
                  <p className="text-foreground">{personaModalData.sucursal}</p>
                </div>
              )}

              {personaModalData.estatus && (
                <div className="flex items-center justify-between px-1">
                  <span className="text-muted-foreground">Estado del Registro:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {personaModalData.estatus}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setPersonaModalData(null)}
                className="rounded-lg bg-secondary px-4 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary-hover"
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
