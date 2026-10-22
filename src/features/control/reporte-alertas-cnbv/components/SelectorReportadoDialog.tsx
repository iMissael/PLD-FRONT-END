import { useMemo, useState } from "react";

import type { ReportadoAlerta, TipoReportado } from "@/features/alertas/types/alertas";
import { Input } from "@/shared/components/atoms/Input";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/organisms/Dialog";
import { emptyState, table } from "@/shared/styles/tokens";

const encabezado = `${table.headCell} sticky top-0 z-10 bg-muted py-2`;
const celda = "px-4 py-2";

/** Una fila por persona aunque tenga varias alertas reportadas. */
export interface ReportadoConAlertas {
  reportado: ReportadoAlerta;
  alertas: number;
}

function sinAcentos(texto: string) {
  return texto.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

interface SelectorReportadoDialogProps {
  abierto: boolean;
  onAbiertoCambiar: (abierto: boolean) => void;
  tipoReportado: TipoReportado;
  reportados: ReportadoConAlertas[];
  seleccionadoReferencia: string | null;
  /** Se llama al elegir a alguien; el diálogo se cierra solo. */
  onSeleccionar: (reportado: ReportadoAlerta) => void;
}

/** "Consulta de Clientes" / "Consulta de Empleados" de Sicanet: solo quienes tienen alertas por reportar. */
export function SelectorReportadoDialog({
  abierto,
  onAbiertoCambiar,
  tipoReportado,
  reportados,
  seleccionadoReferencia,
  onSeleccionar,
}: SelectorReportadoDialogProps) {
  const esCliente = tipoReportado === "SOCIO";
  return (
    <Dialog open={abierto} onOpenChange={onAbiertoCambiar}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{esCliente ? "Consulta de Clientes" : "Consulta de Empleados"}</DialogTitle>
          <DialogDescription>
            Solo aparecen {esCliente ? "los clientes" : "los empleados"} con alertas confirmadas en
            "Revisión de alertas" que están pendientes de reportar.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-3">
          <ListaReportados
            esCliente={esCliente}
            reportados={reportados}
            seleccionadoReferencia={seleccionadoReferencia}
            onSeleccionar={(reportado) => {
              onSeleccionar(reportado);
              onAbiertoCambiar(false);
            }}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

/** Vive dentro del diálogo: al cerrarlo se desmonta y el filtro empieza vacío. */
function ListaReportados({
  esCliente,
  reportados,
  seleccionadoReferencia,
  onSeleccionar,
}: {
  esCliente: boolean;
  reportados: ReportadoConAlertas[];
  seleccionadoReferencia: string | null;
  onSeleccionar: (reportado: ReportadoAlerta) => void;
}) {
  const [filtro, setFiltro] = useState("");
  const visibles = useMemo(() => {
    const buscado = sinAcentos(filtro.trim());
    if (!buscado) return reportados;
    return reportados.filter(({ reportado }) =>
      [reportado.nombre, reportado.referencia, reportado.rfc ?? ""].some((v) =>
        sinAcentos(v).includes(buscado),
      ),
    );
  }, [filtro, reportados]);

  return (
    <>
      <Input
        aria-label={esCliente ? "Filtrar por cliente" : "Filtrar por empleado"}
        placeholder={esCliente ? "Filtrar por cliente, referencia o RFC" : "Filtrar por empleado, clave o RFC"}
        value={filtro}
        autoFocus
        onChange={(e) => setFiltro(e.target.value)}
      />
      {visibles.length === 0 ? (
        <p className={emptyState}>
          {reportados.length === 0
            ? `No hay ${esCliente ? "clientes" : "empleados"} con alertas por reportar de este tipo.`
            : "Nadie coincide con el filtro."}
        </p>
      ) : (
        <div className="border-border max-h-[50vh] overflow-auto rounded-xl border">
          <table className={table.root}>
            <thead className={table.head}>
              <tr>
                <th className={encabezado}>{esCliente ? "Referencia Cliente" : "Clave Empleado"}</th>
                <th className={encabezado}>{esCliente ? "Cliente" : "Empleado"}</th>
                <th className={encabezado}>RFC</th>
                <th className={`${encabezado} w-28 text-right`}>Alertas</th>
              </tr>
            </thead>
            <tbody className={table.body}>
              {visibles.map(({ reportado, alertas }) => (
                <tr
                  key={reportado.referencia}
                  onClick={() => onSeleccionar(reportado)}
                  className={table.row(reportado.referencia === seleccionadoReferencia)}
                >
                  <td className={`${celda} text-muted-foreground`}>{reportado.referencia}</td>
                  <td className={`${celda} text-foreground font-medium`}>{reportado.nombre}</td>
                  <td className={`${celda} text-muted-foreground`}>{reportado.rfc ?? "—"}</td>
                  <td className={`${celda} text-right tabular-nums`}>{alertas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
