import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Matriz de riesgo</h1>
        <p className="text-muted-foreground">
          Consulta la versión vigente de factores y subfactores de riesgo, y publica
          nuevas versiones cuando los pesos deban actualizarse.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Versión activa</CardTitle>
          {activa && !editando && (
            <Button size="sm" onClick={() => setEditando(true)}>
              Publicar nueva versión
            </Button>
          )}
          {editando && (
            <Button size="sm" variant="outline" onClick={() => setEditando(false)}>
              Cancelar
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-muted-foreground text-sm">Cargando matriz…</p>}
          {isError && (
            <p className="text-destructive text-sm">
              No se pudo cargar la matriz activa.
            </p>
          )}
          {activa && !editando && (
            <MatrizRiesgoDetalle factores={activa.pesosFactores ?? []} />
          )}
          {activa && editando && (
            <MatrizRiesgoForm base={activa} onSuccess={() => setEditando(false)} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de versiones</CardTitle>
        </CardHeader>
        <CardContent>
          <VersionesMatrizTable onVerDetalle={setVersionSeleccionada} />
        </CardContent>
      </Card>

      {versionSeleccionada !== null && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Detalle de la versión #{versionSeleccionada}</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setVersionSeleccionada(null)}
            >
              Cerrar
            </Button>
          </CardHeader>
          <CardContent>
            {detalleVersion ? (
              <MatrizRiesgoDetalle factores={detalleVersion.pesosFactores ?? []} />
            ) : (
              <p className="text-muted-foreground text-sm">Cargando detalle…</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
