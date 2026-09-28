import { card, emptyState } from "@/shared/components/ui/styles";

import { useEntidadesDeZona, usePaisesDeZona } from "../hooks/useZonasGeograficas";
import type { ZonaGeograficaResponse } from "../types/zonaGeografica";

interface ZonaAsignacionesProps {
  zona: ZonaGeograficaResponse;
  onCerrar: () => void;
}

/**
 * Panel de "Ver" de una zona: es de solo lectura y muestra ÚNICAMENTE los
 * países o entidades que ya están relacionados con esa zona (no el catálogo
 * completo). La asignación/edición de esa relación se hace desde la
 * pantalla del país (o de la entidad), no desde aquí.
 *
 * Regla de negocio: ninguna zona debe tener países Y entidades asignados a
 * la vez (son dos tipos de zona distintos: internacional vs. nacional por
 * entidad); la única excepción histórica es la zona usada para México. El
 * tipo de zona es el campo `entidadPais` ('E'/'P'); si una zona antigua
 * todavía no lo tiene cargado (null), se infiere por sus asignaciones
 * actuales como respaldo.
 */
export function ZonaAsignaciones({ zona, onCerrar }: ZonaAsignacionesProps) {
  const esZonaDeEntidades =
    zona.entidadPais !== null
      ? zona.entidadPais === "E"
      : zona.totalEntidadesAsignadas > 0;

  const { data: entidadesDeZona, isLoading: cargandoEntidadesZona } = useEntidadesDeZona(
    zona.id,
    esZonaDeEntidades,
  );
  const { data: paisesDeZona, isLoading: cargandoPaisesZona } = usePaisesDeZona(
    zona.id,
    !esZonaDeEntidades,
  );

  return (
    <div className={`flex flex-col gap-4 p-4 ${card}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          {esZonaDeEntidades ? "Entidades" : "Países"} de la zona: {zona.nombre}
        </h3>
        <button
          type="button"
          onClick={onCerrar}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Cerrar
        </button>
      </div>

      {esZonaDeEntidades ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">
            Entidades asignadas ({entidadesDeZona?.length ?? 0})
          </p>
          {cargandoEntidadesZona ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : entidadesDeZona && entidadesDeZona.length > 0 ? (
            <ul className="max-h-96 divide-y divide-border overflow-y-auto rounded-md border border-border">
              {entidadesDeZona.map((entidad) => (
                <li key={entidad.id} className="px-3 py-2 text-sm text-foreground">
                  {entidad.nombre}
                </li>
              ))}
            </ul>
          ) : (
            <p className={emptyState}>Esta zona no tiene entidades asignadas.</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">
            Países asignados ({paisesDeZona?.length ?? 0})
          </p>
          {cargandoPaisesZona ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : paisesDeZona && paisesDeZona.length > 0 ? (
            <ul className="max-h-96 divide-y divide-border overflow-y-auto rounded-md border border-border">
              {paisesDeZona.map((pais) => (
                <li key={pais.id} className="px-3 py-2 text-sm text-foreground">
                  {pais.nombre}
                </li>
              ))}
            </ul>
          ) : (
            <p className={emptyState}>Esta zona no tiene países asignados.</p>
          )}
        </div>
      )}
    </div>
  );
}
