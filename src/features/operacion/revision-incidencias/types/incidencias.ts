import type { components } from "@/api/schema";

/** Igual a `CoincidenciaListaResponse` del backend. */
export type CoincidenciaSocio = components["schemas"]["CoincidenciaListaResponse"];
export type PersonaEnLista = components["schemas"]["PersonaEnListaDto"];
export type SocioEnRevision = components["schemas"]["SocioRevisionDto"];

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
