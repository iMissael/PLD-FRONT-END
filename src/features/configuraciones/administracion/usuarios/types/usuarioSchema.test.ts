import { describe, expect, it } from "vitest";
import {
  crearUsuarioSchema,
  type CrearUsuarioFormValues,
} from "@/features/configuraciones/administracion/usuarios/types/usuarioSchema";

const valido: CrearUsuarioFormValues = {
  empleadoId: "1024",
  username: "jdoe",
  password: "Secreta123!",
  confirmarPassword: "Secreta123!",
  rolId: "rol-1",
  domicilioPaisId: "MX",
  domicilioEntidadId: "20",
  municipioId: "390",
  localidadId: "0001",
};

function errores(cambios: Partial<CrearUsuarioFormValues>) {
  const resultado = crearUsuarioSchema.safeParse({ ...valido, ...cambios });
  return resultado.success
    ? {}
    : Object.fromEntries(
        resultado.error.issues.map((problema) => [
          problema.path.join("."),
          problema.message,
        ]),
      );
}

describe("crearUsuarioSchema", () => {
  it("acepta un alta con solo lo obligatorio", () => {
    expect(crearUsuarioSchema.safeParse(valido).success).toBe(true);
  });

  it("acepta un alta con todos los datos de domicilio bien formados", () => {
    const completo = {
      ...valido,
      codigoPostal: "06600",
      numExterior: "12-A",
      latitud: "19.4326",
      longitud: "-99.1332",
    };
    expect(errores(completo)).toEqual({});
  });

  describe("empleado y acceso", () => {
    it("el id de empleado es obligatorio y numérico", () => {
      expect(errores({ empleadoId: "" })).toHaveProperty("empleadoId");
      expect(errores({ empleadoId: "ABC" })).toHaveProperty("empleadoId");
      expect(errores({ empleadoId: "1024" })).toEqual({});
    });

    it("el username va en minúsculas y sin espacios", () => {
      expect(errores({ username: "JDoe" })).toHaveProperty("username");
      expect(errores({ username: "j doe" })).toHaveProperty("username");
      expect(errores({ username: "j.doe-1_x" })).toEqual({});
    });

    it("el username tiene como máximo 50 caracteres (columna de la base)", () => {
      expect(errores({ username: "a".repeat(51) })).toHaveProperty("username");
    });

    it("la contraseña tiene entre 8 y 72 caracteres", () => {
      expect(errores({ password: "corta", confirmarPassword: "corta" })).toHaveProperty(
        "password",
      );
      const larga = "a".repeat(73);
      expect(errores({ password: larga, confirmarPassword: larga })).toHaveProperty(
        "password",
      );
    });

    it("las contraseñas deben coincidir", () => {
      expect(errores({ confirmarPassword: "Otra123456" })).toEqual({
        confirmarPassword: "Las contraseñas no coinciden",
      });
    });

    it("el rol es obligatorio", () => {
      expect(errores({ rolId: "" })).toHaveProperty("rolId");
    });
  });

  describe("domicilio", () => {
    it("el código postal son 5 dígitos", () => {
      expect(errores({ codigoPostal: "660" })).toHaveProperty("codigoPostal");
    });

    it("los números exterior e interior admiten letras, dígitos, / y -", () => {
      expect(errores({ numExterior: "S/N" })).toEqual({});
      expect(errores({ numInterior: "12#" })).toHaveProperty("numInterior");
      expect(errores({ numExterior: "1234567890A" })).toHaveProperty("numExterior");
    });

    it("las coordenadas van dentro de rango y en par", () => {
      expect(errores({ latitud: "91", longitud: "10" })).toHaveProperty("latitud");
      expect(errores({ latitud: "19.4" })).toEqual({
        longitud: "Captura también la longitud",
      });
      expect(errores({ longitud: "-99.1" })).toEqual({
        latitud: "Captura también la latitud",
      });
    });

    it("la antigüedad del domicilio no puede ser futura", () => {
      expect(errores({ antiguedadDomicilio: "2999-01-01" })).toHaveProperty(
        "antiguedadDomicilio",
      );
    });

    it("país, entidad, municipio y localidad son obligatorios", () => {
      expect(errores({ domicilioPaisId: "" })).toHaveProperty("domicilioPaisId");
      expect(errores({ domicilioEntidadId: "" })).toHaveProperty("domicilioEntidadId");
      expect(errores({ municipioId: "" })).toHaveProperty("municipioId");
      expect(errores({ localidadId: "" })).toHaveProperty("localidadId");
    });
  });
});
