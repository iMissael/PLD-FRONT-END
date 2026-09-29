import { describe, expect, it } from "vitest";
import {
  claveSubfactor,
  construirDetalles,
  etiquetaFactor,
  etiquetaSubfactor,
} from "@/features/operacion/evaluacion-riesgo/utils/detalleSubfactor";
import type { EvaluacionRiesgoFormValues } from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgoSchema";

describe("etiquetas", () => {
  it("normaliza acentos, guiones bajos y mayúsculas para buscar la etiqueta", () => {
    expect(claveSubfactor("Ubicacion geografica")).toBe("ubicacion geografica");
    expect(claveSubfactor("ENFOQUE_BASADO_RIESGO")).toBe("enfoque basado riesgo");
  });

  it("traduce los nombres del backend a los de la matriz", () => {
    expect(etiquetaFactor("INFORMACION PERSONAL")).toBe("Información Personal");
    expect(etiquetaFactor("PRODUCTOS SERVICIO")).toBe("Productos y Servicios");
    expect(etiquetaFactor("ENFOQUE_BASADO_RIESGO")).toBe("Enfoque Basado en Riesgo");
    expect(etiquetaSubfactor("Antiguedad giro anios")).toBe(
      "Antigüedad de empleo o en el giro mercantil",
    );
  });

  it("deja legible un nombre desconocido", () => {
    expect(etiquetaSubfactor("NUEVO_CRITERIO")).toBe("Nuevo criterio");
  });
});

describe("construirDetalles", () => {
  const valores = {
    tipoPersonaId: "1",
    nacionalidadId: "165",
    fechaNacimiento: "1985-03-12",
    antiguedadGiroAnios: "12",
    pepNacionalId: "",
    actividadEconomicaId: "10",
    creditoTipo: "2",
    monto: "20000",
    moneda: "MXN",
    origenRecursos: "3",
    destinoRecursos: "4",
    canalPagoId: "1",
    ebrSoluciones: "BAJO",
    creditosAnteriores: [],
  } as unknown as EvaluacionRiesgoFormValues;

  const catalogos = {
    tiposPersona: [{ id: "1", nombre: "Persona Física Nacional" }],
    paises: [{ idPais: "165", nombre: "México" }],
    actividades: [{ id: "10", descripcion: "CULTIVO DE SOYA" }],
    tiposCredito: [{ id: "2", nombre: "CREDINOMINA" }],
    origenes: [{ id: "3", nombre: "SUELDO" }],
    destinos: [{ id: "4", nombre: "CONSUMO" }],
    canales: [{ id: "1", nombre: "SUCURSAL" }],
    nombreLocalidad: "AGUASCALIENTES",
  };

  it("arma el detalle de cada subfactor con lo capturado", () => {
    const detalles = construirDetalles(valores, catalogos, new Date(2026, 8, 25));
    expect(detalles["ubicacion geografica"]).toBe("Localidad: AGUASCALIENTES");
    expect(detalles["tipo persona"]).toBe("Persona Física Nacional");
    expect(detalles.edad).toBe("41 años");
    expect(detalles.nacionalidad).toBe("México");
    expect(detalles["antiguedad giro anios"]).toBe("12 años");
    expect(detalles["es pep nacional"]).toBe("No es PEP nacional");
    expect(detalles["actividad economica"]).toBe("CULTIVO DE SOYA");
    expect(detalles["tipo credito"]).toBe("CREDINOMINA");
    expect(detalles.historial).toBe("Sin historial crediticio");
    expect(detalles["origen recursos"]).toBe("SUELDO");
    expect(detalles["destino recursos"]).toBe("CONSUMO");
    expect(detalles["canales pago"]).toBe("SUCURSAL");
    expect(detalles["soluciones ebr"]).toBe("BAJO");
    expect(detalles["monto credito"]).toMatch(/20,000\.00/);
  });

  it("omite lo que no se capturó y marca el historial cuando lo hay", () => {
    const detalles = construirDetalles(
      {
        ...valores,
        fechaNacimiento: "",
        origenRecursos: "",
        creditosAnteriores: [{ referencia: "H1" }],
      },
      { ...catalogos, nombreLocalidad: undefined },
    );
    expect(detalles.edad).toBeUndefined();
    expect(detalles["origen recursos"]).toBeUndefined();
    expect(detalles["ubicacion geografica"]).toBeUndefined();
    expect(detalles.historial).toBe("Cliente con historial");
  });
});
