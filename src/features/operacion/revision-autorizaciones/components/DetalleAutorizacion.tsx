import type { ReactNode } from "react";

import { Alert } from "@/shared/components/ui/Alert";
import { card, label } from "@/shared/components/ui/styles";

import { useDetalleAutorizacion } from "../hooks/useAutorizaciones";
import type { RevisionAutorizacion } from "../types/autorizaciones";
import {
  ETIQUETA_ESTATUS_AUTORIZACION,
  etiquetaFormaPago,
  formatearFechaHora,
  formatearImporte,
} from "../utils/formatoAutorizacion";

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

interface DetalleAutorizacionProps {
  seleccionada: RevisionAutorizacion | null;
}

export function DetalleAutorizacion({ seleccionada }: DetalleAutorizacionProps) {
  const {
    data: detalle,
    isLoading,
    isError,
  } = useDetalleAutorizacion(seleccionada?.id ?? null);
  const a = detalle ?? seleccionada;
  const cargando = seleccionada !== null && isLoading;

  return (
    <div className={`flex flex-col gap-5 p-4 ${card}`}>
      {isError ? (
        <Alert>
          No se pudo cargar el detalle; se muestra la información de la lista.
        </Alert>
      ) : null}

      <Seccion titulo="Información del acreditado">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Dato titulo="Número del acreditado">{a?.acreditado.numero}</Dato>
          <Dato titulo="Referencia del acreditado">{a?.acreditado.referencia}</Dato>
          <div className="sm:col-span-2">
            <Dato titulo="Nombre completo">{a?.acreditado.nombre}</Dato>
          </div>
          <Dato titulo="RFC">{a?.acreditado.rfc}</Dato>
          <Dato titulo="CURP">{cargando ? "…" : a?.acreditado.curp}</Dato>
        </dl>
      </Seccion>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Seccion titulo="Solicitud">
          <dl className="grid grid-cols-1 gap-3">
            <Dato titulo="Fecha">{a ? formatearFechaHora(a.solicitud.fecha) : null}</Dato>
            <Dato titulo="Usuario">{a?.solicitud.usuario}</Dato>
            <Dato titulo="Nombre del empleado">{a?.solicitud.nombreEmpleado}</Dato>
          </dl>
        </Seccion>
        <Seccion titulo="Autorización">
          <dl className="grid grid-cols-1 gap-3">
            <Dato titulo="Fecha">
              {a ? formatearFechaHora(a.autorizacion.fecha) : null}
            </Dato>
            <Dato titulo="Usuario">{a?.autorizacion.usuario}</Dato>
            <Dato titulo="Nombre del empleado">{a?.autorizacion.nombreEmpleado}</Dato>
            <Dato titulo="Estatus asignado">
              {a ? ETIQUETA_ESTATUS_AUTORIZACION[a.estatus] : null}
            </Dato>
          </dl>
        </Seccion>
      </div>

      <Seccion titulo="Resumen del movimiento">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Dato titulo="Tipo de movimiento">{a?.movimiento?.tipoMovimiento}</Dato>
          <Dato titulo="Referencia del crédito">{a?.movimiento?.referenciaCredito}</Dato>
          <Dato titulo="Importe">
            {a?.movimiento
              ? formatearImporte(a.movimiento.importe, a.movimiento.moneda)
              : null}
          </Dato>
          <Dato titulo="Forma de pago">
            {a?.movimiento ? etiquetaFormaPago(a.movimiento.formaPago) : null}
          </Dato>
        </dl>
      </Seccion>

      <Seccion titulo="Información de la alerta">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Dato titulo="Folio de alerta">{a?.folioAlerta}</Dato>
          <Dato titulo="Folio de operación">{a?.folioOperacion}</Dato>
          <div className="sm:col-span-3">
            <Dato titulo="Descripción de la alerta">
              {a?.descripcionAlerta ? (
                <span className="whitespace-pre-line">{a.descripcionAlerta}</span>
              ) : null}
            </Dato>
          </div>
        </dl>
      </Seccion>
    </div>
  );
}
