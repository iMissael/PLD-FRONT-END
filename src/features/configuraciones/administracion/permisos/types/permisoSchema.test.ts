import { describe, expect, it } from "vitest";
import { crearPermisosPorMenuSchema } from "@/features/configuraciones/administracion/permisos/types/permisoSchema";

describe("crearPermisosPorMenuSchema", () => {
  it("acepta un menú y una o varias acciones del enum", () => {
    expect(
      crearPermisosPorMenuSchema.safeParse({ menu: "configuraciones", acciones: ["crear"] })
        .success,
    ).toBe(true);
    expect(
      crearPermisosPorMenuSchema.safeParse({
        menu: "operacion",
        acciones: ["ver", "confirmar"],
      }).success,
    ).toBe(true);
  });

  it("exige menú y al menos una acción", () => {
    const resultado = crearPermisosPorMenuSchema.safeParse({ menu: "", acciones: [] });
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const mensajes = resultado.error.issues.map((problema) => problema.message);
      expect(mensajes).toContain("El menú es obligatorio");
      expect(mensajes).toContain("Elige al menos una acción");
    }
  });

  it("rechaza acciones fuera del enum, incluso en mayúsculas", () => {
    expect(
      crearPermisosPorMenuSchema.safeParse({ menu: "configuraciones", acciones: ["aprobar"] })
        .success,
    ).toBe(false);
    expect(
      crearPermisosPorMenuSchema.safeParse({ menu: "configuraciones", acciones: ["CREAR"] })
        .success,
    ).toBe(false);
  });

  it("limita la descripción a 255 caracteres", () => {
    expect(
      crearPermisosPorMenuSchema.safeParse({
        menu: "configuraciones",
        acciones: ["ver"],
        descripcion: "D".repeat(256),
      }).success,
    ).toBe(false);
  });
});
