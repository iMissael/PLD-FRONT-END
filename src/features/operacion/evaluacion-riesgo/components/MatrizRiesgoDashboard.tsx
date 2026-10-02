import { useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clipboard,
  ClipboardList,
  Copy,
  Download,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/utils/cn";
import { BuscadorSocios } from "@/features/operacion/evaluacion-riesgo/components/BuscadorSocios";
import type { EstadoEvaluacionAutomatica } from "@/features/operacion/evaluacion-riesgo/hooks/useEvaluacionAutomatica";
import type { ClienteMatrizRiesgo } from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgo";
import type {
  EvaluacionRiesgoResultado,
  PuntajeFactor,
} from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgo";
import {
  claveSubfactor,
  etiquetaFactor,
  etiquetaSubfactor,
  type DetallesSubfactor,
} from "@/features/operacion/evaluacion-riesgo/utils/detalleSubfactor";
import {
  nivelDesdePromedio,
  nivelPorDescripcion,
  nivelPorValorEntero,
  type NivelRiesgoInfo,
} from "@/features/operacion/evaluacion-riesgo/utils/nivelRiesgo";
import type { SocioExterno } from "@/features/socios/types/socios";

/**
 * Tablero "Matriz de Riesgo Integral" (formato de la captura de referencia): encabezado azul
 * marino con búsqueda de socios, expediente del cliente a la izquierda y matriz de factores
 * a la derecha. La lupa lista los socios del sistema; la matriz se muestra cuando el socio
 * elegido tiene una evaluación en esta sesión.
 */

export interface EvaluacionMostrada {
  resultado: EvaluacionRiesgoResultado;
  detalles: DetallesSubfactor;
}

const COLUMNAS = "md:grid-cols-[minmax(0,1fr)_92px_92px_92px_100px]";

function numero(valor: number | undefined, decimales = 2) {
  return valor === undefined ? "—" : valor.toFixed(decimales);
}

function copiar(texto: string) {
  navigator.clipboard?.writeText(texto).catch(() => {});
}

function etiquetaDeNivel(nivel: NivelRiesgoInfo | undefined) {
  return nivel ? nivel.label.replace(" ", "_").toUpperCase() : "—";
}

function NivelBadge({
  nivel,
  tamano = "fila",
}: {
  nivel: NivelRiesgoInfo | undefined;
  tamano?: "fila" | "factor";
}) {
  if (!nivel) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border font-bold",
        tamano === "fila" ? "px-2 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]",
        nivel.suave,
      )}
    >
      {etiquetaDeNivel(nivel)}
    </span>
  );
}

function CampoCopiable({
  etiqueta,
  valor,
  mono = false,
  icono: Icono = Copy,
}: {
  etiqueta: string;
  valor: string;
  mono?: boolean;
  icono?: typeof Copy;
}) {
  return (
    <div className="space-y-1">
      <p
        className={cn(
          "text-gray-500",
          mono
            ? "text-[11px] font-semibold tracking-wider uppercase"
            : "text-[11px] font-medium",
        )}
      >
        {etiqueta}
      </p>
      <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
        <span
          className={cn(
            "truncate text-foreground",
            mono ? "font-mono font-bold tracking-wider" : "font-bold",
          )}
        >
          {valor}
        </span>
        <button
          type="button"
          onClick={() => copiar(valor)}
          className="shrink-0 text-muted-foreground transition hover:text-primary"
          aria-label={`Copiar ${etiqueta}`}
        >
          <Icono className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function FilaSubfactor({
  descripcion,
  valor,
  ponderacion,
  puntaje,
  detalle,
}: {
  descripcion: string | undefined;
  valor: number | undefined;
  ponderacion: number | undefined;
  puntaje: number | undefined;
  detalle: string | undefined;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-1 px-4 py-2.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 md:items-center",
        COLUMNAS,
      )}
    >
      <div className="min-w-0">
        <span className="block truncate text-sm font-medium text-gray-900 dark:text-foreground">
          {etiquetaSubfactor(descripcion)}
        </span>
        <span
          className={cn(
            "block truncate text-[11px]",
            detalle ? "text-slate-500 dark:text-muted-foreground" : "font-medium text-amber-600 dark:text-amber-400",
          )}
        >
          {detalle ?? "Dato no capturado / encontrado"}
        </span>
      </div>
      <div className="font-semibold text-gray-700 dark:text-foreground md:text-center">{numero(valor, 1)}</div>
      <div className="font-mono text-gray-600 dark:text-muted-foreground md:text-center">
        {numero(ponderacion, 2)}%
      </div>
      <div className="md:text-center">
        <NivelBadge nivel={nivelPorValorEntero(valor)} />
      </div>
      <div className="font-mono font-bold text-gray-900 dark:text-foreground md:text-right">
        {numero(puntaje, 2)}
      </div>
    </div>
  );
}

function TarjetaFactor({
  factor,
  indice,
  detalles,
}: {
  factor: PuntajeFactor;
  indice: number;
  detalles: DetallesSubfactor;
}) {
  const esEnfoque = claveSubfactor(factor.descripcionFactor).includes("enfoque");
  const [abierto, setAbierto] = useState(!esEnfoque);
  const nivel = nivelDesdePromedio(factor.puntajeObtenido);
  // El punto de color de la categoría es su propio nivel de riesgo (verde/ámbar/rojo),
  // igual que en la matriz de referencia — no un color decorativo rotando por índice.
  const colorPunto = nivel?.solido.split(" ")[0] ?? "bg-gray-300";
  const ChevronFactor = abierto ? ChevronUp : ChevronDown;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border shadow-sm",
        esEnfoque
          ? "border-indigo-800 bg-indigo-900 text-white"
          : "border-gray-200 bg-white dark:border-border dark:bg-card dark:text-card-foreground",
      )}
    >
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className={cn(
          "flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left",
          !esEnfoque && "border-b border-gray-200 bg-slate-50/80 hover:bg-slate-50 dark:border-border dark:bg-slate-800/60 dark:hover:bg-slate-800",
        )}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <ChevronFactor
            className={cn(
              "size-4 shrink-0",
              esEnfoque ? "text-indigo-300" : "text-gray-400",
            )}
          />
          <span
            className={cn(
              "size-2 shrink-0 rounded-full",
              esEnfoque ? "bg-indigo-400" : colorPunto,
            )}
          />
          <span className="truncate text-sm font-bold">
            {indice + 1}. {etiquetaFactor(factor.descripcionFactor)}
          </span>
        </span>
        <span className="flex items-center gap-5 text-xs">
          <span className={esEnfoque ? "text-indigo-200" : "text-gray-500"}>
            <b className={esEnfoque ? "" : "text-gray-700"}>Valor:</b>{" "}
            {numero(factor.puntajeObtenido, 2)}
          </span>
          <span className={esEnfoque ? "text-indigo-200" : "text-gray-500"}>
            <b className={esEnfoque ? "" : "text-gray-700"}>Pond:</b>{" "}
            {numero(factor.pesoPorcentaje, 2)}%
          </span>
          <NivelBadge nivel={nivel} tamano="factor" />
          <span
            className={cn(
              "rounded px-2 py-1 font-mono font-bold",
              esEnfoque ? "bg-indigo-950/60 text-white" : "bg-muted text-foreground",
            )}
          >
            {numero(factor.scorePonderado ?? factor.puntajeObtenido, 2)}
          </span>
        </span>
      </button>

      {abierto && (
        <div
          className={cn(
            "divide-y text-xs",
            esEnfoque ? "bg-card text-foreground" : "divide-border",
          )}
        >
          {factor.subfactores?.map((sub, i) => (
            <FilaSubfactor
              key={`${sub.descripcion}-${i}`}
              descripcion={sub.descripcion}
              valor={sub.valor}
              ponderacion={sub.ponderacion}
              puntaje={sub.puntaje}
              detalle={detalles[claveSubfactor(sub.descripcion)]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ExpedienteDelCliente({ cliente }: { cliente: ClienteMatrizRiesgo }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          Nombre del titular
        </p>
        <div className="rounded-lg border border-border bg-muted/40 p-2.5 font-bold tracking-wide text-foreground uppercase">
          {cliente.nombre}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <CampoCopiable etiqueta="No. Cliente" valor={cliente.numero} />
        <CampoCopiable etiqueta="Referencia" valor={cliente.referencia} mono />
      </div>

      <CampoCopiable etiqueta="R.F.C." valor={cliente.rfc} mono icono={Clipboard} />
      <CampoCopiable etiqueta="C.U.R.P." valor={cliente.curp} mono icono={Clipboard} />

      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          Tipo de persona
        </p>
        <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-border bg-muted/40 p-1">
          {(["FISICA", "MORAL"] as const).map((tipo) => {
            const activo = cliente.persona === tipo;
            return (
              <div
                key={tipo}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs",
                  activo
                    ? "border border-border bg-card font-semibold text-primary shadow-xs"
                    : "font-medium text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "size-2 rounded-full",
                    activo ? "bg-primary" : "bg-muted-foreground/40",
                  )}
                />
                {tipo === "FISICA" ? "Física" : "Moral"}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          Tipo de cliente
        </p>
        <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 font-medium text-foreground uppercase">
          <span className="truncate">{cliente.tipoCliente}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 text-[11px]">
        <div>
          <p className="font-medium text-muted-foreground">Fecha de Alta</p>
          <p className="mt-0.5 flex items-center gap-1 font-semibold text-foreground">
            <Calendar className="size-3.5 text-muted-foreground" />
            {cliente.fechaAlta}
          </p>
        </div>
        <div>
          <p className="font-medium text-muted-foreground">Sucursal</p>
          <p className="mt-0.5 font-bold tracking-wide text-foreground uppercase">
            {cliente.sucursal}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-2.5 text-[10px] text-muted-foreground">
        <span>Última modificación:</span>
        <span className="font-mono font-semibold text-foreground">
          {cliente.fechaModificacion}
        </span>
      </div>
    </div>
  );
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
          tono === "error" ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400" : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400",
        )}
      >
        <Icono
          className={cn("size-6", Icono === Loader2 && "animate-spin")}
          strokeWidth={1.75}
        />
      </span>
      <div className="max-w-md space-y-1">
        <p className="font-semibold text-foreground">{titulo}</p>
        <p className="text-muted-foreground text-sm">{descripcion}</p>
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
            <RefreshCw />
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
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-t-lg bg-slate-900 px-5 py-3 text-white">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg border border-indigo-400/30 bg-indigo-500/20 text-indigo-300">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight">
                Matriz de Riesgo Integral
              </h2>
              <span className="rounded-full border border-indigo-400/30 bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-indigo-300">
                PLD / FT
              </span>
            </div>
            <p className="hidden text-xs text-slate-400 sm:block">
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
            <div className="flex items-center rounded-lg border border-white/20 bg-white/5 px-3 py-1">
              <div className="mr-2">
                <span className="block text-[10px] font-bold tracking-wider text-indigo-200 uppercase">
                  Nivel asignado
                </span>
                <span className="text-xs font-semibold">
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
            <button
              type="button"
              onClick={onReevaluar}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
            >
              <RefreshCw className="size-3.5 text-slate-400" />
              Volver a evaluar
            </button>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            disabled={!evaluacion}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="size-3.5 text-slate-400" />
            Exportar
          </button>
          <button
            type="button"
            onClick={onEvaluar}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
          >
            <Plus className="size-3.5" />
            Nueva evaluación
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="w-full shrink-0 overflow-y-auto border-b border-border bg-card lg:w-[300px] lg:rounded-bl-lg lg:border-r lg:border-b-0">
          <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 text-white">
            <span className="flex items-center gap-2 text-sm font-semibold tracking-wide">
              <span className="rounded bg-indigo-500/20 p-1 text-indigo-300">
                <User className="size-4" />
              </span>
              Expediente del Cliente
            </span>
            {cliente && (
              <span className="rounded border border-green-500/30 bg-green-500/20 px-2 py-0.5 text-[11px] font-semibold text-green-300">
                Activo
              </span>
            )}
          </div>

          <div className="space-y-4 p-4 text-xs">
            <div className="space-y-2 rounded-xl border border-gray-200 bg-slate-50 p-3 dark:border-border dark:bg-slate-900/60">
              <p className="text-[11px] font-semibold tracking-wider text-gray-500 dark:text-muted-foreground uppercase">
                Referencia / No. Cliente / Nombre
              </p>
              <BuscadorSocios
                variante="panel"
                valor={cliente?.referencia ?? ""}
                placeholder="Elige un socio…"
                onSeleccionar={onSeleccionarSocio}
              />
            </div>

            {cargandoSocio && (
              <div className="space-y-3" aria-label="Cargando expediente">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            )}
            {!cargandoSocio && errorSocio && (
              <p className="text-sm text-red-600">
                No se encontraron datos de este socio.
              </p>
            )}
            {!cargandoSocio && !errorSocio && cliente && (
              <ExpedienteDelCliente cliente={cliente} />
            )}
            {!cargandoSocio && !errorSocio && !cliente && (
              <p className="text-muted-foreground text-sm">
                Usa la lupa para ver los socios del sistema.
              </p>
            )}
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-slate-50 dark:bg-background lg:rounded-br-lg">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 py-4 dark:border-border dark:bg-card">
            <div className="min-w-[260px] flex-1">
              <h3 className="flex flex-wrap items-baseline gap-2 text-base font-bold tracking-tight text-gray-900 dark:text-foreground">
                Matriz de Factores y Ponderación de Riesgo
                <span className="text-xs font-normal text-gray-500 dark:text-muted-foreground">
                  (Metodología EBR / CNBV)
                </span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-muted-foreground">
                Evaluación cuantitativa y cualitativa de mitigantes y riesgos inherentes.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-6 divide-x divide-gray-200 dark:divide-border text-xs">
              <div className="text-right">
                <span className="block text-[11px] font-semibold text-gray-500 dark:text-muted-foreground uppercase">
                  Valor total calculated
                </span>
                <span className="text-xl font-extrabold text-gray-900 dark:text-foreground">
                  {numero(resultado?.puntuacion_total)}
                </span>
              </div>
              <div className="pl-6 text-right">
                <span className="block text-[11px] font-semibold text-gray-500 dark:text-muted-foreground uppercase">
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
                  <span className="text-xl font-extrabold text-gray-300 dark:text-gray-600">—</span>
                )}
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
            {evaluacion ? (
              <>
                <div
                  className={cn(
                    "hidden gap-2 rounded-lg bg-slate-200/60 dark:bg-slate-800/80 px-4 py-2 text-[11px] font-bold tracking-wider text-gray-500 dark:text-muted-foreground uppercase md:grid",
                    COLUMNAS,
                  )}
                >
                  <span>Criterio / Factor evaluado</span>
                  <span className="text-center">Valor / Calificación</span>
                  <span className="text-center">Ponderación</span>
                  <span className="text-center">Nivel riesgo</span>
                  <span className="text-right">Valor ponderado</span>
                </div>
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
