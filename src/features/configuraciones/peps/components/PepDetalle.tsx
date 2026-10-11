import { useMemo } from "react";

import { Badge } from "@/shared/components/ui/CatalogoBadge";
import { Button } from "@/shared/components/ui/CatalogoButton";
import { card } from "@/shared/components/ui/styles";

import { useNivelesRiesgo } from "../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import { ETIQUETAS_TIPO_PEP, type PepResponse } from "../types/pep";

interface PepDetalleProps {
  pep: PepResponse;
  onEditar: () => void;
}

/**
 * Panel de solo lectura del registro seleccionado. Resuelve el nivel de riesgo
 * con el mismo hook que la tabla: la caché de TanStack Query es compartida, asi
 * que no es una peticion extra.
 */
export function PepDetalle({ pep, onEditar }: PepDetalleProps) {
  const { data: niveles } = useNivelesRiesgo();

  const nivel = useMemo(() => {
    const lista = Array.isArray(niveles) ? niveles : [];
    const encontrado = lista.find((n) => n.id === pep.catNivelRiesgoId);
    if (!encontrado) return String(pep.catNivelRiesgoId);
    return `${encontrado.nivelRiesgoDescripcion} (${encontrado.nivelRiesgoValor})`;
  }, [niveles, pep.catNivelRiesgoId]);

  return (
    <div className={`flex flex-col gap-4 p-4 ${card}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Detalle del PEP: {pep.nombre}
        </h3>
        <Button onClick={onEditar}>Editar PEP</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Clave</span>
          <span className="font-mono text-sm font-semibold text-foreground">{pep.id}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Nombre</span>
          <span className="text-sm font-medium text-foreground">{pep.nombre}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Tipo de PEP</span>
          <span className="text-sm text-foreground">
            {ETIQUETAS_TIPO_PEP[pep.tipoPep] ?? pep.tipoPep}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Nivel de riesgo</span>
          <span className="text-sm font-semibold text-foreground">{nivel}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Estatus</span>
          <span className="self-start">
            <Badge tono={pep.estatus === "A" ? "activo" : "inactivo"}>
              {pep.estatus === "A" ? "Activo" : pep.estatus === "B" ? "Baja" : "Inactivo"}
            </Badge>
          </span>
        </div>
      </div>
    </div>
  );
}
