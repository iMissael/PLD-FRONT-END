import type { components } from "@/api/schema";

export type CoincidenciaSocio = components["schemas"]["CoincidenciaListaResponse"];
export type PersonaEnLista = components["schemas"]["PersonaEnListaDto"];
export type SocioEnRevision = components["schemas"]["SocioRevisionDto"];

export interface ResolverCoincidenciaPayload {
  es_la_persona: boolean;
  comentario?: string;
}
