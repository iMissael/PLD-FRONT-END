import { useMemo } from "react";

import { Badge } from "@/shared/components/ui/CatalogoBadge";
import { Button } from "@/shared/components/ui/CatalogoButton";
import { card } from "@/shared/components/ui/styles";

import { useNivelesRiesgo } from "../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { ExperienciaActividadResponse } from "../types/experienciaActividad";

interface ExperienciaActividadDetalleProps {
  experiencia: ExperienciaActividadResponse;
  onEditar: () => void;
}

/**
 * Panel de solo lectura del rango seleccionado. `nombre` se deriva del rango,
 * asi que se muestra junto a los limites que lo producen.
 */
export function ExperienciaActividadDetalle({
  experiencia,
  onEditar,
}: ExperienciaActividadDetalleProps) {
  const { data: niveles } = useNivelesRiesgo();

  const nivel = useMemo(() => {
    const lista = Array.isArray(niveles) ? niveles : [];
    const encontrado = lista.find((n) => n.id === experiencia.catNivelRiesgoId);
    if (!encontrado) return String(experiencia.catNivelRiesgoId);
    return `${encontrado.nivelRiesgoDescripcion} (${encontrado.nivelRiesgoValor})`;
  }, [niveles, experiencia.catNivelRiesgoId]);

  return (
    <div className={`flex flex-col gap-4 p-4 ${card}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Detalle de la experiencia: {experiencia.nombre}
        </h3>
        <Button onClick={onEditar}>Editar rango</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Clave</span>
          <span className="font-mono text-sm font-semibold text-foreground">
            {experiencia.id}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Nombre</span>
          <span className="text-sm font-medium text-foreground">{experiencia.nombre}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Años mínimos</span>
          <span className="text-sm font-medium text-foreground">{experiencia.aniosMin}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Años máximos</span>
          <span className="text-sm font-medium text-foreground">
            {experiencia.aniosMax !== null ? experiencia.aniosMax : "Sin límite superior"}
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
          <Badge tono={experiencia.estatus === "A" ? "activo" : "inactivo"}>
            {experiencia.estatus === "A"
              ? "Activa"
              : experiencia.estatus === "B"
              ? "Baja"
              : "Inactiva"}
          </Badge>
        </span>
      </div>
    </div>
  );
}
