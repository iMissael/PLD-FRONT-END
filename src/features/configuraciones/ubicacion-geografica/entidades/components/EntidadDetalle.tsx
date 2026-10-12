import { Button } from "@/shared/components/ui/CatalogoButton";
import { card } from "@/shared/components/ui/styles";

import type { EntidadResponse } from "../types/entidad";

/** Zona asignada con su nivel ya resuelto; `nivelRiesgo` es nulo si no se pudo resolver. */
export interface ZonaConNivel {
  id: string;
  nombre: string;
  nivelRiesgo: string | null;
}

interface EntidadDetalleProps {
  entidad: EntidadResponse;
  /** Zonas asignadas, ya resueltas contra el catálogo de zonas. */
  zonas: ZonaConNivel[];
  onEditar: () => void;
}

/**
 * Panel de solo lectura de la entidad seleccionada. Mismo patrón que
 * `PaisDetalle`: al hacer clic en un renglón se muestran los datos sin poder
 * modificarlos, y el botón de editar es el que abre el formulario.
 */
export function EntidadDetalle({ entidad, zonas, onEditar }: EntidadDetalleProps) {
  return (
    <div className={`flex flex-col gap-4 p-4 ${card}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Detalle de la entidad: {entidad.nombre}
        </h3>
        <Button onClick={onEditar}>Editar entidad</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Clave CURP</span>
          <span className="font-mono text-sm font-semibold text-foreground">
            {entidad.claveCurp}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Nombre</span>
          <span className="text-sm font-medium text-foreground">{entidad.nombre}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Prefijo buró</span>
          <span className="font-mono text-sm text-foreground">{entidad.preBuro || "—"}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Entidad federativa</span>
          <span className="text-sm text-foreground">
            {entidad.esEntidad === "S" ? "Sí" : "No"}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">País</span>
          <span className="text-sm text-foreground">{entidad.nombrePais || "—"}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 border-t border-border pt-3">
        <span className="text-xs font-medium text-muted-foreground">
          Zonas de riesgo y nivel asignado
        </span>
        {zonas.length > 0 ? (
          <ul className="divide-y divide-border rounded-md border border-border">
            {zonas.map((zona) => (
              <li
                key={zona.id}
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
              >
                <span className="text-sm font-medium text-foreground">{zona.nombre}</span>
                <span className="text-sm font-semibold text-foreground">
                  {zona.nivelRiesgo ?? "—"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-sm text-muted-foreground">Sin zonas asignadas</span>
        )}
      </div>
    </div>
  );
}
