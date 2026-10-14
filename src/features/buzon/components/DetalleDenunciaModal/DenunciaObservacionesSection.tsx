import { useState } from "react";
import { useAuthStore } from "@/shared/auth/authStore";
import type { EstadoDenuncia, ObservacionDenuncia } from "../../types/buzon";

interface DenunciaObservacionesSectionProps {
  observaciones: ObservacionDenuncia[];
  estado: EstadoDenuncia;
  isPending: boolean;
  onAddObservacion: (obs: string) => Promise<void>;
}

export function DenunciaObservacionesSection({
  observaciones,
  estado,
  isPending,
  onAddObservacion,
}: DenunciaObservacionesSectionProps) {
  const user = useAuthStore((state) => state.usuario);
  const [nuevaObservacion, setNuevaObservacion] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaObservacion.trim() || isPending) return;
    await onAddObservacion(nuevaObservacion);
    setNuevaObservacion("");
  };

  const tieneObservaciones = observaciones.length > 0;

  return (
    <div className="border-t border-border pt-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground">
          Historial de Observaciones ({observaciones.length})
        </h3>
        {estado === "V" && !tieneObservaciones && (
          <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
            Obligatorio registrar al menos 1 observación en revisión
          </span>
        )}
      </div>

      {/* Observation Timeline List */}
      {observaciones && observaciones.length > 0 ? (
        <ul className="space-y-2.5 mb-4 max-h-60 overflow-y-auto pr-1">
          {observaciones.map((obs) => (
            <li
              key={obs.id}
              className="rounded-xl border border-border bg-muted/30 p-3 space-y-1"
            >
              <p className="text-foreground leading-normal text-xs">{obs.observacion}</p>
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
        <p className="text-muted-foreground italic mb-4 text-xs">
          No hay observaciones registradas aún.
        </p>
      )}

      {/* Form to add more observations */}
      {(estado === "R" || estado === "V") && (
        <form onSubmit={handleSubmit} className="space-y-2 pt-2 border-t border-border">
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
              disabled={!nuevaObservacion.trim() || isPending}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary-hover disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "Guardando..." : "Agregar Observación"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
