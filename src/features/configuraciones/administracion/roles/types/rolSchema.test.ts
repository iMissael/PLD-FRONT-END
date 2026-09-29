import { describe, expect, it } from "vitest";
import { crearRolSchema } from "@/features/configuraciones/administracion/roles/types/rolSchema";

describe("crearRolSchema", () => {
  it("acepta un rol con nombre y categoría en mayúsculas", () => {
    expect(
      crearRolSchema.safeParse({ nombre: "ROLE_AUDITOR", categoria: "ESTANDAR" }).success,
    ).toBe(true);
  });

  it("exige nombre y categoría", () => {
    const resultado = crearRolSchema.safeParse({ nombre: "", categoria: "" });
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const mensajes = resultado.error.issues.map((problema) => problema.message);
      expect(mensajes).toContain("El nombre es obligatorio");
      expect(mensajes).toContain("La categoría es obligatoria");
    }
  });

  it("rechaza minúsculas y símbolos", () => {
    expect(
      crearRolSchema.safeParse({ nombre: "role_x", categoria: "OFICIAL" }).success,
    ).toBe(false);
    expect(
      crearRolSchema.safeParse({ nombre: "ROLE#1", categoria: "OFICIAL" }).success,
    ).toBe(false);
  });

  it("respeta los máximos de las columnas: 50 y 50 y 255", () => {
    const base = { nombre: "A", categoria: "B" };
    expect(crearRolSchema.safeParse({ ...base, nombre: "A".repeat(51) }).success).toBe(
      false,
    );
    expect(crearRolSchema.safeParse({ ...base, categoria: "B".repeat(51) }).success).toBe(
      false,
    );
    expect(
      crearRolSchema.safeParse({ ...base, descripcion: "D".repeat(256) }).success,
    ).toBe(false);
    expect(
      crearRolSchema.safeParse({ ...base, descripcion: "D".repeat(255) }).success,
    ).toBe(true);
  });
});
