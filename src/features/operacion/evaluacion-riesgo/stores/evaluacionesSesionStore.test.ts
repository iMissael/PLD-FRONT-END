import { describe, expect, it } from "vitest";
import {
  evaluacionVigente,
  type EvaluacionDeSesion,
} from "@/features/operacion/evaluacion-riesgo/stores/evaluacionesSesionStore";
import { cambiaElRiesgo } from "@/features/operacion/evaluacion-riesgo/stores/invalidarEvaluaciones";

const evaluacion = {
  resultado: { id_configuracion_matriz_riesgo: 1, puntuacion_total: 15.06 },
} as EvaluacionDeSesion;

describe("evaluacionVigente", () => {
  it("conserva la evaluación calculada con la matriz activa", () => {
    expect(evaluacionVigente(evaluacion, 1)).toBe(evaluacion);
  });

  it("descarta la evaluación si se publicó otra versión de la matriz", () => {
    expect(evaluacionVigente(evaluacion, 2)).toBeUndefined();
  });

  it("mientras no se conoce la matriz activa la da por vigente", () => {
    expect(evaluacionVigente(evaluacion, undefined)).toBe(evaluacion);
  });

  it("sin evaluación guardada no hay nada vigente", () => {
    expect(evaluacionVigente(undefined, 1)).toBeUndefined();
  });
});

describe("cambiaElRiesgo", () => {
  it("detecta cambios a catálogos y publicación de matriz", () => {
    expect(cambiaElRiesgo("put", "/SICANETSC/PLD/t1/catalogos/tipos-credito/1")).toBe(true);
    expect(cambiaElRiesgo("POST", "/SICANETSC/PLD/t1/configuracion-matriz")).toBe(true);
    expect(cambiaElRiesgo("delete", "/SICANETSC/PLD/t1/catalogos/peps/3")).toBe(true);
  });

  it("ignora lecturas y escrituras que no afectan el riesgo", () => {
    expect(cambiaElRiesgo("get", "/SICANETSC/PLD/t1/catalogos/tipos-credito")).toBe(false);
    expect(cambiaElRiesgo("post", "/SICANETSC/PLD/t1/pld/evaluaciones")).toBe(false);
    expect(cambiaElRiesgo("put", "/SICANETSC/PLD/t1/usuarios/3")).toBe(false);
  });
});
