import { useEffect, useMemo, useRef, useState } from "react";
import { ShieldCheck, X } from "lucide-react";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import { cn } from "@/shared/utils/cn";
import {
  EncabezadoDesglose,
  NivelBadge as NivelBadgeFactor,
  TarjetaFactor,
} from "@/features/operacion/evaluacion-riesgo/components/DesgloseFactores";
import { ExpedienteClienteAside } from "@/features/operacion/evaluacion-riesgo/components/ExpedienteCliente";
import type { EvaluacionRiesgoResultado } from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgo";
import { useHistorialEvaluaciones } from "@/features/operacion/evaluacion-riesgo/hooks/useEvaluacionRiesgo";
import { clienteDesdePerfil } from "@/features/operacion/evaluacion-riesgo/utils/clienteDesdePerfil";
import { nivelPorDescripcion, nivelPorValorEntero } from "@/features/operacion/evaluacion-riesgo/utils/nivelRiesgo";
import { usePerfilSocio } from "@/features/socios/hooks/useSocios";
import type { SocioExterno } from "@/features/socios/types/socios";

function numero(valor: number | undefined, decimales = 2) {
  return valor === undefined ? "—" : valor.toFixed(decimales);
}

function fechaParte(valor: string | undefined) {
  if (!valor) return "—";
  return new Date(valor).toLocaleDateString("es-MX", { dateStyle: "short" });
}

function horaParte(valor: string | undefined) {
  if (!valor) return "—";
  return new Date(valor).toLocaleTimeString("es-MX", { timeStyle: "medium" });
}

function NivelBadge({ etiqueta }: { etiqueta: string | undefined }) {
  if (!etiqueta) return <span className="text-muted-foreground text-xs">—</span>;
  const nivel = nivelPorDescripcion(etiqueta);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase",
        nivel?.suave ?? "border-border text-muted-foreground",
      )}
    >
      {etiqueta.replaceAll("_", " ")}
    </span>
  );
}

/**
 * Detalle de una evaluación del historial: la misma "Matriz de Factores y Ponderación de
 * Riesgo" que Evaluación de riesgo, pero sin la línea de detalle capturado por subfactor
 * (ese texto, p. ej. "CHIAPAS", no se persiste por evaluación — solo el desglose numérico).
 */
function DetalleEvaluacion({
  evaluacion,
  onCerrar,
}: {
  evaluacion: EvaluacionRiesgoResultado;
  onCerrar: () => void;
}) {
  const nivelCalculado = nivelPorValorEntero(evaluacion.nivel_riesgo?.valor);
  const etiquetaCalculada = evaluacion.nivel_riesgo?.descripcion?.replaceAll("_", " ") ?? nivelCalculado?.label ?? "—";

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4">
        <div>
          <h3 className="text-base font-bold tracking-tight text-foreground">
            Evaluación #{evaluacion.id_evaluacion} — {fechaParte(evaluacion.fecha_evaluacion)}{" "}
            {horaParte(evaluacion.fecha_evaluacion)}
          </h3>
          <p className="text-xs text-muted-foreground">
            Matriz de Factores y Ponderación de Riesgo de esta evaluación.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="block text-[11px] font-semibold text-muted-foreground uppercase">
              Total de riesgo
            </span>
            <span className="text-xl font-extrabold text-foreground">
              {numero(evaluacion.puntuacion_total)}
            </span>
          </div>
          <div className="text-right">
            <span className="block text-[11px] font-semibold text-muted-foreground uppercase">
              Descripción de riesgo
            </span>
            <span
              className={cn(
                "mt-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-bold uppercase",
                nivelCalculado?.suave ?? "border-border text-muted-foreground",
              )}
            >
              {etiquetaCalculada}
            </span>
          </div>
          {evaluacion.nivel_riesgo_manual && (
            <div className="text-right">
              <span className="block text-[11px] font-semibold text-muted-foreground uppercase">
                Nivel manual
              </span>
              <NivelBadgeFactor nivel={nivelPorDescripcion(evaluacion.nivel_riesgo_manual)} tamano="factor" />
            </div>
          )}
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar detalle"
            className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div className="space-y-5 p-6">
        {evaluacion.desglose?.factores?.length ? (
          <>
            <EncabezadoDesglose />
            {evaluacion.desglose.factores.map((factor, i) => (
              <TarjetaFactor key={`${factor.descripcionFactor}-${i}`} factor={factor} indice={i} />
            ))}
          </>
        ) : (
          <p className="text-muted-foreground text-sm">
            Esta evaluación no tiene un desglose de factores guardado.
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * "Historial de evaluaciones": cada vez que se evalúa a un socio queda una fila nueva en
 * evaluacion_riesgo_pld (no se sobreescribe), así que esta pantalla solo lista esas filas por
 * socio — a diferencia de "Evaluación de riesgo", que solo muestra/opera sobre la más reciente.
 * Al elegir una fila se ve, debajo, la matriz de factores de esa evaluación puntual.
 */
export function HistorialEvaluacionesPage() {
  const [socio, setSocio] = useState<{ id: string; nombre: string } | null>(null);
  const [seleccionada, setSeleccionada] = useState<EvaluacionRiesgoResultado | null>(null);
  const perfil = usePerfilSocio(socio?.id);
  const cliente = perfil.data ? clienteDesdePerfil(perfil.data) : null;
  const { data: historial, isLoading, isError } = useHistorialEvaluaciones(socio?.id ?? null);

  const detalleRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (seleccionada) {
      detalleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [seleccionada]);

  function seleccionarSocio(elegido: SocioExterno) {
    setSocio({ id: elegido.id ?? "", nombre: elegido.nombre ?? "" });
    setSeleccionada(null);
  }

  const columns: ColumnDef<EvaluacionRiesgoResultado>[] = useMemo(
    () => [
      {
        header: "#",
        width: "60px",
        className: "text-muted-foreground",
        cell: (item) => `#${item.id_evaluacion}`,
      },
      {
        header: "Fecha",
        cell: (item) => fechaParte(item.fecha_evaluacion),
        className: "text-muted-foreground",
      },
      {
        header: "Hora",
        cell: (item) => horaParte(item.fecha_evaluacion),
        className: "text-muted-foreground",
      },
      {
        header: "Riesgo",
        align: "right",
        cell: (item) => <span className="font-semibold tabular-nums">{numero(item.puntuacion_total)}</span>,
      },
      {
        header: "Descripción",
        cell: (item) => <NivelBadge etiqueta={item.nivel_riesgo?.descripcion} />,
      },
      {
        header: "Nivel manual",
        cell: (item) => <NivelBadge etiqueta={item.nivel_riesgo_manual} />,
      },
      {
        header: "Motivo",
        className: "text-muted-foreground max-w-sm truncate",
        cell: (item) => item.motivo ?? "—",
      },
    ],
    [],
  );

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto">
      <div className="flex min-h-[420px] shrink-0 flex-col rounded-lg border border-border bg-card shadow-sm lg:flex-row">
        <ExpedienteClienteAside
          cliente={cliente}
          cargando={Boolean(socio) && perfil.isPending}
          error={Boolean(socio) && perfil.isError}
          valorBuscador={cliente?.referencia ?? socio?.nombre ?? ""}
          onSeleccionarSocio={seleccionarSocio}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:rounded-br-lg">
          <header className="flex flex-wrap items-center justify-between gap-4 rounded-tr-lg bg-slate-900 px-5 py-3 text-white">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg border border-indigo-400/30 bg-indigo-500/20 text-indigo-300">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold tracking-tight">
                    Historial de Matriz de Riesgo de Cliente
                  </h2>
                  <span className="rounded-full border border-indigo-400/30 bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-indigo-300">
                    PLD / FT
                  </span>
                </div>
                <p className="hidden text-xs text-slate-400 sm:block">
                  Elige una evaluación para ver su matriz de factores completa.
                </p>
              </div>
            </div>
          </header>

          <section className="flex min-h-0 flex-1 flex-col overflow-x-auto bg-slate-50 dark:bg-background">
            {socio ? (
              <DataTable
                data={historial}
                columns={columns}
                isLoading={isLoading}
                loadingMessage="Cargando historial…"
                emptyMessage={
                  isError
                    ? "No se pudo cargar el historial de este socio."
                    : "Este socio no tiene evaluaciones registradas."
                }
                getRowId={(item) => item.id_evaluacion ?? 0}
                selectedRowId={seleccionada?.id_evaluacion ?? null}
                onRowClick={setSeleccionada}
                pagination={{ mode: "client", defaultRowsPerPage: 10, rowsPerPageOptions: [10, 25, 50] }}
              />
            ) : (
              <p className="text-muted-foreground p-6 text-sm">
                Usa la lupa para elegir un socio y ver su historial.
              </p>
            )}
          </section>
        </div>
      </div>

      {seleccionada && (
        <div ref={detalleRef} className="shrink-0 scroll-mt-4">
          <DetalleEvaluacion evaluacion={seleccionada} onCerrar={() => setSeleccionada(null)} />
        </div>
      )}
    </div>
  );
}
