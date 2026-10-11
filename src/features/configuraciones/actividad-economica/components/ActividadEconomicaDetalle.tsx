import { useMemo } from "react";

import { Badge } from "@/shared/components/ui/CatalogoBadge";
import { Button } from "@/shared/components/ui/CatalogoButton";
import { card } from "@/shared/components/ui/styles";

import { useNivelesRiesgo } from "../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { ActividadEconomicaResponse } from "../types/actividadEconomica";

interface ActividadEconomicaDetalleProps {
  actividad: ActividadEconomicaResponse;
  onEditar: () => void;
}

/**
 * Panel de solo lectura del registro seleccionado. Resuelve el nivel de riesgo
 * con el mismo hook que la tabla: la caché de TanStack Query es compartida, asi
 * que no es una peticion extra.
 */
export function ActividadEconomicaDetalle({
  actividad,
  onEditar,
}: ActividadEconomicaDetalleProps) {
  const { data: niveles } = useNivelesRiesgo();

  const nivel = useMemo(() => {
    const lista = Array.isArray(niveles) ? niveles : [];
    const encontrado = lista.find((n) => n.id === actividad.catNivelRiesgoId);
    if (!encontrado) return String(actividad.catNivelRiesgoId);
    return `${encontrado.nivelRiesgoDescripcion} (${encontrado.nivelRiesgoValor})`;
  }, [niveles, actividad.catNivelRiesgoId]);

  return (
    <div className={`flex flex-col gap-4 p-4 ${card}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Detalle de la actividad: {actividad.descripcion}
        </h3>
        <Button onClick={onEditar}>Editar actividad</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Clave</span>
          <span className="font-mono text-sm font-semibold text-foreground">{actividad.id}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Clave SAT</span>
          <span className="font-mono text-sm text-foreground">{actividad.claveSat || "—"}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Descripción</span>
          <span className="text-sm font-medium text-foreground">{actividad.descripcion}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Actividad vulnerable</span>
          <span className="text-sm text-foreground">
            {actividad.esActividadVulnerable ? "Sí" : "No"}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Nivel de riesgo</span>
          <span className="text-sm font-semibold text-foreground">{nivel}</span>
        </div>
      </div>

      <div className="flex flex-col gap-0.5 border-t border-border pt-3">
        <span className="text-xs font-medium text-muted-foreground">Estatus</span>
        <span className="self-start">
          <Badge tono={actividad.estatus === "A" ? "activo" : "inactivo"}>
            {actividad.estatus === "A"
              ? "Activo"
              : actividad.estatus === "B"
              ? "Baja"
              : "Inactivo"}
          </Badge>
        </span>
      </div>
    </div>
  );
}
