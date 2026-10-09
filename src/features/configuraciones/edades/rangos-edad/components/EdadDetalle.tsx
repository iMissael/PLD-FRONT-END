import { useMemo } from "react";

import { Badge } from "@/shared/components/ui/CatalogoBadge";
import { Button } from "@/shared/components/ui/CatalogoButton";
import { card } from "@/shared/components/ui/styles";

import { useNivelesRiesgo } from "../../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { EdadResponse } from "../types/edad";
import { formatearRango } from "./EdadesTable";

interface EdadDetalleProps {
  edad: EdadResponse;
  onEditar: () => void;
}

/** Panel de solo lectura del rango seleccionado. */
export function EdadDetalle({ edad, onEditar }: EdadDetalleProps) {
  const { data: niveles } = useNivelesRiesgo();

  const nivel = useMemo(() => {
    const lista = Array.isArray(niveles) ? niveles : [];
    const encontrado = lista.find((n) => n.id === edad.catNivelRiesgoId);
    if (!encontrado) return String(edad.catNivelRiesgoId);
    return `${encontrado.nivelRiesgoDescripcion} (${encontrado.nivelRiesgoValor})`;
  }, [niveles, edad.catNivelRiesgoId]);

  return (
    <div className={`flex flex-col gap-4 p-4 ${card}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Detalle del rango: {formatearRango(edad.edadInicial, edad.edadFinal)}
        </h3>
        <Button onClick={onEditar}>Editar rango</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Clave</span>
          <span className="font-mono text-sm font-semibold text-foreground">{edad.id}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Edad mínima</span>
          <span className="text-sm font-medium text-foreground">{edad.edadInicial} años</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Edad máxima</span>
          <span className="text-sm font-medium text-foreground">
            {edad.edadFinal !== null ? `${edad.edadFinal} años` : "Sin límite superior"}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Nivel de riesgo</span>
          <span className="text-sm font-semibold text-foreground">{nivel}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Estatus</span>
          <span className="self-start">
            <Badge tono={edad.estatus === "A" ? "activo" : "inactivo"}>
              {edad.estatus === "A" ? "Activa" : edad.estatus === "B" ? "Baja" : "Inactiva"}
            </Badge>
          </span>
        </div>
      </div>
    </div>
  );
}
