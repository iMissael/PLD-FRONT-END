import { describe, expect, it } from "vitest";
import { calcularEdad, hoyIso } from "@/shared/utils/fechas";

describe("calcularEdad", () => {
  const hoy = new Date(2026, 8, 25);

  it("resta un año si el cumpleaños aún no llega", () => {
    expect(calcularEdad("1978-10-01", hoy)).toBe(47);
  });

  it("cuenta el año completo el mismo día del cumpleaños", () => {
    expect(calcularEdad("1978-09-25", hoy)).toBe(48);
  });

  it("devuelve null si falta la fecha o es futura", () => {
    expect(calcularEdad("", hoy)).toBeNull();
    expect(calcularEdad(undefined, hoy)).toBeNull();
    expect(calcularEdad("2030-01-01", hoy)).toBeNull();
  });
});

describe("hoyIso", () => {
  it("da la fecha local como AAAA-MM-DD", () => {
    expect(hoyIso(new Date(2026, 8, 5))).toBe("2026-09-05");
  });
});
