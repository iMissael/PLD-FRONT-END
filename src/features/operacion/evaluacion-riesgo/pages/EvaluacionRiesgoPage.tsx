import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { useEvaluacionAutomatica } from "@/features/operacion/evaluacion-riesgo/hooks/useEvaluacionAutomatica";
import { EvaluacionRiesgoForm } from "@/features/operacion/evaluacion-riesgo/components/EvaluacionRiesgoForm";
import { MatrizRiesgoDashboard } from "@/features/operacion/evaluacion-riesgo/components/MatrizRiesgoDashboard";
import { PanelModificacionRiesgo } from "@/features/operacion/evaluacion-riesgo/components/PanelModificacionRiesgo";
import type { ClienteMatrizRiesgo } from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgo";
import {
  claveEvaluacion,
  evaluacionVigente,
  useEvaluacionesSesionStore,
} from "@/features/operacion/evaluacion-riesgo/stores/evaluacionesSesionStore";
import type { EvaluacionRiesgoResultado } from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgo";
import { clienteDesdePerfil } from "@/features/operacion/evaluacion-riesgo/utils/clienteDesdePerfil";
import type { DetallesSubfactor } from "@/features/operacion/evaluacion-riesgo/utils/detalleSubfactor";
import { useConfiguracionActiva } from "@/features/configuraciones/matriz-riesgo/hooks/useMatrizRiesgo";
import { usePerfilSocio } from "@/features/socios/hooks/useSocios";
import type { SocioExterno } from "@/features/socios/types/socios";

export function EvaluacionRiesgoPage() {
  const [socio, setSocio] = useState<{ id: string; nombre: string } | null>(null);
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  // Socio al que se pidió "Volver a evaluar": se evalúa de nuevo aunque ya tenga una evaluación.
  const [reevaluando, setReevaluando] = useState<string | null>(null);

  const evaluacionRecordada = useEvaluacionesSesionStore((estado) =>
    socio ? estado.evaluaciones[claveEvaluacion(socio.id)] : undefined,
  );
  // Si se publicó otra versión de la matriz, la evaluación recordada ya no cuenta.
  const matrizActiva = useConfiguracionActiva();
  const evaluacionGuardada = evaluacionVigente(evaluacionRecordada, matrizActiva.data?.id);
  // Sin evaluación vigente en la sesión (o si se pide otra), se consulta su perfil y se evalúa solo.
  const debeEvaluar = !evaluacionGuardada || reevaluando === socio?.id;
  const perfil = usePerfilSocio(debeEvaluar ? socio?.id : undefined);
  const { estado: estadoEvaluacion, reintentar } = useEvaluacionAutomatica({
    socio,
    perfil: perfil.data,
    habilitada: debeEvaluar,
    onResultado: alTerminarEvaluacion,
  });

  const cliente =
    evaluacionGuardada?.cliente ?? (perfil.data ? clienteDesdePerfil(perfil.data) : null);

  function seleccionarSocio(elegido: SocioExterno) {
    setSocio({ id: elegido.id ?? "", nombre: elegido.nombre ?? "" });
  }

  function alTerminarEvaluacion(
    resultado: EvaluacionRiesgoResultado,
    clienteEvaluado: ClienteMatrizRiesgo,
    detalles: DetallesSubfactor,
  ) {
    useEvaluacionesSesionStore.getState().guardar(clienteEvaluado.referencia, {
      resultado,
      cliente: clienteEvaluado,
      detalles,
    });
    setSocio({ id: clienteEvaluado.referencia, nombre: clienteEvaluado.nombre });
    setReevaluando(null);
    setFormularioAbierto(false);
  }

  function reevaluarSocio() {
    if (!socio) return;
    setReevaluando(socio.id);
    reintentar();
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="min-h-0 flex-1">
        <MatrizRiesgoDashboard
          cliente={cliente}
          cargandoSocio={Boolean(socio) && debeEvaluar && perfil.isPending}
          errorSocio={Boolean(socio) && debeEvaluar && perfil.isError}
          evaluacion={evaluacionGuardada ?? null}
          estadoEvaluacion={estadoEvaluacion}
          onSeleccionarSocio={seleccionarSocio}
          onEvaluar={() => setFormularioAbierto(true)}
          onReintentar={reintentar}
          onReevaluar={reevaluarSocio}
        />
      </div>

      <Card className="shrink-0">
        <CardHeader>
          <CardTitle>Modificación de riesgo</CardTitle>
        </CardHeader>
        <CardContent>
          {evaluacionGuardada && cliente ? (
            <PanelModificacionRiesgo evaluacion={evaluacionGuardada} cliente={cliente} />
          ) : (
            <p className="text-muted-foreground text-sm">
              Elige y evalúa a un socio para poder modificar su nivel de riesgo.
            </p>
          )}
        </CardContent>
      </Card>

      <Sheet open={formularioAbierto} onOpenChange={setFormularioAbierto}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
          <SheetHeader>
            <SheetTitle>Evaluar riesgo</SheetTitle>
            <SheetDescription>
              Los datos del socio y de su crédito se cargan al elegirlo; revisa y ajusta
              lo que haga falta.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            <EvaluacionRiesgoForm
              socioInicial={socio ?? undefined}
              onResultado={alTerminarEvaluacion}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
