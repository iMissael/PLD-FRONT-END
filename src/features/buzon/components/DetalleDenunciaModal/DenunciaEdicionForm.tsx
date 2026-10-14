import { useState, useEffect } from "react";
import { EditIcon, InfoIcon, SearchIcon, UserCheckIcon, XIcon } from "@/shared/components/atoms/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/atoms/Table";
import { buscarPersonasDenunciadas, type PersonaItem } from "../../api/busquedaPersonasApi";
import type { TipoAlertaBuzon, RazonAlerta } from "../../types/catalogos";

interface DenunciaEdicionFormProps {
  denunciaId: number;
  nombreDenunciadoOriginal?: string | null;
  tiposAlerta: TipoAlertaBuzon[];
  razonesAlerta: RazonAlerta[];
  loadingTipos: boolean;
  loadingRazones: boolean;
  editTipoAlertaId: number;
  setEditTipoAlertaId: (val: number) => void;
  editRazonAlertaId: number;
  setEditRazonAlertaId: (val: number) => void;
  editDenunciadoVerificadoRef: string;
  setEditDenunciadoVerificadoRef: (val: string) => void;
  selectedPersona: PersonaItem | null;
  setSelectedPersona: (val: PersonaItem | null) => void;
  editObservaciones: string;
  setEditObservaciones: (val: string) => void;
  selectedRazonDescripcion: string;
  isPending: boolean;
  onVerFichaPersona: (persona: PersonaItem) => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function DenunciaEdicionForm({
  denunciaId,
  nombreDenunciadoOriginal,
  tiposAlerta,
  razonesAlerta,
  loadingTipos,
  loadingRazones,
  editTipoAlertaId,
  setEditTipoAlertaId,
  editRazonAlertaId,
  setEditRazonAlertaId,
  editDenunciadoVerificadoRef,
  setEditDenunciadoVerificadoRef,
  selectedPersona,
  setSelectedPersona,
  editObservaciones,
  setEditObservaciones,
  selectedRazonDescripcion,
  isPending,
  onVerFichaPersona,
  onCancel,
  onSubmit,
}: DenunciaEdicionFormProps) {
  const [searchPersonQuery, setSearchPersonQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PersonaItem[]>([]);
  const [isSearchingPersons, setIsSearchingPersons] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

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

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-primary/40 bg-card p-4 shadow-md ring-1 ring-primary/20">
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
          <span className="font-semibold text-foreground">{nombreDenunciadoOriginal || "Anónimo / No especificado"}</span>
        </div>
        <span className="text-[10px] text-muted-foreground italic bg-card px-2 py-0.5 rounded border border-border">Dato original</span>
      </div>

      {/* BLOQUE FUSIONADO: BUSCADOR Y TABLA DE PERSONA VERIFICADA */}
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
                        onClick={() => onVerFichaPersona(selectedPersona)}
                        className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-white hover:bg-primary-hover focus-visible:outline-none cursor-pointer"
                        title="Ver más datos de la persona"
                      >
                        <InfoIcon className="h-3 w-3" />
                        Ver ficha
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setEditDenunciadoVerificadoRef("");
                        setSelectedPersona(null);
                        setSearchPersonQuery("");
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1 text-[11px] font-medium text-destructive hover:bg-destructive/20 focus-visible:outline-none cursor-pointer"
                      title="Quitar persona asignada"
                    >
                      <XIcon className="h-3 w-3" />
                      Desvincular
                    </button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
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
                    className="w-full text-left p-2.5 hover:bg-muted/50 flex items-center justify-between transition-colors text-xs cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            item.tipo === "EMPLEADO"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                              : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
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

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-white hover:bg-primary-hover disabled:opacity-50 cursor-pointer"
        >
          {isPending ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}
