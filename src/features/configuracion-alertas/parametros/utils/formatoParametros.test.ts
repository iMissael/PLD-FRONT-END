import { describe, expect, it } from "vitest";

import {
  parteDelMes,
  textoFechaConDia,
  textoPlazo,
  textoVentana,
  ventanaDesde,
} from "./formatoParametros";

describe("formatoParametros", () => {
  it("lee el signo de la ventana como primeros o últimos días", () => {
    expect(parteDelMes({ mes: 1, maximoDias: -10 })).toBe("ultimos");
    expect(parteDelMes({ mes: 1, maximoDias: 10 })).toBe("primeros");
    expect(textoVentana({ mes: 10, maximoDias: -10 })).toBe("Octubre: últimos 10 días");
    expect(textoVentana({ mes: 4, maximoDias: 1 })).toBe("Abril: primeros 1 día");
  });

  it("arma la ventana con el signo según la parte del mes", () => {
    expect(ventanaDesde(7, "ultimos", 15)).toEqual({ mes: 7, maximoDias: -15 });
    expect(ventanaDesde(7, "primeros", 15)).toEqual({ mes: 7, maximoDias: 15 });
  });

  it("muestra la fecha con el día de la semana", () => {
    expect(textoFechaConDia("2026-11-02")).toBe("lunes 02/11/2026");
  });

  it("pone singular y plural en los plazos", () => {
    expect(textoPlazo(30, "naturales")).toBe("30 días naturales");
    expect(textoPlazo(1, "hábiles")).toBe("1 día hábil");
  });
});
