import { card, emptyState } from "@/shared/components/ui/styles";

import { useEntidadesDeZona } from "../hooks/useZonasGeograficas";
import type { ZonaGeograficaResponse } from "../types/zonaGeografica";

interface ZonaAsignacionesProps {
  zona: ZonaGeograficaResponse;
  onCerrar: () => void;
}

/**
 * Panel de "Ver" de una zona: solo lectura, con las entidades que ya están en
 * esa zona. La asignación se hace desde la pantalla de Entidades.
 */
export function ZonaAsignaciones({ zona, onCerrar }: ZonaAsignacionesProps) {
  const { data, isLoading } = useEntidadesDeZona(zona.id, true);
  const entidades = Array.isArray(data) ? data : [];

  return (
    <div className={`flex flex-col gap-4 p-4 ${card}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Entidades de la zona: {zona.nombre}</h3>
          {zona.esEntidadEspecial ? (
            <p className="text-xs text-muted-foreground">
              Zona especial: cada entidad conserva el nivel de su zona principal.
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onCerrar}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Cerrar
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">Entidades asignadas ({entidades.length})</p>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando...</p>
        ) : entidades.length > 0 ? (
          <ul className="max-h-96 divide-y divide-border overflow-y-auto rounded-md border border-border">
            {entidades.map((entidad) => (
              <li key={entidad.id} className="px-3 py-2 text-sm text-foreground">
                {entidad.nombre}
              </li>
            ))}
          </ul>
        ) : (
          <p className={emptyState}>Esta zona no tiene entidades asignadas.</p>
        )}
      </div>
    </div>
  );
}
