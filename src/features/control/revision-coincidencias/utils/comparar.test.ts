import { describe, expect, it } from "vitest";

import { coinciden, listasCoincidentes, normalizar } from "./comparar";

describe("comparar", () => {
  it("normaliza acentos, mayúsculas y espacios", () => {
    expect(normalizar("  Rodrigo  Villaseñor ")).toBe("RODRIGO VILLASENOR");
  });

  it("detecta coincidencia sin importar acentos ni mayúsculas", () => {
    expect(coinciden("RODRIGO VILLASEÑOR QUINTERO", "Rodrigo Villasenor Quintero")).toBe(
      true,
    );
    expect(coinciden("VIQR870615AB3", "VIQR870615AB4")).toBe(false);
  });

  it("no afirma ni niega cuando falta un valor", () => {
    expect(coinciden(undefined, "VIQR870615AB3")).toBeNull();
    expect(coinciden("", "")).toBeNull();
  });

  it("lista las listas que coinciden", () => {
    expect(
      listasCoincidentes({
        lista_negra: { coincide: true },
        lista_bloqueadas: { coincide: true },
      }),
    ).toEqual(["Personas bloqueadas", "Lista negra"]);
    expect(listasCoincidentes({ lista_negra: { coincide: false } })).toEqual([]);
  });
});
