import { InfoIcon, UserCheckIcon } from "@/shared/components/atoms/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/atoms/Table";
import type { Denuncia } from "../../types/buzon";
import type { PersonaItem } from "../../api/busquedaPersonasApi";

interface DenunciaInfoSectionProps {
  denuncia: Denuncia;
  tipoAlertaNombre?: string;
  razonAlertaNombre?: string;
  selectedPersona: PersonaItem | null;
  onVerFichaPersona: (persona: PersonaItem) => void;
}

export function DenunciaInfoSection({
  denuncia,
  tipoAlertaNombre,
  razonAlertaNombre,
  selectedPersona,
  onVerFichaPersona,
}: DenunciaInfoSectionProps) {
  return (
    <div className="space-y-5">
      {/* General Info Grid (Modo Consulta) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <span className="text-[11px] text-muted-foreground block font-medium">Folio de Seguimiento</span>
          <span className="text-sm font-mono font-bold text-foreground">#{denuncia.id}</span>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <span className="text-[11px] text-muted-foreground block font-medium">Clasificación / Tipo de Alerta</span>
          <span className="text-xs font-semibold text-foreground">
            {tipoAlertaNombre || "No especificada"}
          </span>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <span className="text-[11px] text-muted-foreground block font-medium">Razón de Alerta</span>
          <span className="text-xs font-semibold text-foreground">
            {razonAlertaNombre || "No especificada"}
          </span>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <span className="text-[11px] text-muted-foreground block font-medium">Persona Denunciada (Reporte Original)</span>
          <span className="text-xs font-semibold text-foreground">
            {denuncia.nombreDenunciado || "Anónimo / No especificado"}
          </span>
        </div>
      </div>

      {/* Bloque: Persona Denunciada Verificada */}
      <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-semibold block text-xs">
            Persona Denunciada Verificada (`denunciadoVerificadoRef`)
          </span>
          {denuncia.denunciadoVerificadoRef && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <UserCheckIcon className="h-3.5 w-3.5" /> Asignada en expediente
            </span>
          )}
        </div>

        {denuncia.denunciadoVerificadoRef ? (
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
            <Table className="w-full text-left text-xs">
              <TableHeader>
                <TableRow className="border-b border-border bg-muted/50 text-muted-foreground font-semibold text-[11px]">
                  <TableHead className="px-3 py-2">Ref</TableHead>
                  <TableHead className="px-3 py-2">Nombre Completo</TableHead>
                  <TableHead className="px-3 py-2">Tipo</TableHead>
                  <TableHead className="px-3 py-2 text-right">Ficha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-muted/30 transition-colors">
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
                        onClick={() => onVerFichaPersona(selectedPersona)}
                        className="inline-flex items-center gap-1 rounded bg-primary px-2.5 py-1 text-[11px] font-medium text-white hover:bg-primary-hover focus-visible:outline-none cursor-pointer"
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

      {/* Description */}
      <div>
        <span className="text-muted-foreground font-semibold block mb-1.5 text-xs">Descripción de los Hechos</span>
        <div className="rounded-xl border border-border bg-muted/30 p-3.5 text-foreground leading-relaxed whitespace-pre-wrap text-xs">
          {denuncia.descripcion}
        </div>
      </div>
    </div>
  );
}
