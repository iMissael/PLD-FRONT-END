import { Badge } from "@/shared/components/ui/CatalogoBadge";
import { Button } from "@/shared/components/ui/CatalogoButton";
import { card } from "@/shared/components/ui/styles";

import type { ZonaGeograficaResponse } from "../types/zonaGeografica";

interface ZonaDetalleProps {
  zona: ZonaGeograficaResponse;
  onEditar: () => void;
}

/**
 * Panel de solo lectura de la zona seleccionada. Mismo patrón que
 * `PaisDetalle`: al hacer clic en un renglón se muestran los datos sin poder
 * modificarlos, y el botón de editar es el que abre el formulario.
 */
export function ZonaDetalle({ zona, onEditar }: ZonaDetalleProps) {
  return (
    <div className={`flex flex-col gap-4 p-4 ${card}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Detalle de la zona: {zona.nombre}
        </h3>
        <Button onClick={onEditar}>Editar zona</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Clave</span>
          <span className="font-mono text-sm font-semibold text-foreground">{zona.id}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Nombre</span>
          <span className="text-sm font-medium text-foreground">{zona.nombre}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Nivel de riesgo</span>
          <span className="text-sm font-semibold text-foreground">
            {zona.nivelRiesgoDescripcion
              ? `${zona.nivelRiesgoDescripcion} (${zona.nivelRiesgoValor})`
              : "—"}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">
            Zona de entidades especiales
          </span>
          <span className="text-sm text-foreground">{zona.esEntidadEspecial ? "Sí" : "No"}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Estatus</span>
          <span className="self-start">
            <Badge tono={zona.estatus === "A" ? "activo" : "inactivo"}>
              {zona.estatus === "A" ? "Activa" : "Inactiva"}
            </Badge>
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-3">
        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">Entidades asignadas</span>
            <span className="text-sm font-semibold text-foreground">
              {Number(zona.totalEntidadesAsignadas ?? 0).toLocaleString("es-MX")}
            </span>
          </div>
        </div>
        
      </div>
    </div>
  );
}
