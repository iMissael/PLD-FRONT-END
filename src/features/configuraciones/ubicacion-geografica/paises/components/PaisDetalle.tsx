import type { PaisResponse } from "../types/pais";

interface PaisDetalleProps {
  pais: PaisResponse;
  nombresListas: string[];
  onEditar: () => void;
}

/**
 * Panel de detalle de un país seleccionado (Clave / País / Listas asignadas + botón de edición).
 */
export function PaisDetalle({ pais, nombresListas, onEditar }: PaisDetalleProps) {
  const etiqueta = "w-20 shrink-0 text-sm font-medium text-warning";
  const valor =
    "flex-1 rounded-md border border-warning/40 bg-card px-3 py-1.5 text-sm text-foreground";

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-warning/40 bg-warning-soft p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <span className={etiqueta}>Clave</span>
          <span className={valor}>{pais.idPais}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={etiqueta}>País</span>
          <span className={valor}>{pais.nombre}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={etiqueta}>Listas</span>
        <span className={valor}>
          {nombresListas.length > 0 ? nombresListas.join(", ") : "Sin lista asignada"}
        </span>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onEditar}
          className="rounded-md bg-warning px-3 py-1.5 text-xs font-semibold text-warning-foreground hover:bg-warning/90 transition-colors"
        >
          Editar país
        </button>
      </div>
    </div>
  );
}
