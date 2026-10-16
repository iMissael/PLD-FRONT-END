import type { components } from "@/api/schema";

export type SocioExterno = components["schemas"]["SocioInfo"];
export type SocioPerfilRiesgo = components["schemas"]["SocioPerfilRiesgoResponse"];

export type CriterioBusquedaSocio = "referencia" | "nombre" | "rfc";

/** "fisica" incluye actividad empresarial. Sin valor no se filtra. */
export type TipoPersonaBusqueda = "fisica" | "moral"; 

export interface BusquedaSocios {
  criterio: CriterioBusquedaSocio;
  valor: string;
  tipoPersona?: TipoPersonaBusqueda;
  pagina: number;
  tamanio: number;
}

/** `GET /socios/pagina`. */
export interface PaginaSocios {
  contenido: SocioExterno[];
  pagina: number;
  tamanio: number;
  totalElementos: number;
  totalPaginas: number;
}
