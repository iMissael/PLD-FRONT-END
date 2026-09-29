import { describe, expect, it } from "vitest";

import { formatearFecha, rangoPorDefecto } from "./formato";

describe("formatearFecha", () => {
  it("acepta fecha simple y con hora", () => {
    expect(formatearFecha("2026-09-28")).toBe("28/09/2026");
    expect(formatearFecha("2026-09-28T14:03:00-06:00")).toBe("28/09/2026");
  });

  it("vacío muestra guion", () => {
    expect(formatearFecha(null)).toBe("—");
  });
});

describe("rangoPorDefecto", () => {
  it("va del primer día del mes anterior a hoy, también en enero", () => {
    expect(rangoPorDefecto(new Date(2026, 8, 29))).toEqual({
      desde: "2026-08-01",
      hasta: "2026-09-29",
    });
    expect(rangoPorDefecto(new Date(2026, 0, 15))).toEqual({
      desde: "2025-12-01",
      hasta: "2026-01-15",
    });
  });
});
