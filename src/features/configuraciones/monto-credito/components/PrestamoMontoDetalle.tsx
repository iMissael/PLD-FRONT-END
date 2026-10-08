import { useMemo } from "react";

import { Badge } from "@/shared/components/ui/CatalogoBadge";
import { Button } from "@/shared/components/ui/CatalogoButton";
import { card } from "@/shared/components/ui/styles";

import { useNivelesRiesgo } from "../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { PrestamoMontoResponse } from "../types/prestamoMonto";
import { formatearMonto, formatearRangoMonto } from "../utils/nombreMonto";

interface PrestamoMontoDetalleProps {
  rango: PrestamoMontoResponse;
  onEditar: () => void;
}

/**
 * Panel de solo lectura del rango seleccionado. Los montos se formatean con los
 * mismos helpers que la tabla y el formulario.
 */
export function PrestamoMontoDetalle({ rango, onEditar }: PrestamoMontoDetalleProps) {
  const { data: niveles } = useNivelesRiesgo();

  const nivel = useMemo(() => {
    const lista = Array.isArray(niveles) ? niveles : [];
    const encontrado = lista.find((n) => n.id === rango.catNivelRiesgoId);
    if (!encontrado) return String(rango.catNivelRiesgoId);
    return `${encontrado.nivelRiesgoDescripcion} (${encontrado.nivelRiesgoValor})`;
  }, [niveles, rango.catNivelRiesgoId]);

  return (
    <div className={`flex flex-col gap-4 p-4 ${card}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Detalle del rango: {formatearRangoMonto(rango.montoMin, rango.montoMax)}
        </h3>
        <Button onClick={onEditar}>Editar rango</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Clave</span>
          <span className="font-mono text-sm font-semibold text-foreground">{rango.id}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Nombre</span>
          <span className="text-sm font-medium text-foreground">{rango.nombre}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Monto mínimo</span>
          <span className="text-sm font-medium text-foreground">
            {formatearMonto(rango.montoMin)}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Monto máximo</span>
          <span className="text-sm font-medium text-foreground">
            {rango.montoMax !== null ? formatearMonto(rango.montoMax) : "Sin límite superior"}
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
          <Badge tono={rango.estatus === "A" ? "activo" : "inactivo"}>
            {rango.estatus === "A" ? "Activo" : rango.estatus === "B" ? "Baja" : "Inactivo"}
          </Badge>
        </span>
      </div>
    </div>
  );
}
