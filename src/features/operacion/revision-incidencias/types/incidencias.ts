import type { components } from "@/api/schema";

/** Igual a `CoincidenciaListaResponse` del backend. */
export type CoincidenciaAcreditado = components["schemas"]["CoincidenciaListaResponse"];
export type PersonaEnLista = components["schemas"]["PersonaEnListaDto"];
export type AcreditadoEnRevision = components["schemas"]["AcreditadoRevisionDto"];
/** Otro acreditado con nombre igual o parecido a este, detectado al dar de alta/actualizar un acreditado. */
export type DuplicadoAcreditado = components["schemas"]["DuplicadoAcreditadoDto"];
/** Una persona relacionada del acreditado (cónyuge, propietario real, etc.) con coincidencia en lista. */
export type PersonaRelacionadaCoincidencia = components["schemas"]["PersonaRelacionadaCoincidenciaDto"];

export type DecisionRiesgoPais = "CONFIRMADO" | "MINIMIZADO";

/**
 * `es_la_persona` se omite cuando solo se resuelve riesgo-pais (sin coincidencia en lista negra/
 * bloqueadas por revisar). `pais_nacimiento_decision`/`nacionalidad_decision` son informativos:
 * nunca bloquean al acreditado.
 */
export interface ResolverIncidenciaPayload {
  es_la_persona?: boolean;
  pais_nacimiento_decision?: DecisionRiesgoPais;
  nacionalidad_decision?: DecisionRiesgoPais;
  comentario?: string;
}

/**
 * Decisión del oficial sobre un acreditado con nombre igual o parecido a otro. A diferencia de
 * `ResolverIncidenciaPayload`, es informativo: nunca bloquea ni modifica a ningún acreditado, solo
 * queda constancia de la decisión.
 */
export interface ResolverDuplicadoPayload {
  misma_persona: boolean;
  comentario?: string;
}

/**
 * Decisión del oficial sobre una persona relacionada del acreditado con coincidencia en lista.
 * Informativo: igual que `ResolverDuplicadoPayload`, nunca bloquea ni modifica al acreditado.
 */
export interface ResolverPersonaRelacionadaPayload {
  es_la_persona: boolean;
  comentario?: string;
}
