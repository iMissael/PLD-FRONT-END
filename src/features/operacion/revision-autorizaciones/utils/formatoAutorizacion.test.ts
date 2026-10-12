import { describe, expect, it } from "vitest";

import type { RevisionAutorizacion } from "../types/autorizaciones";
import {
  autorizacionesCsv,
  etiquetaFormaPago,
  formatearFechaHora,
  formatearImporte,
} from "./formatoAutorizacion";

const autorizacion: RevisionAutorizacion = {
  id: 1,
  folioAlerta: 348,
  folioOperacion: "F4-11588",
  estatus: "AUTORIZADO",
  acreditado: {
    numero: "232",
    referencia: "REF1-000174",
    nombre: "ALDAIR CRUZ ESTEVA",
    rfc: "SSO071219GHA",
    curp: null,
  },
  solicitud: {
    fecha: "2026-10-08T13:11:05.1234",
    usuario: "sicanet",
    nombreEmpleado: "sicanet",
  },
  autorizacion: {
    fecha: "2026-10-08T13:11:40",
    usuario: "sicanet",
    nombreEmpleado: null,
  },
  movimiento: {
    tipoMovimiento: "ABONO A CRÉDITO",
    referenciaCredito: "REF1-000074",
    importe: 171301.72,
    moneda: "MXN",
    formaPago: "E",
  },
  descripcionAlerta: 'ALERTA DE AUTORIZACIÓN, "7500" DOLARES',
};

describe("formatoAutorizacion", () => {
  it("muestra fecha y hora como Sicanet", () => {
    expect(formatearFechaHora("2026-10-08T13:11:05.1234")).toBe("08/10/2026 13:11");
    expect(formatearFechaHora("2026-10-08")).toBe("08/10/2026");
    expect(formatearFechaHora(null)).toBe("—");
  });

  it("traduce la forma de pago", () => {
    expect(etiquetaFormaPago("E")).toBe("EFECTIVO");
    expect(etiquetaFormaPago("t")).toBe("TRANSFERENCIA");
    expect(etiquetaFormaPago("X")).toBe("X");
  });

  it("formatea el importe en pesos y marca otras monedas", () => {
    expect(formatearImporte(171301.72, "MXN")).toBe("$171,301.72");
    expect(formatearImporte(500, "USD")).toBe("$500.00 USD");
    expect(formatearImporte(null, "MXN")).toBe("—");
  });

  it("arma el CSV escapando comas y comillas", () => {
    const [encabezado, fila] = autorizacionesCsv([autorizacion]).split("\r\n");
    expect(encabezado).toMatch(/^Folio alerta,Folio operacion/);
    expect(fila).toContain("348,F4-11588,ABONO A CRÉDITO,08/10/2026 13:11,sicanet");
    expect(fila).toContain(",sicanet,AUTORIZADO,232,");
    expect(fila).toContain(',EFECTIVO,"ALERTA DE AUTORIZACIÓN, ""7500"" DOLARES"');
  });
});
