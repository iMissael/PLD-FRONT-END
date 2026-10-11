import { useMemo } from "react";

import { Badge } from "@/shared/components/ui/CatalogoBadge";
import { Button } from "@/shared/components/ui/CatalogoButton";
import { card } from "@/shared/components/ui/styles";

import { useNivelesRiesgo } from "../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { CanalPagoResponse } from "../types/canalPago";

interface CanalPagoDetalleProps {
  canal: CanalPagoResponse;
  onEditar: () => void;
}

/**
 * Panel de solo lectura del registro seleccionado. `clave` y `acronimo` no se
 * capturan en el formulario, asi que este panel es el unico lugar donde se ven.
 */
export function CanalPagoDetalle({ canal, onEditar }: CanalPagoDetalleProps) {
  const { data: niveles } = useNivelesRiesgo();

  const nivel = useMemo(() => {
    const lista = Array.isArray(niveles) ? niveles : [];
    const encontrado = lista.find((n) => n.id === canal.catNivelRiesgoId);
    if (!encontrado) return String(canal.catNivelRiesgoId);
    return `${encontrado.nivelRiesgoDescripcion} (${encontrado.nivelRiesgoValor})`;
  }, [niveles, canal.catNivelRiesgoId]);

  return (
    <div className={`flex flex-col gap-4 p-4 ${card}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Detalle del canal de pago: {canal.nombre}
        </h3>
        <Button onClick={onEditar}>Editar canal</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Clave interna</span>
          <span className="font-mono text-sm font-semibold text-foreground">{canal.id}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Clave</span>
          <span className="font-mono text-sm text-foreground">{canal.clave || "—"}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Nombre</span>
          <span className="text-sm font-medium text-foreground">{canal.nombre}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Acrónimo</span>
          <span className="text-sm text-foreground">{canal.acronimo || "—"}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Nivel de riesgo</span>
          <span className="text-sm font-semibold text-foreground">{nivel}</span>
        </div>
      </div>

      <div className="flex flex-col gap-0.5 border-t border-border pt-3">
        <span className="text-xs font-medium text-muted-foreground">Estatus</span>
        <span className="self-start">
          <Badge tono={canal.estatus === "A" ? "activo" : "inactivo"}>
            {canal.estatus === "A" ? "Activo" : canal.estatus === "B" ? "Baja" : "Inactivo"}
          </Badge>
        </span>
      </div>
    </div>
  );
}
