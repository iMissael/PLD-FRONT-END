import { describe, expect, it } from "vitest";

import { formatearFecha, formatearMoneda, nivelPlazo, textoDiasRestantes } from "./formato";

describe("formatearFecha", () => {
  it("acepta fecha simple y con hora", () => {
    expect(formatearFecha("2026-09-28")).toBe("28/09/2026");
    expect(formatearFecha("2026-09-28T14:03:00-06:00")).toBe("28/09/2026");
  });

  it("vacío muestra guion", () => {
    expect(formatearFecha(null)).toBe("—");
  });
});

describe("plazo de dictamen", () => {
  it("5 días o menos es urgente, 10 o menos próximo", () => {
    expect(nivelPlazo(0)).toBe("urgente");
    expect(nivelPlazo(5)).toBe("urgente");
    expect(nivelPlazo(6)).toBe("proximo");
    expect(nivelPlazo(10)).toBe("proximo");
    expect(nivelPlazo(11)).toBe("holgado");
  });

  it("dice cuántos días quedan", () => {
    expect(textoDiasRestantes(0)).toBe("Vence hoy");
    expect(textoDiasRestantes(1)).toBe("Queda 1 día");
    expect(textoDiasRestantes(30)).toBe("Quedan 30 días");
  });
});

describe("formatearMoneda", () => {
  it("pesos sin sufijo y otras monedas con su acrónimo", () => {
    expect(formatearMoneda(1000000, "MXN")).toBe("$1,000,000.00");
    expect(formatearMoneda(100, "USD")).toBe("$100.00 USD");
    expect(formatearMoneda(null, "MXN")).toBe("—");
  });
});
