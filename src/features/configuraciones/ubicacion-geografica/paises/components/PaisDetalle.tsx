import type { PaisResponse } from "../types/pais";

interface PaisDetalleProps {
  pais: PaisResponse;
  nombresListas: string[];
  onEditar: () => void;
}

/**
 * Panel de detalle de un país seleccionado, replicando el bloque inferior
 * de la pantalla legacy "Configuración de Países" (Clave / País / Zona +
 * botón de edición). Es de solo lectura; la edición completa (incluyendo
 * tipo, nacionalidad, código ISO y las listas de riesgo) se hace en `PaisForm`, que se
 * abre con el botón de lápiz.
 *
 * Usa el ámbar de la guía (`warning`) porque es un panel de atención: marca
 * el registro sobre el que se va a actuar, no un estado normal de lectura.
 */
export function PaisDetalle({ pais, nombresListas, onEditar }: PaisDetalleProps) {
  const etiqueta = "w-16 shrink-0 text-sm font-medium text-warning";
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
        <span className={etiqueta}>Listas de riesgo</span>
        <span className={valor}>
          {nombresListas.length > 0 ? nombresListas.join(", ") : "En ninguna lista"}
        </span>
      </div>

      <button
        type="button"
        onClick={onEditar}
        title="Editar país"
        aria-label="Editar país"
        className="self-center rounded-full border border-border bg-card p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-8.5 8.5a2 2 0 0 1-.878.506l-3 .857a.5.5 0 0 1-.618-.618l.857-3a2 2 0 0 1 .506-.878l8.5-8.5Z" />
        </svg>
      </button>
    </div>
  );
}
