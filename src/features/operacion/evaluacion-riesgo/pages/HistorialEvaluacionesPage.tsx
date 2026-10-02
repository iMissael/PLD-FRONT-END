import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import { cn } from "@/shared/utils/cn";
import { ExpedienteClienteAside } from "@/features/operacion/evaluacion-riesgo/components/ExpedienteCliente";
import type { EvaluacionRiesgoResultado } from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgo";
import { useHistorialEvaluaciones } from "@/features/operacion/evaluacion-riesgo/hooks/useEvaluacionRiesgo";
import { clienteDesdePerfil } from "@/features/operacion/evaluacion-riesgo/utils/clienteDesdePerfil";
import { nivelPorDescripcion } from "@/features/operacion/evaluacion-riesgo/utils/nivelRiesgo";
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
 * "Historial de evaluaciones": cada vez que se evalúa a un socio queda una fila nueva en
 * evaluacion_riesgo_pld (no se sobreescribe), así que esta pantalla solo lista esas filas por
 * socio — a diferencia de "Evaluación de riesgo", que solo muestra/opera sobre la más reciente.
 * Formato igual al de "Matriz de Riesgo Integral": expediente del cliente a la izquierda,
 * tabla a la derecha.
 */
export function HistorialEvaluacionesPage() {
  const [socio, setSocio] = useState<{ id: string; nombre: string } | null>(null);
  const perfil = usePerfilSocio(socio?.id);
  const cliente = perfil.data ? clienteDesdePerfil(perfil.data) : null;
  const { data: historial, isLoading, isError } = useHistorialEvaluaciones(socio?.id ?? null);

  function seleccionarSocio(elegido: SocioExterno) {
    setSocio({ id: elegido.id ?? "", nombre: elegido.nombre ?? "" });
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
    <div className="flex h-full flex-col rounded-lg border border-border bg-card shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-t-lg bg-slate-900 px-5 py-3 text-white">
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
              Todas las evaluaciones registradas para un socio, de la más reciente a la más antigua.
            </p>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <ExpedienteClienteAside
          cliente={cliente}
          cargando={Boolean(socio) && perfil.isPending}
          error={Boolean(socio) && perfil.isError}
          valorBuscador={cliente?.referencia ?? socio?.nombre ?? ""}
          onSeleccionarSocio={seleccionarSocio}
        />

        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-auto bg-slate-50 dark:bg-background lg:rounded-br-lg">
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
  );
}
