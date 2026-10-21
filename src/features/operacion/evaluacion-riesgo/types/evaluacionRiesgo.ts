import type { components } from "@/api/schema";

export type EvaluacionRiesgoSolicitud =
  components["schemas"]["EvaluacionRiesgoSolicitudDto"];
export type EvaluacionRiesgoResultado =
  components["schemas"]["EvaluacionRiesgoResponseDto"];
export type PuntajeFactor = components["schemas"]["PuntajeFactor"];
export type PuntajeSubfactor = components["schemas"]["PuntajeSubfactor"];
export type NivelRiesgo = components["schemas"]["NivelRiesgoDto"];
export interface ModificarNivelRiesgoInput {
  cat_nivel_riesgo_id: number;
  observaciones: string;
}

/** Datos del acreditado que se muestran en el expediente de la matriz de riesgo. */
export type ClienteMatrizRiesgo = {
  nombre: string;
  numero: string;
  referencia: string;
  rfc: string;
  curp: string;
  persona: "FISICA" | "MORAL";
  tipoCliente: string;
  fechaAlta: string;
  sucursal: string;
  fechaModificacion: string;
};
