import { describe, expect, it } from "vitest";
import { crearPermisoSchema } from "@/features/configuraciones/administracion/permisos/types/permisoSchema";

describe("crearPermisoSchema", () => {
  it("acepta recurso y acción de una sola palabra en mayúsculas", () => {
    expect(
      crearPermisoSchema.safeParse({ recurso: "USUARIOS", accion: "CREAR" }).success,
    ).toBe(true);
    expect(
      crearPermisoSchema.safeParse({ recurso: "REPORTE:VER_TODO", accion: "LEER-1.A" })
        .success,
    ).toBe(true);
  });

  it("exige recurso y acción", () => {
    const resultado = crearPermisoSchema.safeParse({ recurso: "", accion: "" });
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const mensajes = resultado.error.issues.map((problema) => problema.message);
      expect(mensajes).toContain("El recurso es obligatorio");
      expect(mensajes).toContain("La acción es obligatoria");
    }
  });

  it("rechaza espacios, minúsculas y símbolos", () => {
    expect(
      crearPermisoSchema.safeParse({ recurso: "MIS USUARIOS", accion: "CREAR" }).success,
    ).toBe(false);
    expect(
      crearPermisoSchema.safeParse({ recurso: "usuarios", accion: "CREAR" }).success,
    ).toBe(false);
    expect(
      crearPermisoSchema.safeParse({ recurso: "USUARIOS", accion: "CREAR!" }).success,
    ).toBe(false);
  });

  it("respeta los máximos de las columnas: 50 y 50 y 255", () => {
    const base = { recurso: "A", accion: "B" };
    expect(
      crearPermisoSchema.safeParse({ ...base, recurso: "A".repeat(51) }).success,
    ).toBe(false);
    expect(
      crearPermisoSchema.safeParse({ ...base, accion: "B".repeat(51) }).success,
    ).toBe(false);
    expect(
      crearPermisoSchema.safeParse({ ...base, descripcion: "D".repeat(256) }).success,
    ).toBe(false);
  });
});
