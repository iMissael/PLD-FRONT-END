import type { ReactNode } from "react";

import { useExpedienteAlerta, useMovimientoAlerta } from "@/features/alertas/hooks/useAlertas";
import type { Alerta } from "@/features/alertas/types/alertas";
import { formatearFecha, formatearMoneda } from "@/features/operacion/revision-alertas/utils/formato";
import { etiquetaFormaPago } from "@/features/operacion/revision-autorizaciones/utils/formatoAutorizacion";
import { Card } from "@/shared/components/molecules";
import { label } from "@/shared/styles/tokens";

/** Campos de Sicanet que todavía no tienen fuente de datos en el sistema. */
const SIN_INFORMACION = <span className="text-muted-foreground italic">Sin información</span>;

function Dato({ titulo, children }: { titulo: string; children: ReactNode }) {
  const vacio = children === null || children === undefined || children === "";
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted-foreground text-xs">{titulo}</dt>
      <dd className="text-foreground text-sm">{vacio ? "—" : children}</dd>
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="border-border border-b pb-1">
        <h4 className={label}>{titulo}</h4>
      </div>
      {children}
    </section>
  );
}

interface DetalleAlertaSeguimientoProps {
  alerta: Alerta;
}

/**
 * Detalle de "Revisión de alertas de seguimiento" (pantalla Sicanet homónima): datos del
 * cliente y del movimiento de caja que originó la alerta, si tiene uno. Es de solo lectura:
 * las alertas de seguimiento no tienen dictamen, solo se consultan.
 */
export function DetalleAlertaSeguimiento({ alerta }: DetalleAlertaSeguimientoProps) {
  const { data: expediente, isLoading: cargandoExpediente } = useExpedienteAlerta(alerta.id);
  const { data: movimiento, isLoading: cargandoMovimiento } = useMovimientoAlerta(alerta.id);

  const reportado = alerta.reportado;
  const esSocio = reportado?.tipoReportado === "SOCIO";
  const curp = esSocio ? (cargandoExpediente ? "…" : (expediente?.evaluado?.curp ?? SIN_INFORMACION)) : SIN_INFORMACION;

  return (
    <Card className="flex flex-col gap-5 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-foreground text-sm font-semibold">
          Alerta {alerta.folio} · {alerta.tipoAlertaDescripcion}
        </h3>
      </div>

      <Seccion titulo="Información general">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Dato titulo="Fecha de operación">
            {cargandoMovimiento ? "…" : formatearFecha(movimiento?.fecha ?? alerta.fechaIncidencia)}
          </Dato>
          <Dato titulo="Fecha de detección">{formatearFecha(alerta.fechaAlerta)}</Dato>
          <Dato titulo="Folio de la alerta">{alerta.folio}</Dato>
          <Dato titulo="Nombre del empleado">{SIN_INFORMACION}</Dato>
          <div className="sm:col-span-2">
            <Dato titulo="Nombre de cliente">{reportado?.nombre}</Dato>
          </div>
          <Dato titulo="CURP">{curp}</Dato>
          <Dato titulo="RFC">{reportado?.rfc}</Dato>
          <Dato titulo="Teléfonos">{SIN_INFORMACION}</Dato>
        </dl>
      </Seccion>

      <Seccion titulo="Alerta 1">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Dato titulo="Folio del movimiento">
            {cargandoMovimiento ? "…" : (movimiento?.folioOperacion ?? alerta.folioOperacion)}
          </Dato>
          <Dato titulo="Monto">
            {cargandoMovimiento
              ? "…"
              : movimiento?.importe != null
                ? formatearMoneda(movimiento.importe, movimiento.moneda ?? "MXN")
                : null}
          </Dato>
          <Dato titulo="Forma de pago">
            {cargandoMovimiento ? "…" : movimiento?.formaPago ? etiquetaFormaPago(movimiento.formaPago) : null}
          </Dato>
          <div className="sm:col-span-2">
            <Dato titulo="Descripción de la alerta">
              {alerta.descripcion ? (
                <span className="whitespace-pre-line">{alerta.descripcion}</span>
              ) : null}
            </Dato>
          </div>
        </dl>
      </Seccion>
    </Card>
  );
}
