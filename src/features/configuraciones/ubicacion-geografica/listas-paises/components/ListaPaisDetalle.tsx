import { Badge } from "@/shared/components/ui/CatalogoBadge";
import { Button } from "@/shared/components/ui/CatalogoButton";
import { card } from "@/shared/components/ui/styles";

import type { ListaPaisResponse } from "../types/listaPais";

interface ListaPaisDetalleProps {
  lista: ListaPaisResponse;
  onEditar: () => void;
}

/**
 * Panel de solo lectura de la lista seleccionada. Mismo patrón que
 * `PaisDetalle`: al hacer clic en un renglón se muestran los datos sin poder
 * modificarlos, y el botón de editar es el que abre el formulario.
 */
export function ListaPaisDetalle({ lista, onEditar }: ListaPaisDetalleProps) {
  return (
    <div className={`flex flex-col gap-4 p-4 ${card}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Detalle de la lista: {lista.nombre}
        </h3>
        <Button onClick={onEditar}>Editar lista</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Clave</span>
          <span className="font-mono text-sm font-semibold text-foreground">{lista.id}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Nombre</span>
          <span className="text-sm font-medium text-foreground">{lista.nombre}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Nivel de riesgo</span>
          <span className="text-sm font-semibold text-foreground">
            {lista.nivelRiesgoDescripcion
              ? `${lista.nivelRiesgoDescripcion} (${lista.nivelRiesgoValor})`
              : "—"}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Estatus</span>
          <span className="self-start">
            <Badge tono={lista.estatus === "A" ? "activo" : "inactivo"}>
              {lista.estatus === "A" ? "Activa" : "Inactiva"}
            </Badge>
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-0.5 border-t border-border pt-3">
        <span className="text-xs font-medium text-muted-foreground">Países asignados</span>
        <span className="text-sm font-semibold text-foreground">
          {lista.totalPaisesAsignados}
        </span>
      </div>
    </div>
  );
}
