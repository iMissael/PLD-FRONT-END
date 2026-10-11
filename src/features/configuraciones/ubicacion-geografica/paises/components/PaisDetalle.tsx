import { Button } from "@/shared/components/ui/CatalogoButton";
import { card } from "@/shared/components/ui/styles";
import type { PaisResponse } from "../types/pais";

export interface ItemListaDetalle {
  nombre: string;
  nivelRiesgoDescripcion?: string;
  nivelRiesgoValor?: number;
}

interface PaisDetalleProps {
  pais: PaisResponse;
  listas: ItemListaDetalle[];
  nivelRiesgo?: { nivelRiesgoDescripcion: string; nivelRiesgoValor: number } | null;
  onEditar: () => void;
}

/**
 * Panel de detalle estandarizado de un país seleccionado con su nivel de riesgo único y sus listas asignadas.
 */
export function PaisDetalle({ pais, listas, nivelRiesgo, onEditar }: PaisDetalleProps) {
  return (
    <div className={`flex flex-col gap-4 p-4 ${card}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Detalle del país: {pais.nombre}
        </h3>
        <Button onClick={onEditar}>Editar país</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Clave</span>
          <span className="font-mono text-sm font-semibold text-foreground">
            {pais.idPais}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Nombre</span>
          <span className="text-sm font-medium text-foreground">{pais.nombre}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Nacionalidad</span>
          <span className="text-sm text-foreground">{pais.nacionalidad || "—"}</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Código ISO</span>
          <span className="font-mono text-sm uppercase text-foreground">
            {pais.codigoIso || "—"}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">Nivel de riesgo</span>
          <span className="text-sm font-semibold text-foreground">
            {nivelRiesgo
              ? `${nivelRiesgo.nivelRiesgoDescripcion} (${nivelRiesgo.nivelRiesgoValor})`
              : "—"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 border-t border-border pt-3">
        <span className="text-xs font-medium text-muted-foreground">
          Listas de riesgo asignadas
        </span>
        {listas.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {listas.map((item) => (
              <span
                key={item.nombre}
                className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
              >
                <span className="font-semibold">{item.nombre}</span>
                {item.nivelRiesgoDescripcion ? (
                  <span className="text-muted-foreground">
                    ({item.nivelRiesgoDescripcion})
                  </span>
                ) : null}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Sin listas asignadas</span>
        )}
      </div>
    </div>
  );
}
