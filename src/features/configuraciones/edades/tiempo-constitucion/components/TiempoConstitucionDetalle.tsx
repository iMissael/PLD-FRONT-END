import { useMemo } from "react";

import { Badge } from "@/shared/components/ui/CatalogoBadge";
import { Button } from "@/shared/components/ui/CatalogoButton";
import { card } from "@/shared/components/ui/styles";

import { useNivelesRiesgo } from "../../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { TiempoConstitucionResponse } from "../types/tiempoConstitucion";

interface TiempoConstitucionDetalleProps {
  tiempo: TiempoConstitucionResponse;
  onEditar: () => void;
}

/**
 * Panel de solo lectura del rango seleccionado. `nombre` se deriva del rango,
 * asi que se muestra junto a los limites que lo producen.
 */
export function TiempoConstitucionDetalle({
  tiempo,
  onEditar,
}: TiempoConstitucionDetalleProps) {
  const { data: niveles } = useNivelesRiesgo();

  const nivel = useMemo(() => {
    const lista = Array.isArray(niveles) ? niveles : [];
    const encontrado = lista.find((n) => n.id === tiempo.catNivelRiesgoId);
    if (!encontrado) return String(tiempo.catNivelRiesgoId);
    return `${encontrado.nivelRiesgoDescripcion} (${encontrado.nivelRiesgoValor})`;
  }, [niveles, tiempo.catNivelRiesgoId]);

  return (
    <div className={`flex flex-col gap-4 p-4 ${card}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Detalle del tiempo de constitución: {tiempo.nombre}
        </h3>
        <Button onClick={onEditar}>Editar rango</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Clave</span>
          <span className="font-mono text-sm font-semibold text-foreground">{tiempo.id}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Nombre</span>
          <span className="text-sm font-medium text-foreground">{tiempo.nombre}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Años mínimos</span>
          <span className="text-sm font-medium text-foreground">{tiempo.aniosMin}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Años máximos</span>
          <span className="text-sm font-medium text-foreground">
            {tiempo.aniosMax !== null ? tiempo.aniosMax : "Sin límite superior"}
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
          <Badge tono={tiempo.estatus === "A" ? "activo" : "inactivo"}>
            {tiempo.estatus === "A" ? "Activo" : tiempo.estatus === "B" ? "Baja" : "Inactivo"}
          </Badge>
        </span>
      </div>
    </div>
  );
}
