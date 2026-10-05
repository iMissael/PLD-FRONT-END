import { describe, expect, it } from "vitest";
import {
  crearUsuarioSchema,
  type CrearUsuarioFormValues,
} from "@/features/configuraciones/administracion/usuarios/types/usuarioSchema";

const valido: CrearUsuarioFormValues = {
  username: "jdoe",
  password: "Secreta1234!",
  confirmarPassword: "Secreta1234!",
  nombre: "JUAN",
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

  it("acepta un alta con todos los datos bien formados", () => {
    const completo = {
      ...valido,
      correo: "jdoe@example.com",
      telefono: "5512345678",
      primerApellido: "PÉREZ",
      segundoApellido: "GÓMEZ",
      fechaNacimiento: "1980-01-01",
      rfc: "PEGJ800101ABC",
      curp: "PEGJ800101HDFRZN01",
      numDependientes: "2",
      folioIdentificacion: "0123456789012",
      codigoPostal: "06600",
      numExterior: "12-A",
    };
    expect(errores(completo)).toEqual({});
  });

  describe("acceso", () => {
    it("el username va en minúsculas y sin espacios", () => {
      expect(errores({ username: "JDoe" })).toHaveProperty("username");
      expect(errores({ username: "j doe" })).toHaveProperty("username");
      expect(errores({ username: "j.doe-1_x" })).toEqual({});
    });

    it("el username tiene como máximo 50 caracteres (columna de la base)", () => {
      expect(errores({ username: "a".repeat(51) })).toHaveProperty("username");
    });

    it("la contraseña sigue las reglas del backend", () => {
      const conClave = (password: string) => errores({ password, confirmarPassword: password });
      expect(conClave("Secreta123!")).toHaveProperty("password"); // 11 caracteres
      expect(conClave("secreta1234!")).toHaveProperty("password"); // sin mayúscula
      expect(conClave("SECRETA1234!")).toHaveProperty("password"); // sin minúscula
      expect(conClave("Secretaaaaa!")).toHaveProperty("password"); // sin número
      expect(conClave("Secreta12345")).toHaveProperty("password"); // sin especial
      expect(conClave("Secreta1234!")).toEqual({});
    });

    it("la contraseña tiene entre 12 y 72 caracteres", () => {
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

    it("el correo, si se captura, debe ser válido", () => {
      expect(errores({ correo: "jdoe@" })).toHaveProperty("correo");
      expect(errores({ correo: "" })).toEqual({});
    });

    it("el rol es obligatorio", () => {
      expect(errores({ rolId: "" })).toHaveProperty("rolId");
    });
  });

  describe("teléfono, RFC, CURP y folio", () => {
    it("el teléfono son exactamente 10 dígitos", () => {
      expect(errores({ telefono: "551234567" })).toHaveProperty("telefono");
      expect(errores({ telefono: "55123456789" })).toHaveProperty("telefono");
      expect(errores({ telefono: "5512345678" })).toEqual({});
    });

    it("el RFC y la CURP deben tener el formato oficial", () => {
      expect(errores({ rfc: "ABC123" })).toHaveProperty("rfc");
      expect(errores({ curp: "ABC123" })).toHaveProperty("curp");
    });

    it("el folio solo lleva letras y números", () => {
      expect(errores({ folioIdentificacion: "AB-12" })).toHaveProperty(
        "folioIdentificacion",
      );
    });

    it("los dependientes son un entero de 0 a 99", () => {
      expect(errores({ numDependientes: "100" })).toHaveProperty("numDependientes");
      expect(errores({ numDependientes: "0" })).toEqual({});
    });
  });

  describe("nombre y fecha de nacimiento", () => {
    it("el nombre no admite números ni símbolos", () => {
      expect(errores({ nombre: "JUAN2" })).toHaveProperty("nombre");
      expect(errores({ nombre: "" })).toHaveProperty("nombre");
    });

    it("el nombre tiene como máximo 150 caracteres y los apellidos 100", () => {
      expect(errores({ nombre: "A".repeat(151) })).toHaveProperty("nombre");
      expect(errores({ primerApellido: "A".repeat(101) })).toHaveProperty(
        "primerApellido",
      );
    });

    it("la fecha de nacimiento debe ser de alguien mayor de edad", () => {
      const hoy = new Date();
      const menor = `${hoy.getFullYear() - 10}-01-01`;
      expect(errores({ fechaNacimiento: menor })).toHaveProperty("fechaNacimiento");
      expect(errores({ fechaNacimiento: "1899-12-31" })).toHaveProperty(
        "fechaNacimiento",
      );
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
