import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { BuscarEvaluacionPorId } from "@/features/operacion/evaluacion-riesgo/components/BuscarEvaluacionPorId";
import { useEvaluacionAutomatica } from "@/features/operacion/evaluacion-riesgo/hooks/useEvaluacionAutomatica";
import { EvaluacionRiesgoForm } from "@/features/operacion/evaluacion-riesgo/components/EvaluacionRiesgoForm";
import { MatrizRiesgoDashboard } from "@/features/operacion/evaluacion-riesgo/components/MatrizRiesgoDashboard";
import type { ClienteMatrizRiesgo } from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgo";
import {
  claveEvaluacion,
  useEvaluacionesSesionStore,
} from "@/features/operacion/evaluacion-riesgo/stores/evaluacionesSesionStore";
import type { EvaluacionRiesgoResultado } from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgo";
import { clienteDesdePerfil } from "@/features/operacion/evaluacion-riesgo/utils/clienteDesdePerfil";
import type { DetallesSubfactor } from "@/features/operacion/evaluacion-riesgo/utils/detalleSubfactor";
import { usePerfilSocio } from "@/features/socios/hooks/useSocios";
import type { SocioExterno } from "@/features/socios/types/socios";

export function EvaluacionRiesgoPage() {
  const [socio, setSocio] = useState<{ id: string; nombre: string } | null>(null);
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  // Socio al que se pidió "Volver a evaluar": se evalúa de nuevo aunque ya tenga una evaluación.
  const [reevaluando, setReevaluando] = useState<string | null>(null);

  const evaluacionGuardada = useEvaluacionesSesionStore((estado) =>
    socio ? estado.evaluaciones[claveEvaluacion(socio.id)] : undefined,
  );
  // Sin evaluación en la sesión (o si se pide otra), se consulta su perfil y se evalúa solo.
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Evaluación de riesgo</h1>
          <p className="text-muted-foreground">
            Elige un socio y su evaluación se calcula al instante con sus datos y su
            crédito solicitado; o evalúa uno nuevo.
          </p>
        </div>
        <Button onClick={() => setFormularioAbierto(true)}>
          <Plus />
          Nueva evaluación
        </Button>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Consultar evaluación previa</CardTitle>
        </CardHeader>
        <CardContent>
          <BuscarEvaluacionPorId />
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
