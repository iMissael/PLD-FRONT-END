import { formatearFecha } from "@/features/operacion/revision-alertas/utils/formato";

import type { EstatusAutorizacion, RevisionAutorizacion } from "../types/autorizaciones";

const FORMAS_PAGO: Record<string, string> = {
  E: "EFECTIVO",
  T: "TRANSFERENCIA",
  "*": "OTRAS",
};

export const ETIQUETA_ESTATUS_AUTORIZACION: Record<EstatusAutorizacion, string> = {
  AUTORIZADO: "AUTORIZADO",
  RECHAZADO: "RECHAZADO",
  CANCELADO: "CANCELADO",
};

export function etiquetaFormaPago(codigo: string | null | undefined): string {
  if (!codigo) return "—";
  return FORMAS_PAGO[codigo.toUpperCase()] ?? codigo;
}

export function formatearFechaHora(valor: string | null | undefined): string {
  if (!valor) return "—";
  const fecha = formatearFecha(valor);
  const hora = valor.length >= 16 ? valor.slice(11, 16) : "";
  return hora ? `${fecha} ${hora}` : fecha;
}

export function formatearImporte(
  importe: number | null | undefined,
  moneda: string | null | undefined,
): string {
  if (importe === null || importe === undefined) return "—";
  const texto = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(importe);
  return moneda && moneda !== "MXN" ? `${texto} ${moneda}` : texto;
}

function celda(valor: string | number | null | undefined): string {
  const texto = valor === null || valor === undefined ? "" : String(valor);
  return /[",\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

export function autorizacionesCsv(autorizaciones: RevisionAutorizacion[]): string {
  const encabezado = [
    "Folio alerta",
    "Folio operacion",
    "Tipo de movimiento",
    "Fecha solicitud",
    "Empleado solicitante",
    "Fecha autorizacion",
    "Empleado autorizante",
    "Estatus asignado",
    "Numero del acreditado",
    "Referencia del acreditado",
    "Nombre completo",
    "RFC",
    "Referencia del credito",
    "Importe",
    "Moneda",
    "Forma de pago",
    "Descripcion de la alerta",
  ];
  const filas = autorizaciones.map((a) => [
    a.folioAlerta,
    a.folioOperacion,
    a.movimiento?.tipoMovimiento,
    formatearFechaHora(a.solicitud.fecha),
    a.solicitud.nombreEmpleado ?? a.solicitud.usuario,
    formatearFechaHora(a.autorizacion.fecha),
    a.autorizacion.nombreEmpleado ?? a.autorizacion.usuario,
    ETIQUETA_ESTATUS_AUTORIZACION[a.estatus],
    a.acreditado.numero,
    a.acreditado.referencia,
    a.acreditado.nombre,
    a.acreditado.rfc,
    a.movimiento?.referenciaCredito,
    a.movimiento?.importe,
    a.movimiento?.moneda,
    etiquetaFormaPago(a.movimiento?.formaPago),
    a.descripcionAlerta,
  ]);
  return [encabezado, ...filas].map((fila) => fila.map(celda).join(",")).join("\r\n");
}

export function descargarCsv(nombreArchivo: string, contenido: string): void {
  const blob = new Blob(["﻿", contenido], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.click();
  URL.revokeObjectURL(url);
}
