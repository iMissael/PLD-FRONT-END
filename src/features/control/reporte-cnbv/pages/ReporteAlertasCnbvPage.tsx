import { useMemo, useState } from "react";
import { Eraser, Eye } from "lucide-react";

import { Button } from "@/shared/components/atoms/Button";
import { Alert, Card } from "@/shared/components/molecules";
import { emptyState, hint, label } from "@/shared/styles/tokens";

import type { TipoReporteCnbv } from "../api/reporteCnbvApi";
import { AlertasPorReportarTable } from "../components/AlertasPorReportarTable";
import { PrevisualizacionReporteCnbvDialog } from "../components/PrevisualizacionReporteCnbvDialog";
import { useAlertasPorReportar } from "../hooks/useReporteCnbv";
import { filtrarPorReportado, reportadosDe } from "../utils/plazoReporte";

const TIPOS: { valor: TipoReporteCnbv; etiqueta: string }[] = [
  { valor: "IP", etiqueta: "Interna Preocupante" },
  { valor: "I", etiqueta: "Inusual" },
  { valor: "R", etiqueta: "Relevante" },
];

const MESES = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
];

const selectStyle =
  "border-border bg-card text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-xl border px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50";

export function ReporteAlertasCnbvPage() {
  const [tipo, setTipo] = useState<TipoReporteCnbv>("I");
  const [acreditado, setAcreditado] = useState("");
  const [empleado, setEmpleado] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [alertaPrevisualizada, setAlertaPrevisualizada] = useState<number | null>(null);
  const { data, isLoading, isError } = useAlertasPorReportar(tipo);

  const alertas = useMemo(() => data ?? [], [data]);
  const acreditados = useMemo(() => reportadosDe(alertas, "SOCIO"), [alertas]);
  const empleados = useMemo(() => reportadosDe(alertas, "EMPLEADO"), [alertas]);
  const visibles = filtrarPorReportado(alertas, acreditado, empleado);
  const esRelevante = tipo === "R";

  const limpiar = () => {
    setAcreditado("");
    setEmpleado("");
    setMostrar(false);
  };

  const cambiarTipo = (nuevo: TipoReporteCnbv) => {
    setTipo(nuevo);
    limpiar();
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold">Reporte de alertas CNBV</h2>
        <p className="text-muted-foreground text-sm">
          Alertas confirmadas que hay que reportar a la CNBV dentro de sus días hábiles.
        </p>
      </div>

      <Card className="gap-5 px-6">
        <div
          className="flex flex-wrap gap-6"
          role="radiogroup"
          aria-label="Tipo de reporte"
        >
          {TIPOS.map((t) => (
            <label
              key={t.valor}
              className="text-foreground flex cursor-pointer items-center gap-2 text-sm font-medium"
            >
              <input
                type="radio"
                name="tipo-reporte"
                checked={tipo === t.valor}
                onChange={() => cambiarTipo(t.valor)}
                className="accent-primary h-4 w-4 cursor-pointer"
              />
              {t.etiqueta}
            </label>
          ))}
        </div>

        {esRelevante ? (
          <div className="flex flex-col gap-2">
            <p className="text-foreground text-sm font-semibold">
              ALERTAS RELEVANTES PERIODO {MESES[new Date().getMonth()]}
            </p>
            <p className={hint}>
              El reporte trimestral de relevantes se habilita en la siguiente etapa, con
              su ventana de días configurada en Parámetros de alertas.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="filtro-acreditado" className={label}>
                Cliente
              </label>
              <select
                id="filtro-acreditado"
                value={acreditado}
                onChange={(e) => {
                  setAcreditado(e.target.value);
                  setMostrar(false);
                }}
                disabled={acreditados.length === 0}
                className={selectStyle}
              >
                <option value="">Todos</option>
                {acreditados.map((a) => (
                  <option key={a.referencia} value={a.referencia}>
                    {a.referencia} · {a.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="filtro-empleado" className={label}>
                Empleado
              </label>
              <select
                id="filtro-empleado"
                value={empleado}
                onChange={(e) => {
                  setEmpleado(e.target.value);
                  setMostrar(false);
                }}
                disabled={empleados.length === 0}
                className={selectStyle}
              >
                <option value="">Todos</option>
                {empleados.map((e) => (
                  <option key={e.referencia} value={e.referencia}>
                    {e.referencia} · {e.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={limpiar}
            disabled={esRelevante}
            aria-label="Limpiar filtros"
            title="Limpiar filtros"
            className="size-11 rounded-full p-0"
          >
            <Eraser className="size-5" />
          </Button>
          <Button
            type="button"
            onClick={() => setMostrar(true)}
            disabled={esRelevante || isLoading || alertas.length === 0}
            aria-label="Ver alertas por reportar"
            title="Ver alertas por reportar"
            className="size-11 rounded-full p-0"
          >
            <Eye className="size-5" />
          </Button>
        </div>
      </Card>

      {isError ? <Alert>No se pudieron cargar las alertas por reportar.</Alert> : null}
      {!esRelevante && !isLoading && !isError && alertas.length === 0 ? (
        <div className={emptyState}>No hay alertas por reportar.</div>
      ) : null}
      {mostrar && !esRelevante ? (
        <AlertasPorReportarTable alertas={visibles} onPrevisualizar={setAlertaPrevisualizada} />
      ) : null}

      <PrevisualizacionReporteCnbvDialog
        alertaId={alertaPrevisualizada}
        onOpenChange={(abierto) => !abierto && setAlertaPrevisualizada(null)}
      />
    </div>
  );
}
