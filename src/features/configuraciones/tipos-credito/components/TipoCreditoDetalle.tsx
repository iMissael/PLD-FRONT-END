import { useMemo } from "react";

import { Badge } from "@/shared/components/ui/CatalogoBadge";
import { Button } from "@/shared/components/ui/CatalogoButton";
import { card } from "@/shared/components/ui/styles";

import { useTiposPrestamo } from "../../tipos-prestamo/hooks/useTiposPrestamo";
import { useNivelesRiesgo } from "../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { TipoCreditoResponse } from "../types/tipoCredito";

interface TipoCreditoDetalleProps {
  tipo: TipoCreditoResponse;
  onEditar: () => void;
}

/**
 * Panel de solo lectura del registro seleccionado. Resuelve nivel de riesgo y
 * tipo de prestamo con los mismos hooks que la tabla: la caché de TanStack
 * Query es compartida, asi que no son peticiones extra.
 */
export function TipoCreditoDetalle({ tipo, onEditar }: TipoCreditoDetalleProps) {
  const { data: niveles } = useNivelesRiesgo();
  const { data: tiposPrestamo } = useTiposPrestamo();

  const nivel = useMemo(() => {
    const lista = Array.isArray(niveles) ? niveles : [];
    const encontrado = lista.find((n) => n.id === tipo.catNivelRiesgoId);
    if (!encontrado) return String(tipo.catNivelRiesgoId);
    return `${encontrado.nivelRiesgoDescripcion} (${encontrado.nivelRiesgoValor})`;
  }, [niveles, tipo.catNivelRiesgoId]);

  const tipoPrestamo = useMemo(() => {
    if (!tipo.catTipoPrestamoId) return "— sin asignar —";
    const lista = Array.isArray(tiposPrestamo) ? tiposPrestamo : [];
    return lista.find((tp) => tp.id === tipo.catTipoPrestamoId)?.nombre ?? tipo.catTipoPrestamoId;
  }, [tiposPrestamo, tipo.catTipoPrestamoId]);

  return (
    <div className={`flex flex-col gap-4 p-4 ${card}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Detalle del tipo de crédito: {tipo.nombre}
        </h3>
        <Button onClick={onEditar}>Editar tipo</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Clave</span>
          <span className="font-mono text-sm font-semibold text-foreground">{tipo.id}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Nombre</span>
          <span className="text-sm font-medium text-foreground">{tipo.nombre}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Tipo de préstamo</span>
          <span className="text-sm text-foreground">{tipoPrestamo}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Nivel de riesgo</span>
          <span className="text-sm font-semibold text-foreground">{nivel}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Estatus</span>
          <span className="self-start">
            <Badge tono={tipo.estatus === "A" ? "activo" : "inactivo"}>
              {tipo.estatus === "A" ? "Activo" : tipo.estatus === "B" ? "Baja" : "Inactivo"}
            </Badge>
          </span>
        </div>
      </div>
    </div>
  );
}
