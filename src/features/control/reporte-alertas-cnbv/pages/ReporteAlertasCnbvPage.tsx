import { useMemo, useState } from "react";
import { BrushCleaning, Eye, Search } from "lucide-react";

import { useTiposAlerta } from "@/features/alertas/hooks/useAlertas";
import type { Alerta, ReportadoAlerta, TipoReportado } from "@/features/alertas/types/alertas";
import { formatearFecha } from "@/features/operacion/revision-alertas/utils/formato";
import { Button } from "@/shared/components/atoms/Button";
import { Card, CardContent } from "@/shared/components/molecules/Card";
import { cn } from "@/shared/utils/cn";
import { emptyState, label, table } from "@/shared/styles/tokens";

import {
  SelectorReportadoDialog,
  type ReportadoConAlertas,
} from "../components/SelectorReportadoDialog";
import { useAlertasReportadas } from "../hooks/useAlertasReportadas";

/** Los tipos que se reportan a la CNBV, en el orden de Sicanet. */
const TIPOS = [
  { acronimo: "IP", etiqueta: "Interna Preocupante" },
  { acronimo: "I", etiqueta: "Inusual" },
  { acronimo: "R", etiqueta: "Relevante" },
] as const;

type AcronimoReporte = (typeof TIPOS)[number]["acronimo"];

/** Si el catálogo no lo dice (Relevante lo genera el sistema), a quién se reporta cada tipo. */
const REPORTADO_POR_DEFECTO: Record<AcronimoReporte, TipoReportado> = {
  IP: "EMPLEADO",
  I: "SOCIO",
  R: "SOCIO",
};

const LARGO_RAZON = 70;

function recortar(texto: string | null, largo: number) {
  if (!texto) return null;
  return texto.length > largo ? `${texto.slice(0, largo).trimEnd()}…` : texto;
}

/** Una fila por persona, con cuántas alertas reportadas tiene, ordenadas por nombre. */
function reportadosDe(alertas: Alerta[], tipoReportado: TipoReportado): ReportadoConAlertas[] {
  const porReferencia = new Map<string, ReportadoConAlertas>();
  for (const alerta of alertas) {
    const reportado = alerta.reportado;
    if (!reportado || reportado.tipoReportado !== tipoReportado) continue;
    const existente = porReferencia.get(reportado.referencia);
    if (existente) existente.alertas++;
    else porReferencia.set(reportado.referencia, { reportado, alertas: 1 });
  }
  return [...porReferencia.values()].sort((a, b) => a.reportado.nombre.localeCompare(b.reportado.nombre));
}

/**
 * "Reporte de Alertas CNBV" (Control): las alertas que el oficial confirmó en "Revisión de alertas"
 * y que van a la CNBV. Se elige el tipo y, si se quiere, un cliente o empleado; solo se ofrecen los
 * que tienen alertas confirmadas de ese tipo.
 */
export function ReporteAlertasCnbvPage() {
  const [tipo, setTipo] = useState<AcronimoReporte>("IP");
  const [seleccionado, setSeleccionado] = useState<ReportadoAlerta | null>(null);
  const [dialogo, setDialogo] = useState<TipoReportado | null>(null);
  const [mostrar, setMostrar] = useState(false);

  const { data: tiposAlerta } = useTiposAlerta();
  const { data: alertas, isLoading, isError } = useAlertasReportadas(tipo);

  const tipoReportado: TipoReportado =
    tiposAlerta?.find((t) => t.alertaAcronimo === tipo)?.tipoReportado ?? REPORTADO_POR_DEFECTO[tipo];
  const clientes = useMemo(() => reportadosDe(alertas ?? [], "SOCIO"), [alertas]);
  const empleados = useMemo(() => reportadosDe(alertas ?? [], "EMPLEADO"), [alertas]);

  const resultado = useMemo(
    () =>
      (alertas ?? []).filter(
        (a) => !seleccionado || (a.reportado?.referencia === seleccionado.referencia
          && a.reportado?.tipoReportado === seleccionado.tipoReportado),
      ),
    [alertas, seleccionado],
  );

  function limpiar() {
    setSeleccionado(null);
    setMostrar(false);
  }

  function cambiarTipo(nuevo: AcronimoReporte) {
    setTipo(nuevo);
    limpiar();
  }

  const campos: { tipoReportado: TipoReportado; etiqueta: string }[] = [
    { tipoReportado: "SOCIO", etiqueta: "Cliente" },
    { tipoReportado: "EMPLEADO", etiqueta: "Empleado" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reporte de Alertas CNBV</h1>
        <p className="text-muted-foreground">
          Alertas confirmadas en "Revisión de alertas" que se reportan a la CNBV. Elige el tipo y, si
          quieres, un {tipoReportado === "SOCIO" ? "cliente" : "empleado"}; luego da clic en Ver.
        </p>
      </div>

      <Card>
        <CardContent className="flex max-w-2xl flex-col gap-4">
          <fieldset className="border-border flex flex-wrap justify-center gap-6 rounded-lg border px-4 py-3">
            <legend className="sr-only">Tipo de alerta</legend>
            {TIPOS.map((t) => (
              <label key={t.acronimo} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="tipoReporteCnbv"
                  checked={tipo === t.acronimo}
                  onChange={() => cambiarTipo(t.acronimo)}
                  className="accent-primary size-4"
                />
                {t.etiqueta}
              </label>
            ))}
          </fieldset>

          {campos.map((campo) => {
            const habilitado = campo.tipoReportado === tipoReportado;
            const elegido = seleccionado?.tipoReportado === campo.tipoReportado ? seleccionado : null;
            return (
              <div
                key={campo.tipoReportado}
                className={cn(
                  "border-border flex items-center gap-2 rounded-lg border px-3 py-2",
                  !habilitado && "opacity-50",
                )}
              >
                <span className={cn(label, "w-20 shrink-0")}>{campo.etiqueta}</span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={`Buscar ${campo.etiqueta.toLowerCase()}`}
                  disabled={!habilitado || isLoading}
                  onClick={() => setDialogo(campo.tipoReportado)}
                >
                  <Search className="size-4" />
                </Button>
                <span className="text-muted-foreground w-40 shrink-0 truncate text-sm">
                  {elegido?.referencia ?? ""}
                </span>
                <span className="text-foreground min-w-0 flex-1 truncate text-sm font-medium">
                  {elegido?.nombre ?? ""}
                </span>
              </div>
            );
          })}

          <div className="flex justify-center gap-2">
            <Button type="button" variant="outline" onClick={limpiar}>
              <BrushCleaning className="size-4" />
              Limpiar
            </Button>
            <Button type="button" onClick={() => setMostrar(true)} disabled={isLoading || isError}>
              <Eye className="size-4" />
              Ver
            </Button>
          </div>
          {isError ? (
            <p className="text-destructive text-center text-sm">No se pudieron cargar las alertas reportadas.</p>
          ) : null}
        </CardContent>
      </Card>

      {mostrar ? <TablaReporte alertas={resultado} /> : null}

      {dialogo ? (
        <SelectorReportadoDialog
          abierto
          onAbiertoCambiar={(abierto) => !abierto && setDialogo(null)}
          tipoReportado={dialogo}
          reportados={dialogo === "SOCIO" ? clientes : empleados}
          seleccionadoReferencia={seleccionado?.referencia ?? null}
          onSeleccionar={(reportado) => {
            setSeleccionado(reportado);
            setMostrar(false);
          }}
        />
      ) : null}
    </div>
  );
}

function TablaReporte({ alertas }: { alertas: Alerta[] }) {
  if (alertas.length === 0) {
    return <p className={emptyState}>No hay alertas confirmadas por reportar con estos filtros.</p>;
  }
  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-sm">
        {alertas.length} {alertas.length === 1 ? "alerta" : "alertas"} por reportar.
      </p>
      <div className={table.wrapper}>
        <div className="overflow-x-auto">
          <table className={table.root}>
            <thead className={table.head}>
              <tr>
                <th className={table.headCell}>Folio</th>
                <th className={table.headCell}>Fecha alerta</th>
                <th className={table.headCell}>Fecha operación</th>
                <th className={table.headCell}>Referencia</th>
                <th className={table.headCell}>Nombre</th>
                <th className={table.headCell}>RFC</th>
                <th className={table.headCell}>Razón</th>
                <th className={table.headCell}>Confirmada</th>
              </tr>
            </thead>
            <tbody className={table.body}>
              {alertas.map((a) => (
                <tr key={a.id}>
                  <td className={table.cell}>{a.folio}</td>
                  <td className={table.cell}>{formatearFecha(a.fechaAlerta)}</td>
                  <td className={table.cell}>{formatearFecha(a.fechaIncidencia)}</td>
                  <td className={cn(table.cell, "text-muted-foreground")}>{a.reportado?.referencia ?? "—"}</td>
                  <td className={cn(table.cell, "font-medium")}>{a.reportado?.nombre ?? "—"}</td>
                  <td className={cn(table.cell, "text-muted-foreground")}>{a.reportado?.rfc ?? "—"}</td>
                  <td className={table.cell} title={a.razonAlertaDescripcion ?? undefined}>
                    {a.razonAlertaNumero
                      ? `${a.razonAlertaNumero} — ${recortar(a.razonAlertaDescripcion, LARGO_RAZON) ?? ""}`
                      : "—"}
                  </td>
                  <td className={table.cell}>{formatearFecha(a.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
