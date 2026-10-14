import { useEffect, useRef, useState } from "react";
import { Button } from "@/shared/components/atoms/Button";
import { StatusBadge } from "@/shared/components/atoms/StatusBadge";
import { Card } from "@/shared/components/molecules";
import { CatalogoPageTemplate } from "@/shared/components/templates/CatalogoPageTemplate";
import {
  useConfiguracionActiva,
  useVersionMatriz,
} from "@/features/configuraciones/matriz-riesgo/hooks/useMatrizRiesgo";
import { MatrizRiesgoDetalle } from "@/features/configuraciones/matriz-riesgo/components/MatrizRiesgoDetalle";
import { MatrizRiesgoForm } from "@/features/configuraciones/matriz-riesgo/components/MatrizRiesgoForm";
import { VersionesMatrizTable } from "@/features/configuraciones/matriz-riesgo/components/VersionesMatrizTable";

export function MatrizRiesgoPage() {
  const { data: activa, isLoading, isError } = useConfiguracionActiva();
  const [editando, setEditando] = useState(false);
  const [versionSeleccionada, setVersionSeleccionada] = useState<number | null>(null);
  const { data: detalleVersion } = useVersionMatriz(versionSeleccionada);
  const detalleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (versionSeleccionada !== null) {
      detalleRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [versionSeleccionada]);

  const esVersionActivaSeleccionada =
    versionSeleccionada !== null &&
    (detalleVersion?.activa || (activa?.id !== undefined && versionSeleccionada === activa.id));

  return (
    <CatalogoPageTemplate
      titulo="Matriz de riesgo"
      descripcion="Consulta la versión vigente de factores y subfactores de riesgo, y publica nuevas versiones cuando los pesos deban actualizarse."
      moduloFooter="Configuración de Matriz de Riesgo"
      acciones={
        <>
          {activa && !editando && (
            <Button onClick={() => setEditando(true)}>
              Publicar nueva versión
            </Button>
          )}
          {editando && (
            <Button variant="outline" onClick={() => setEditando(false)}>
              Cancelar edición
            </Button>
          )}
        </>
      }
    >
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-foreground">
              {editando ? "Editar ponderaciones y publicar nueva versión" : "Versión vigente"}
            </h3>
            {activa && !editando && (
              <StatusBadge tono="activo">
                v{activa.version ?? activa.id} · Activa
              </StatusBadge>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {isLoading && <p className="text-muted-foreground text-sm">Cargando matriz…</p>}
          {isError && (
            <p className="text-destructive text-sm">
              No se pudo cargar la matriz activa.
            </p>
          )}
          {activa && !editando && (
            <MatrizRiesgoDetalle factores={activa.factores ?? []} />
          )}
          {activa && editando && (
            <MatrizRiesgoForm base={activa} onSuccess={() => setEditando(false)} />
          )}
        </div>
      </Card>

      <Card>
        <div className="border-b border-border p-4 sm:p-6">
          <h3 className="text-base font-semibold text-foreground">
            Historial de versiones
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Haz clic en una versión o en &quot;Ver detalle&quot; para consultar sus ponderaciones y subfactores históricos.
          </p>
        </div>
        <div className="p-4 sm:p-6">
          <VersionesMatrizTable
            onVerDetalle={setVersionSeleccionada}
            seleccionadaId={versionSeleccionada}
          />
        </div>
      </Card>

      {versionSeleccionada !== null && (
        <Card ref={detalleRef}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold text-foreground">
                Detalle de la versión #{versionSeleccionada}
              </h3>
              {esVersionActivaSeleccionada ? (
                <StatusBadge tono="activo">Versión activa</StatusBadge>
              ) : (
                <StatusBadge tono="inactivo">Versión histórica (Solo lectura)</StatusBadge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVersionSeleccionada(null)}
            >
              Cerrar detalle
            </Button>
          </div>
          <div className="p-4 sm:p-6">
            {detalleVersion ? (
              <MatrizRiesgoDetalle factores={detalleVersion.factores ?? []} />
            ) : (
              <p className="text-muted-foreground text-sm">Cargando detalle de la versión…</p>
            )}
          </div>
        </Card>
      )}
    </CatalogoPageTemplate>
  );
}
