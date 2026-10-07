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
<<<<<<< HEAD
  nombresListas: string[];
=======
  listas: ItemListaDetalle[];
  nivelRiesgo?: { nivelRiesgoDescripcion: string; nivelRiesgoValor: number } | null;
>>>>>>> origin/develop
  onEditar: () => void;
}

/**
<<<<<<< HEAD
 * Panel de detalle de un país seleccionado, replicando el bloque inferior
 * de la pantalla legacy "Configuración de Países" (Clave / País / Zona +
 * botón de edición). Es de solo lectura; la edición completa (incluyendo
 * tipo, nacionalidad, código ISO y las listas de riesgo) se hace en `PaisForm`, que se
 * abre con el botón de lápiz.
 *
 * Usa el ámbar de la guía (`warning`) porque es un panel de atención: marca
 * el registro sobre el que se va a actuar, no un estado normal de lectura.
 */
export function PaisDetalle({ pais, nombresListas, onEditar }: PaisDetalleProps) {
  const etiqueta = "w-16 shrink-0 text-sm font-medium text-warning";
  const valor =
    "flex-1 rounded-md border border-warning/40 bg-card px-3 py-1.5 text-sm text-foreground";

=======
 * Panel de detalle estandarizado de un país seleccionado con su nivel de riesgo único y sus listas asignadas.
 */
export function PaisDetalle({ pais, listas, nivelRiesgo, onEditar }: PaisDetalleProps) {
>>>>>>> origin/develop
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

<<<<<<< HEAD
      <div className="flex items-center gap-2">
        <span className={etiqueta}>Listas de riesgo</span>
        <span className={valor}>
          {nombresListas.length > 0 ? nombresListas.join(", ") : "En ninguna lista"}
=======
      <div className="flex flex-col gap-1.5 border-t border-border pt-3">
        <span className="text-xs font-medium text-muted-foreground">
          Listas de riesgo asignadas
>>>>>>> origin/develop
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
