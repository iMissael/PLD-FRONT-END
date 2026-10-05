import { describe, expect, it } from "vitest";
import { crearPermisoSchema } from "@/features/configuraciones/administracion/permisos/types/permisoSchema";

describe("crearPermisoSchema", () => {
  it("acepta un recurso y una acción del enum", () => {
    expect(
      crearPermisoSchema.safeParse({ recurso: "usuarios", accion: "crear" }).success,
    ).toBe(true);
    expect(
      crearPermisoSchema.safeParse({ recurso: "coincidencias", accion: "confirmar" })
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

  it("rechaza acciones fuera del enum, incluso en mayúsculas", () => {
    expect(
      crearPermisoSchema.safeParse({ recurso: "usuarios", accion: "aprobar" }).success,
    ).toBe(false);
    expect(
      crearPermisoSchema.safeParse({ recurso: "usuarios", accion: "CREAR" }).success,
    ).toBe(false);
  });

  it("limita la descripción a 255 caracteres", () => {
    expect(
      crearPermisoSchema.safeParse({
        recurso: "usuarios",
        accion: "ver",
        descripcion: "D".repeat(256),
      }).success,
    ).toBe(false);
  });
});
