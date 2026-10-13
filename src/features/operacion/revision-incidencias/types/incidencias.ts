import type { components } from "@/api/schema";

/** Igual a `CoincidenciaListaResponse` del backend. */
export type CoincidenciaSocio = components["schemas"]["CoincidenciaListaResponse"];
export type PersonaEnLista = components["schemas"]["PersonaEnListaDto"];
export type SocioEnRevision = components["schemas"]["SocioRevisionDto"];

export interface ResolverIncidenciaPayload {
  es_la_persona: boolean;
  comentario?: string;
}
