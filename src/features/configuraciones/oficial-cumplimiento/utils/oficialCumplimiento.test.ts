import { describe, expect, it } from "vitest";
import {
  aDomicilioPayload,
  aOficialPayload,
  aUsuarioPayload,
  generoConocido,
  nombreMoneda,
  ultimaActualizacion,
  valoresIniciales,
} from "@/features/configuraciones/oficial-cumplimiento/utils/oficialCumplimiento";

describe("valoresIniciales", () => {
  it("rellena con cadenas vacías cuando no hay domicilio ni oficial", () => {
    const valores = valoresIniciales(
      { nombre: "Ana", numDependientes: 2, correo: undefined },
      null,
      null,
    );
    expect(valores.nombre).toBe("ANA");
    expect(valores.numDependientes).toBe("2");
    expect(valores.correo).toBe("");
    expect(valores.calle).toBe("");
    expect(valores.claveDelSujetoObligado).toBe("");
  });
});

describe("valoresIniciales: todo en mayúsculas y con formato", () => {
  it("pasa a mayúsculas el texto que ya estaba guardado", () => {
    const valores = valoresIniciales(
      { nombre: "Olga María", primerApellido: "de la Cruz", rfc: "abcd800101xyz" },
      { calle: "Av. Hidalgo", colonia: "Centro" },
      { claveDelSujetoObligado: "ab-12", monedaDeOperacionPrincipal: "mxn" },
    );
    expect(valores.nombre).toBe("OLGA MARÍA");
    expect(valores.primerApellido).toBe("DE LA CRUZ");
    expect(valores.rfc).toBe("ABCD800101XYZ");
    expect(valores.calle).toBe("AV. HIDALGO");
    expect(valores.colonia).toBe("CENTRO");
    expect(valores.claveDelSujetoObligado).toBe("AB-12");
    expect(valores.monedaDeOperacionPrincipal).toBe("MXN");
  });

  it("deja solo los dígitos del teléfono y del código postal", () => {
    const valores = valoresIniciales(
      { nombre: "Ana", telefono: "(951) 000-0000" },
      { codigoPostal: "C.P. 68050" },
      null,
    );
    expect(valores.telefono).toBe("9510000000");
    expect(valores.codigoPostal).toBe("68050");
  });

  it("guarda el correo en minúsculas", () => {
    expect(
      valoresIniciales({ nombre: "Ana", correo: "Ana@Correo.COM" }, null, null).correo,
    ).toBe("ana@correo.com");
  });
});

describe("payloads", () => {
  const base = valoresIniciales({ nombre: "Ana", nacionalidad: "MEXICANA" }, null, null);

  it("conserva la sucursal y omite los campos vacíos del usuario", () => {
    const payload = aUsuarioPayload(
      { ...base, rfc: "abc123", numDependientes: "3" },
      "S-1",
    );
    expect(payload.sucursalId).toBe("S-1");
    expect(payload.rfc).toBe("ABC123");
    expect(payload.numDependientes).toBe(3);
    expect(payload.curp).toBeUndefined();
    expect(payload.fechaNacimiento).toBeUndefined();
  });

  it("mapea el domicilio a los nombres del backend", () => {
    const payload = aDomicilioPayload({
      ...base,
      domicilioPaisId: "MX",
      domicilioEntidadId: "20",
      municipioId: "390",
      localidadId: "1",
    });
    expect(payload).toMatchObject({
      paisId: "MX",
      entidadId: "20",
      municipioId: "390",
      localidadId: "1",
    });
  });

  it("mapea los parámetros PLD del oficial (el backend conserva el estatus existente)", () => {
    const payload = aOficialPayload({
      ...base,
      tipoPersona: "FISICA",
      monedaDeOperacionPrincipal: "mxn",
    });
    expect(payload.tipoPersona).toBe("FISICA");
    expect(payload.monedaDeOperacionPrincipal).toBe("MXN");
    expect(payload).not.toHaveProperty("estatus");
  });
});

describe("aUsuarioPayload: espacios sobrantes", () => {
  it("recorta los espacios de los extremos y omite lo que queda vacío", () => {
    const base = valoresIniciales({ nombre: "Ana", nacionalidad: "MEXICANA" }, null, null);
    const payload = aUsuarioPayload(
      { ...base, primerApellido: "  PÉREZ ", curp: "   " },
      undefined,
    );
    expect(payload.primerApellido).toBe("PÉREZ");
    expect(payload.curp).toBeUndefined();
  });
});

describe("ultimaActualizacion", () => {
  it("devuelve la fecha más reciente ignorando las ausentes", () => {
    expect(
      ultimaActualizacion(["2026-01-01T10:00:00Z", undefined, "2026-03-01T10:00:00Z"]),
    ).toBe("2026-03-01T10:00:00Z");
    expect(ultimaActualizacion([undefined])).toBeNull();
  });
});

describe("generoConocido", () => {
  it("reconoce las formas habituales de escribir el género", () => {
    expect(generoConocido("Masculino")).toBe("Masculino");
    expect(generoConocido("HOMBRE")).toBe("Masculino");
    expect(generoConocido("m")).toBe("Masculino");
    expect(generoConocido(" MUJER ")).toBe("Femenino");
    expect(generoConocido("f")).toBe("Femenino");
  });

  it("devuelve null si está vacío o no es ninguna de las dos opciones", () => {
    expect(generoConocido("")).toBeNull();
    expect(generoConocido(undefined)).toBeNull();
    expect(generoConocido("OTRO")).toBeNull();
  });
});

describe("nombreMoneda", () => {
  it("traduce el código a su nombre en español", () => {
    expect(nombreMoneda("mxn")).toMatch(/peso mexicano/i);
    expect(nombreMoneda("USD")).toMatch(/d[óo]lar/i);
  });

  it("devuelve null si no es un código de moneda", () => {
    expect(nombreMoneda("")).toBeNull();
    expect(nombreMoneda("MX")).toBeNull();
    expect(nombreMoneda("ZZZ")).toBeNull();
  });
});
