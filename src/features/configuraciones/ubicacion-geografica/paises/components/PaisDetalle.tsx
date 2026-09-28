import type { PaisResponse } from "../types/pais";

interface PaisDetalleProps {
  pais: PaisResponse;
  nombresZonas: string[];
  onEditar: () => void;
}

/**
 * Panel de detalle de un país seleccionado, replicando el bloque inferior
 * de la pantalla legacy "Configuración de Países" (Clave / País / Zona +
 * botón de edición). Es de solo lectura; la edición completa (incluyendo
 * tipo, nacionalidad, código ISO y las zonas) se hace en `PaisForm`, que se
 * abre con el botón de lápiz.
 */
export function PaisDetalle({ pais, nombresZonas, onEditar }: PaisDetalleProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary-soft/40 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <span className="w-16 shrink-0 text-sm font-medium text-primary-strong">
            Clave
          </span>
          <span className="flex-1 rounded-md border-primary/30 border bg-white px-3 py-1.5 text-sm text-slate-800">
            {pais.idPais}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-16 shrink-0 text-sm font-medium text-primary-strong">
            País
          </span>
          <span className="flex-1 rounded-md border-primary/30 border bg-white px-3 py-1.5 text-sm text-slate-800">
            {pais.nombre}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="w-16 shrink-0 text-sm font-medium text-primary-strong">
          Zona
        </span>
        <span className="flex-1 rounded-md border-primary/30 border bg-white px-3 py-1.5 text-sm text-slate-800">
          {nombresZonas.length > 0 ? nombresZonas.join(", ") : "Sin zona asignada"}
        </span>
      </div>

      <button
        type="button"
        onClick={onEditar}
        title="Editar país"
        aria-label="Editar país"
        className="self-center rounded-full border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-50"
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
