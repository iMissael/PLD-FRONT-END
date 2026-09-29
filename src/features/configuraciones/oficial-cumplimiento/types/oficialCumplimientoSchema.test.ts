import { describe, expect, it } from "vitest";
import { oficialCumplimientoSchema } from "@/features/configuraciones/oficial-cumplimiento/types/oficialCumplimientoSchema";
import { hoyIso } from "@/shared/utils/fechas";
import { valoresIniciales } from "@/features/configuraciones/oficial-cumplimiento/utils/oficialCumplimiento";

const valido = {
  ...valoresIniciales({ nombre: "OLGA", nacionalidadId: "n1" }, null, null),
  domicilioPaisId: "165",
  domicilioEntidadId: "1",
  municipioId: "1",
  localidadId: "1",
  tipoPersona: "FISICA",
  claveDelSujetoObligado: "692285",
  claveOrganoSuperior: "002",
};

// Como el formulario, se toma el primer mensaje de cada campo.
function errores(cambios: Record<string, string>) {
  const resultado = oficialCumplimientoSchema.safeParse({ ...valido, ...cambios });
  const mensajes: Record<string, string> = {};
  if (!resultado.success) {
    for (const problema of resultado.error.issues) {
      const campo = String(problema.path[0]);
      mensajes[campo] ??= problema.message;
    }
  }
  return mensajes;
}

describe("oficialCumplimientoSchema", () => {
  it("acepta una ficha con solo lo obligatorio", () => {
    expect(errores({})).toEqual({});
  });

  describe("teléfono", () => {
    it("acepta exactamente 10 dígitos", () => {
      expect(errores({ telefono: "9510000000" })).toEqual({});
    });

    it.each(["951000000", "95100000000", "95100000AB", "951-000-0000"])(
      'rechaza "%s"',
      (telefono) => {
        expect(errores({ telefono }).telefono).toMatch(/10 dígitos/);
      },
    );

    it("es opcional", () => {
      expect(errores({ telefono: "" })).toEqual({});
    });
  });

  describe("nombres", () => {
    it("exige el nombre y ignora los espacios solos", () => {
      expect(errores({ nombre: "   " }).nombre).toMatch(/obligatorio/);
    });

    it("rechaza dígitos en nombres y apellidos", () => {
      expect(errores({ nombre: "OLGA2" }).nombre).toMatch(/Solo letras/);
      expect(errores({ primerApellido: "PÉREZ 3" }).primerApellido).toMatch(
        /Solo letras/,
      );
    });

    it("acepta acentos, ñ, apóstrofo y guion", () => {
      expect(errores({ nombre: "MARÍA-JOSÉ", primerApellido: "O'BRIEN NÚÑEZ" })).toEqual(
        {},
      );
    });

    it("respeta el largo de la columna (150 y 100)", () => {
      expect(errores({ nombre: "A".repeat(151) }).nombre).toMatch(/150/);
      expect(errores({ primerApellido: "A".repeat(101) }).primerApellido).toMatch(/100/);
    });
  });

  describe("identificación", () => {
    it("valida el RFC de persona física (13) y moral (12)", () => {
      expect(errores({ rfc: "KEQO780724H35" })).toEqual({});
      expect(errores({ rfc: "ABC850101AB1" })).toEqual({});
      expect(errores({ rfc: "KEQO780724H3" }).rfc).toMatch(/RFC inválido/);
      expect(errores({ rfc: "1234567890123" }).rfc).toMatch(/RFC inválido/);
    });

    it("valida el formato de la CURP", () => {
      expect(errores({ curp: "KEQO780724HOCDNW01" })).toEqual({});
      expect(errores({ curp: "KEQO780724XOCDNW01" }).curp).toMatch(/CURP inválida/);
      expect(errores({ curp: "KEQO780724HOCDNW0" }).curp).toMatch(/CURP inválida/);
    });

    it("el folio solo lleva letras y números", () => {
      expect(errores({ folioIdentificacion: "AB12345" })).toEqual({});
      expect(errores({ folioIdentificacion: "AB 123-4" }).folioIdentificacion).toMatch(
        /letras y números/,
      );
    });

    it("el número de dependientes es un entero de 0 a 99", () => {
      expect(errores({ numDependientes: "0" })).toEqual({});
      expect(errores({ numDependientes: "12" })).toEqual({});
      expect(errores({ numDependientes: "-1" }).numDependientes).toBeDefined();
      expect(errores({ numDependientes: "1.5" }).numDependientes).toBeDefined();
      expect(errores({ numDependientes: "100" }).numDependientes).toBeDefined();
    });
  });

  describe("correo", () => {
    it("acepta uno válido y rechaza uno mal escrito", () => {
      expect(errores({ correo: "olga@sicanetsc.com" })).toEqual({});
      expect(errores({ correo: "olga@" }).correo).toMatch(/Correo inválido/);
    });
  });

  describe("fecha de nacimiento", () => {
    it("rechaza fechas futuras", () => {
      expect(errores({ fechaNacimiento: "2999-01-01" }).fechaNacimiento).toBeDefined();
    });

    it("exige mayoría de edad", () => {
      const anio = new Date().getFullYear() - 10;
      expect(errores({ fechaNacimiento: `${anio}-01-01` }).fechaNacimiento).toMatch(
        /mayor de 18/,
      );
      expect(errores({ fechaNacimiento: "1978-07-24" })).toEqual({});
    });

    it("rechaza años anteriores a 1900", () => {
      expect(errores({ fechaNacimiento: "1850-01-01" }).fechaNacimiento).toMatch(
        /no es válida/,
      );
    });
  });

  describe("domicilio", () => {
    it("el código postal tiene 5 dígitos", () => {
      expect(errores({ codigoPostal: "68050" })).toEqual({});
      expect(errores({ codigoPostal: "6805" }).codigoPostal).toMatch(/5 dígitos/);
      expect(errores({ codigoPostal: "680501" }).codigoPostal).toBeDefined();
    });

    it('el número exterior admite "12-A" y "S/N"', () => {
      expect(errores({ numExterior: "12-A", numInterior: "S/N" })).toEqual({});
      expect(errores({ numExterior: "12#" }).numExterior).toBeDefined();
      expect(errores({ numExterior: "12345678901" }).numExterior).toMatch(/10/);
    });

    it("la latitud y la longitud van juntas y dentro de rango", () => {
      expect(errores({ latitud: "17.0601", longitud: "-96.6983" })).toEqual({});
      expect(errores({ latitud: "17.0601" }).longitud).toMatch(/longitud/);
      expect(errores({ longitud: "-96.6983" }).latitud).toMatch(/latitud/);
      expect(errores({ latitud: "91", longitud: "10" }).latitud).toMatch(/-90 y 90/);
      expect(errores({ latitud: "10", longitud: "181" }).longitud).toMatch(/-180 y 180/);
      expect(errores({ latitud: "abc", longitud: "10" }).latitud).toBeDefined();
    });

    it("la antigüedad en el domicilio no puede ser futura", () => {
      expect(errores({ antiguedadDomicilio: hoyIso() })).toEqual({});
      expect(errores({ antiguedadDomicilio: "2999-01-01" }).antiguedadDomicilio).toMatch(
        /futura/,
      );
    });

    it("respeta el largo de las columnas", () => {
      expect(errores({ calle: "A".repeat(101) }).calle).toMatch(/100/);
      expect(
        errores({ nombreCalleIzquierda: "A".repeat(51) }).nombreCalleIzquierda,
      ).toMatch(/50/);
    });
  });

  describe("parámetros PLD", () => {
    it("las claves llevan letras, números y guion", () => {
      expect(errores({ claveDelOficialDeCumplimiento: "OC-0001" })).toEqual({});
      expect(
        errores({ claveDelSujetoObligado: "69 2285" }).claveDelSujetoObligado,
      ).toMatch(/Solo letras/);
      expect(
        errores({ claveDelOficialDeCumplimiento: "A".repeat(13) })
          .claveDelOficialDeCumplimiento,
      ).toMatch(/12/);
    });

    it("las claves obligatorias no pueden ir vacías", () => {
      expect(errores({ claveDelSujetoObligado: "" }).claveDelSujetoObligado).toMatch(
        /obligatoria/,
      );
      expect(errores({ claveOrganoSuperior: "  " }).claveOrganoSuperior).toMatch(
        /obligatoria/,
      );
    });

    it("la moneda son 3 letras", () => {
      expect(errores({ monedaDeOperacionPrincipal: "MXN" })).toEqual({});
      expect(
        errores({ monedaDeOperacionPrincipal: "MX" }).monedaDeOperacionPrincipal,
      ).toMatch(/3 letras/);
      expect(
        errores({ monedaDeOperacionPrincipal: "M1N" }).monedaDeOperacionPrincipal,
      ).toBeDefined();
    });
  });
});
