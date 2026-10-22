import { describe, expect, it } from "vitest";

import type { Alerta, ReportadoAlerta } from "@/features/alertas/types/alertas";

import {
  filtrarPorReportado,
  nivelPlazoReporte,
  reportadosDe,
  textoDiasHabilesReporte,
} from "./plazoReporte";

function alerta(id: number, reportado: Partial<ReportadoAlerta>): Alerta {
  return {
    id,
    reportado: {
      tipoReportado: "SOCIO",
      referencia: "",
      nombre: "",
      rfc: null,
      puesto: null,
      fechaEmisionFuente: null,
      fuenteInformacion: null,
      estatusReportado: null,
      ...reportado,
    },
  } as Alerta;
}

describe("plazoReporte", () => {
  it("describe los días hábiles que quedan", () => {
    expect(textoDiasHabilesReporte(3)).toBe("Quedan 3 días hábiles");
    expect(textoDiasHabilesReporte(1)).toBe("Queda 1 día hábil");
    expect(textoDiasHabilesReporte(0)).toBe("Vence hoy");
    expect(textoDiasHabilesReporte(-1)).toBe("Fuera de plazo: hace 1 día hábil");
    expect(textoDiasHabilesReporte(-2)).toBe("Fuera de plazo: hace 2 días hábiles");
  });

  it("asigna el nivel del plazo", () => {
    expect(nivelPlazoReporte(-1)).toBe("vencido");
    expect(nivelPlazoReporte(0)).toBe("urgente");
    expect(nivelPlazoReporte(1)).toBe("proximo");
    expect(nivelPlazoReporte(2)).toBe("holgado");
  });

  it("arma las opciones de cliente y empleado sin repetir", () => {
    const alertas = [
      alerta(1, { referencia: "A-2", nombre: "ZOE" }),
      alerta(2, { referencia: "A-1", nombre: "ANA" }),
      alerta(3, { referencia: "A-1", nombre: "ANA" }),
      alerta(4, { tipoReportado: "EMPLEADO", referencia: "E-1", nombre: "LUIS" }),
    ];
    expect(reportadosDe(alertas, "SOCIO")).toEqual([
      { referencia: "A-1", nombre: "ANA" },
      { referencia: "A-2", nombre: "ZOE" },
    ]);
    expect(reportadosDe(alertas, "EMPLEADO")).toEqual([
      { referencia: "E-1", nombre: "LUIS" },
    ]);
    expect(filtrarPorReportado(alertas, "A-1", "").map((a) => a.id)).toEqual([2, 3]);
    expect(filtrarPorReportado(alertas, "", "E-1").map((a) => a.id)).toEqual([4]);
    expect(filtrarPorReportado(alertas, "", "")).toHaveLength(4);
  });
});
