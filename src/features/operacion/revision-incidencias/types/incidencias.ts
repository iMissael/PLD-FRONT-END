import type { components } from "@/api/schema";

/** Igual a `CoincidenciaListaResponse` del backend. */
export type CoincidenciaSocio = components["schemas"]["CoincidenciaListaResponse"];
export type PersonaEnLista = components["schemas"]["PersonaEnListaDto"];
export type SocioEnRevision = components["schemas"]["SocioRevisionDto"];
/** Otro socio con nombre igual o parecido a este, detectado al dar de alta/actualizar un socio. */
export type DuplicadoSocio = components["schemas"]["DuplicadoSocioDto"];
/** Una persona relacionada del socio (cónyuge, propietario real, etc.) con coincidencia en lista. */
export type PersonaRelacionadaCoincidencia = components["schemas"]["PersonaRelacionadaCoincidenciaDto"];

export type DecisionRiesgoPais = "CONFIRMADO" | "MINIMIZADO";

/**
 * `es_la_persona` se omite cuando solo se resuelve riesgo-pais (sin coincidencia en lista negra/
 * bloqueadas por revisar). `pais_nacimiento_decision`/`nacionalidad_decision` son informativos:
 * nunca bloquean al socio.
 */
export interface ResolverIncidenciaPayload {
  es_la_persona?: boolean;
  pais_nacimiento_decision?: DecisionRiesgoPais;
  nacionalidad_decision?: DecisionRiesgoPais;
  comentario?: string;
}

/**
 * Decisión del oficial sobre un socio con nombre igual o parecido a otro. A diferencia de
 * `ResolverIncidenciaPayload`, es informativo: nunca bloquea ni modifica a ningún socio, solo
 * queda constancia de la decisión.
 */
export interface ResolverDuplicadoPayload {
  misma_persona: boolean;
  comentario?: string;
}

/**
 * Decisión del oficial sobre una persona relacionada del socio con coincidencia en lista.
 * Informativo: igual que `ResolverDuplicadoPayload`, nunca bloquea ni modifica al socio.
 */
export interface ResolverPersonaRelacionadaPayload {
  es_la_persona: boolean;
  comentario?: string;
}
