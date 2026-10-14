import { XIcon } from "@/shared/components/atoms/icons";
import type { PersonaItem } from "../../api/busquedaPersonasApi";

interface FichaPersonaModalProps {
  persona: PersonaItem | null;
  onClose: () => void;
}

export function FichaPersonaModal({ persona, onClose }: FichaPersonaModalProps) {
  if (!persona) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl text-foreground space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span
              className={`rounded px-2 py-0.5 text-xs font-bold ${
                persona.tipo === "EMPLEADO"
                  ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                  : "bg-purple-500/20 text-purple-600 dark:text-purple-400"
              }`}
            >
              {persona.tipo}
            </span>
            <h3 className="text-sm font-bold text-foreground">Ficha de la Persona</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-1">
            <span className="text-[11px] text-muted-foreground font-semibold block">Nombre Completo</span>
            <p className="text-sm font-bold text-foreground">{persona.nombreCompleto}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-border bg-muted/30 p-2.5">
              <span className="text-[10px] text-muted-foreground block font-medium">Referencia / No.</span>
              <p className="font-mono font-bold text-foreground">{persona.referencia}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-2.5">
              <span className="text-[10px] text-muted-foreground block font-medium">RFC / CURP</span>
              <p className="font-mono text-foreground">{persona.identificador || "No registrado"}</p>
            </div>
          </div>

          {persona.puesto && (
            <div className="rounded-lg border border-border bg-muted/30 p-2.5">
              <span className="text-[10px] text-muted-foreground block font-medium">Puesto / Cargo / Régimen</span>
              <p className="text-foreground font-medium">{persona.puesto}</p>
            </div>
          )}

          {persona.departamento && (
            <div className="rounded-lg border border-border bg-muted/30 p-2.5">
              <span className="text-[10px] text-muted-foreground block font-medium">Departamento / Área</span>
              <p className="text-foreground font-medium">{persona.departamento}</p>
            </div>
          )}

          {(persona.email || persona.telefono) && (
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-border bg-muted/30 p-2.5">
                <span className="text-[10px] text-muted-foreground block font-medium">Correo Electrónico</span>
                <p className="text-foreground truncate">{persona.email || "No registrado"}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-2.5">
                <span className="text-[10px] text-muted-foreground block font-medium">Teléfono</span>
                <p className="text-foreground">{persona.telefono || "No registrado"}</p>
              </div>
            </div>
          )}

          {persona.sucursal && (
            <div className="rounded-lg border border-border bg-muted/30 p-2.5">
              <span className="text-[10px] text-muted-foreground block font-medium">Sucursal / Oficina</span>
              <p className="text-foreground">{persona.sucursal}</p>
            </div>
          )}

          {persona.estatus && (
            <div className="flex items-center justify-between px-1">
              <span className="text-muted-foreground">Estado del Registro:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {persona.estatus}
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-secondary px-4 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary-hover"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
}
