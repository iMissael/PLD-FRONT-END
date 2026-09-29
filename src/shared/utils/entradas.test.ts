import { describe, expect, it } from "vitest";
import {
  alfanumerico,
  clave,
  clavePermiso,
  coordenada,
  correo,
  mayusculas,
  nombrePropio,
  nombreRol,
  nombreUsuario,
  numeroDomicilio,
  rfc,
  soloDigitos,
  soloLetras,
} from "@/shared/utils/entradas";

describe("mayusculas", () => {
  it("convierte a mayúsculas conservando acentos y la ñ", () => {
    expect(mayusculas("josé núñez")).toBe("JOSÉ NÚÑEZ");
  });

  it("quita el espacio inicial y junta los espacios seguidos", () => {
    expect(mayusculas("  ana   maría")).toBe("ANA MARÍA");
  });

  it("permite un espacio final mientras se escribe", () => {
    expect(mayusculas("ana ")).toBe("ANA ");
  });
});

describe("nombrePropio", () => {
  it("descarta números y símbolos", () => {
    expect(nombrePropio("ana2 pérez#")).toBe("ANA PÉREZ");
  });

  it("acepta punto, apóstrofo y guion", () => {
    expect(nombrePropio("o'brien-lópez jr.")).toBe("O'BRIEN-LÓPEZ JR.");
  });
});

describe("campos numéricos y de claves", () => {
  it("soloDigitos deja únicamente números (pegar un teléfono con formato)", () => {
    expect(soloDigitos("(951) 000-0000")).toBe("9510000000");
    expect(soloDigitos("abc")).toBe("");
  });

  it("alfanumerico pasa a mayúsculas y quita todo lo demás", () => {
    expect(alfanumerico("keqo-780724 hocdnw01")).toBe("KEQO780724HOCDNW01");
  });

  it("rfc conserva la Ñ y el &", () => {
    expect(rfc("ñao&850101 ab1")).toBe("ÑAO&850101AB1");
  });

  it("clave admite guion", () => {
    expect(clave("ab-12 x!")).toBe("AB-12X");
  });

  it('numeroDomicilio admite "12-A" y "S/N"', () => {
    expect(numeroDomicilio("12-a")).toBe("12-A");
    expect(numeroDomicilio("s/n")).toBe("S/N");
    expect(numeroDomicilio("5$%")).toBe("5");
  });

  it("soloLetras sirve para el código de moneda", () => {
    expect(soloLetras("m1x n")).toBe("MXN");
  });
});

describe("coordenada", () => {
  it("acepta decimales con signo", () => {
    expect(coordenada("-96.6983")).toBe("-96.6983");
    expect(coordenada("17.0601")).toBe("17.0601");
  });

  it("solo permite el signo al inicio y un punto decimal", () => {
    expect(coordenada("1-7.06.01")).toBe("17.0601");
    expect(coordenada("--5")).toBe("-5");
    expect(coordenada("abc12")).toBe("12");
  });
});

describe("correo", () => {
  it("pasa a minúsculas y quita espacios", () => {
    expect(correo(" Ana@Correo.COM ")).toBe("ana@correo.com");
  });
});

describe("nombreUsuario", () => {
  it("pasa a minúsculas y quita espacios y símbolos (el login distingue mayúsculas)", () => {
    expect(nombreUsuario("J.Doe 01 !")).toBe("j.doe01");
  });

  it("conserva punto, guion y guion bajo", () => {
    expect(nombreUsuario("ana_maria-1.x")).toBe("ana_maria-1.x");
  });
});

describe("nombreRol", () => {
  it("pasa a mayúsculas y conserva el guion bajo", () => {
    expect(nombreRol("role_auditor")).toBe("ROLE_AUDITOR");
  });

  it("descarta símbolos y junta los espacios seguidos", () => {
    expect(nombreRol("  oficial   segundo #2")).toBe("OFICIAL SEGUNDO 2");
  });
});

describe("clavePermiso", () => {
  it("es una sola palabra en mayúsculas: sin espacios", () => {
    expect(clavePermiso("crear usuarios")).toBe("CREARUSUARIOS");
  });

  it("acepta punto, dos puntos, guion y guion bajo", () => {
    expect(clavePermiso("reporte:ver_todo-1.a")).toBe("REPORTE:VER_TODO-1.A");
  });
});
