import { describe, expect, it } from "vitest";

import { textoGlobo, tiempoRelativo } from "./tiempoRelativo";

describe("tiempoRelativo", () => {
  const ahora = new Date("2026-10-23T12:00:00");

  it("describe cuánto tiempo pasó", () => {
    expect(tiempoRelativo("2026-10-23T11:59:40", ahora)).toBe("hace un momento");
    expect(tiempoRelativo("2026-10-23T11:59:00", ahora)).toBe("hace 1 minuto");
    expect(tiempoRelativo("2026-10-23T11:15:00", ahora)).toBe("hace 45 minutos");
    expect(tiempoRelativo("2026-10-23T09:00:00", ahora)).toBe("hace 3 horas");
    expect(tiempoRelativo("2026-10-22T08:00:00", ahora)).toBe("ayer");
    expect(tiempoRelativo("2026-10-19T12:00:00", ahora)).toBe("hace 4 días");
  });

  it("limita el globo a 99+", () => {
    expect(textoGlobo(7)).toBe("7");
    expect(textoGlobo(120)).toBe("99+");
  });
});
