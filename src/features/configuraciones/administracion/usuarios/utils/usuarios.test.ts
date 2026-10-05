import { describe, expect, it } from "vitest";
import { esRolOficial } from "@/features/configuraciones/administracion/usuarios/utils/usuarios";

const roles = [
  { idRol: 1, nombre: "Administrador" },
  { idRol: 2, nombre: "OFICIAL DE CUMPLIMIENTO" },
  { idRol: 3, nombre: "Analista" },
];

describe("esRolOficial", () => {
  it("reconoce el rol del oficial sin importar mayúsculas, acentos ni espacios", () => {
    expect(esRolOficial(roles, 2)).toBe(true);
    expect(esRolOficial(roles, "2")).toBe(true);
    expect(esRolOficial([{ idRol: 9, nombre: "  Oficial  de Cumplimiénto " }], 9)).toBe(true);
  });

  it("no confunde otros roles ni un rol sin elegir", () => {
    expect(esRolOficial(roles, 1)).toBe(false);
    expect(esRolOficial(roles, 3)).toBe(false);
    expect(esRolOficial(roles, "")).toBe(false);
    expect(esRolOficial(undefined, 2)).toBe(false);
  });
});
