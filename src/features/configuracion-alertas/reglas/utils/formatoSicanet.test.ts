import { describe, expect, it } from "vitest";

import {
  describirMonedas,
  escribirLista,
  escribirMonedas,
  leerLista,
  leerMonedas,
} from "./formatoSicanet";

describe("listas estilo Sicanet", () => {
  it("lee las variantes que vienen del dump", () => {
    expect(leerLista("['F', 'FA', 'M']")).toEqual(["F", "FA", "M"]);
    expect(leerLista("['F','FA']")).toEqual(["F", "FA"]);
    expect(leerLista("[ 'M']")).toEqual(["M"]);
    expect(leerLista("['.']")).toEqual(["."]);
    expect(leerLista("")).toEqual([]);
  });

  it("escribe en el formato que lee el evaluador del backend", () => {
    expect(escribirLista(["F", "FA", "M"])).toBe("['F', 'FA', 'M']");
    expect(escribirLista([])).toBe("");
    expect(leerLista(escribirLista(["E"]))).toEqual(["E"]);
  });
});

describe("monedas de la regla", () => {
  it("lee permitido y no permitido, descartando monedas que el sistema no opera", () => {
    expect(
      leerMonedas(
        '{"permitido":[{"moneda_acronimo":"MXN"}],"no_permitido":[{"moneda_acronimo":"PSD"}]}',
      ),
    ).toEqual({ permitidas: ["MXN"], noPermitidas: [] });
    expect(leerMonedas('{"no_permitido":[{"moneda_acronimo":"MXN"}]}')).toEqual({
      permitidas: [],
      noPermitidas: ["MXN"],
    });
    expect(leerMonedas("no es json")).toEqual({ permitidas: [], noPermitidas: [] });
  });

  it("escribe el JSON de vuelta y vacío si no hay restricción", () => {
    expect(escribirMonedas({ permitidas: ["MXN"], noPermitidas: [] })).toBe(
      '{"permitido":[{"moneda_acronimo":"MXN"}]}',
    );
    expect(escribirMonedas({ permitidas: [], noPermitidas: [] })).toBe("");
  });

  it("describe la restricción para la tabla", () => {
    expect(describirMonedas('{"permitido":[{"moneda_acronimo":"MXN"}]}')).toBe(
      "Operaciones en MXN",
    );
    expect(describirMonedas('{"no_permitido":[{"moneda_acronimo":"MXN"}]}')).toBe(
      "Todas menos MXN",
    );
    expect(describirMonedas(null)).toBe("Todas");
  });
});
