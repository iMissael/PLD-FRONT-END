import type { ReactNode } from "react";
import {
  AlertTriangle,
  ClipboardList,
  Download,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/cn";
import { BuscadorSocios } from "@/features/operacion/evaluacion-riesgo/components/BuscadorSocios";
import {
  EncabezadoDesglose,
  TarjetaFactor,
} from "@/features/operacion/evaluacion-riesgo/components/DesgloseFactores";
import { ExpedienteClienteAside } from "@/features/operacion/evaluacion-riesgo/components/ExpedienteCliente";
import type { EstadoEvaluacionAutomatica } from "@/features/operacion/evaluacion-riesgo/hooks/useEvaluacionAutomatica";
import type { ClienteMatrizRiesgo } from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgo";
import type { EvaluacionRiesgoResultado } from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgo";
import type { DetallesSubfactor } from "@/features/operacion/evaluacion-riesgo/utils/detalleSubfactor";
import { nivelPorDescripcion, nivelPorValorEntero } from "@/features/operacion/evaluacion-riesgo/utils/nivelRiesgo";
import type { SocioExterno } from "@/features/socios/types/socios";

/**
 * Tablero "Matriz de Riesgo Integral": encabezado con búsqueda de socios, expediente
 * del cliente a la izquierda y matriz de factores a la derecha. Adaptado con tokens semánticos
 * para soporte completo de modo claro y oscuro.
 */

export interface EvaluacionMostrada {
  resultado: EvaluacionRiesgoResultado;
  detalles: DetallesSubfactor;
}

function numero(valor: number | undefined, decimales = 2) {
  return valor === undefined ? "—" : valor.toFixed(decimales);
}

function TarjetaEstado({
  icono: Icono,
  tono = "acento",
  titulo,
  descripcion,
  children,
}: {
  icono: typeof Search;
  tono?: "acento" | "error";
  titulo: string;
  descripcion: string;
  children?: ReactNode;
}) {
  return (
    <div
      role={tono === "error" ? "alert" : "status"}
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-20 text-center"
    >
      <span
        className={cn(
          "flex size-12 items-center justify-center rounded-full",
          tono === "error"
            ? "bg-destructive/10 text-destructive"
            : "bg-primary/10 text-primary",
        )}
      >
        <Icono
          className={cn("size-6", Icono === Loader2 && "animate-spin")}
          strokeWidth={1.75}
        />
      </span>
      <div className="max-w-md space-y-1">
        <p className="font-semibold text-foreground">{titulo}</p>
        <p className="text-sm text-muted-foreground">{descripcion}</p>
      </div>
      {children}
    </div>
  );
}

function EstadoSinEvaluacion({
  estado,
  cliente,
  onEvaluar,
  onReintentar,
}: {
  estado: EstadoEvaluacionAutomatica;
  cliente: ClienteMatrizRiesgo | null;
  onEvaluar: () => void;
  onReintentar: () => void;
}) {
  if (estado.tipo === "evaluando") {
    return (
      <TarjetaEstado
        icono={Loader2}
        titulo={`Evaluando el riesgo de ${cliente?.nombre ?? "el socio"}…`}
        descripcion="Se calcula con los datos del socio y su crédito solicitado."
      />
    );
  }

  if (estado.tipo === "incompleto") {
    return (
      <TarjetaEstado
        icono={ClipboardList}
        titulo="Faltan datos para evaluar automáticamente"
        descripcion={`Completa en el formulario: ${estado.faltantes.join(", ")}.`}
      >
        <Button onClick={onEvaluar}>Completar y evaluar</Button>
      </TarjetaEstado>
    );
  }

  if (estado.tipo === "error") {
    return (
      <TarjetaEstado
        icono={AlertTriangle}
        tono="error"
        titulo="No se pudo evaluar al socio"
        descripcion={estado.mensaje}
      >
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={onReintentar}>
            <RefreshCw className="size-4" />
            Reintentar
          </Button>
          <Button variant="outline" onClick={onEvaluar}>
            Abrir formulario
          </Button>
        </div>
      </TarjetaEstado>
    );
  }

  const hayCliente = Boolean(cliente);
  return (
    <TarjetaEstado
      icono={hayCliente ? ClipboardList : Search}
      titulo={
        hayCliente
          ? "Este socio aún no tiene una evaluación en esta sesión"
          : "Busca un socio con la lupa"
      }
      descripcion={
        hayCliente
          ? "Evalúa su riesgo para calcular su matriz."
          : "Elige a un socio y su evaluación de riesgo se calcula al instante."
      }
    >
      {hayCliente && <Button onClick={onEvaluar}>Evaluar riesgo</Button>}
    </TarjetaEstado>
  );
}

export function MatrizRiesgoDashboard({
  cliente,
  cargandoSocio,
  errorSocio,
  evaluacion,
  estadoEvaluacion,
  onSeleccionarSocio,
  onEvaluar,
  onReintentar,
  onReevaluar,
}: {
  cliente: ClienteMatrizRiesgo | null;
  cargandoSocio: boolean;
  errorSocio: boolean;
  evaluacion: EvaluacionMostrada | null;
  estadoEvaluacion: EstadoEvaluacionAutomatica;
  onSeleccionarSocio: (socio: SocioExterno) => void;
  /** Abre el formulario de evaluación (con los datos del socio ya cargados). */
  onEvaluar: () => void;
  onReintentar: () => void;
  /** Vuelve a evaluar al socio mostrado con sus datos actuales, sin abrir el formulario. */
  onReevaluar: () => void;
}) {
  const resultado = evaluacion?.resultado;
  // "Riesgo determinado" (en la matriz) siempre es el calculado; "Nivel asignado" (encabezado)
  // es el que de verdad cuenta para el expediente: el manual si el oficial lo modificó.
  const nivelGeneral = nivelPorValorEntero(resultado?.nivel_riesgo?.valor);
  const etiquetaGeneral =
    resultado?.nivel_riesgo?.descripcion?.replaceAll("_", " ") ??
    nivelGeneral?.label ??
    "—";
  const nivelAsignado = resultado?.nivel_riesgo_manual
    ? nivelPorDescripcion(resultado.nivel_riesgo_manual)
    : nivelGeneral;
  const etiquetaAsignada = resultado?.nivel_riesgo_manual
    ? resultado.nivel_riesgo_manual.replaceAll("_", " ")
    : etiquetaGeneral;
  const rfcEncabezado = cliente && cliente.rfc !== "—" ? cliente.rfc : "";

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-t-lg border-b border-border bg-card px-5 py-3 text-foreground">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight text-foreground">
                Matriz de Riesgo Integral
              </h2>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-primary">
                PLD / FT
              </span>
            </div>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Módulo de Prevención y Cumplimiento Regulatorio
            </p>
          </div>
        </div>

        <BuscadorSocios
          variante="encabezado"
          valor={rfcEncabezado}
          placeholder="Buscar por nombre, referencia o RFC…"
          onSeleccionar={onSeleccionarSocio}
          className="mx-2 hidden max-w-md min-w-[220px] flex-1 md:block"
        />

        <div className="flex items-center gap-3">
          {evaluacion && (
            <div className="flex items-center rounded-lg border border-border bg-muted/40 px-3 py-1">
              <div className="mr-2">
                <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Nivel asignado
                </span>
                <span className="text-xs font-semibold text-foreground">
                  Score: {numero(resultado?.puntuacion_total)}
                </span>
              </div>
              <span
                className={cn(
                  "rounded px-2 py-0.5 text-xs font-bold tracking-wide uppercase",
                  nivelAsignado?.solido ?? "bg-gray-400 text-white",
                )}
              >
                {etiquetaAsignada}
              </span>
            </div>
          )}
          {evaluacion && cliente && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReevaluar}
              className="h-8 gap-1.5 text-xs"
            >
              <RefreshCw className="size-3.5 text-muted-foreground" />
              Volver a evaluar
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            disabled={!evaluacion}
            className="h-8 gap-1.5 text-xs"
          >
            <Download className="size-3.5 text-muted-foreground" />
            Exportar
          </Button>
          <Button
            size="sm"
            onClick={onEvaluar}
            className="h-8 gap-1.5 text-xs"
          >
            <Plus className="size-3.5" />
            Nueva evaluación
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <ExpedienteClienteAside
          cliente={cliente}
          cargando={cargandoSocio}
          error={errorSocio}
          valorBuscador={cliente?.referencia ?? ""}
          onSeleccionarSocio={onSeleccionarSocio}
        />

        <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-muted/10 lg:rounded-br-lg">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-card px-6 py-4">
            <div className="min-w-[260px] flex-1">
              <h3 className="flex flex-wrap items-baseline gap-2 text-base font-bold tracking-tight text-foreground">
                Matriz de Factores y Ponderación de Riesgo
                <span className="text-xs font-normal text-muted-foreground">
                  (Metodología EBR / CNBV)
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Evaluación cuantitativa y cualitativa de mitigantes y riesgos inherentes.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-6 divide-x divide-border text-xs">
              <div className="text-right">
                <span className="block text-[11px] font-semibold text-muted-foreground uppercase">
                  Valor total calculado
                </span>
                <span className="text-xl font-extrabold text-foreground">
                  {numero(resultado?.puntuacion_total)}
                </span>
              </div>
              <div className="pl-6 text-right">
                <span className="block text-[11px] font-semibold text-muted-foreground uppercase">
                  Riesgo determinado
                </span>
                {nivelGeneral ? (
                  <span
                    className={cn(
                      "mt-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-bold uppercase",
                      nivelGeneral.suave,
                    )}
                  >
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        nivelGeneral.solido.split(" ")[0],
                      )}
                    />
                    {etiquetaGeneral}
                  </span>
                ) : (
                  <span className="text-xl font-extrabold text-muted-foreground/40">—</span>
                )}
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
            {evaluacion ? (
              <>
                <EncabezadoDesglose />
                {resultado?.desglose?.factores?.map((factor, i) => (
                  <TarjetaFactor
                    key={`${factor.descripcionFactor}-${i}`}
                    factor={factor}
                    indice={i}
                    detalles={evaluacion.detalles}
                  />
                ))}
              </>
            ) : (
              <EstadoSinEvaluacion
                estado={estadoEvaluacion}
                cliente={cliente}
                onEvaluar={onEvaluar}
                onReintentar={onReintentar}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
