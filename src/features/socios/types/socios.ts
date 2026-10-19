import type { components } from "@/api/schema";

export type AcreditadoExterno = components["schemas"]["AcreditadoInfo"];
export type AcreditadoPerfilRiesgo = components["schemas"]["AcreditadoPerfilRiesgoResponse"];

export type CriterioBusquedaAcreditado = "referencia" | "nombre" | "rfc";

/** "fisica" incluye actividad empresarial. Sin valor no se filtra. */
export type TipoPersonaBusqueda = "fisica" | "moral"; 

export interface BusquedaAcreditados {
  criterio: CriterioBusquedaAcreditado;
  valor: string;
  tipoPersona?: TipoPersonaBusqueda;
  pagina: number;
  tamanio: number;
}

/** `GET /acreditados/pagina`. */
export interface PaginaAcreditados {
  contenido: AcreditadoExterno[];
  pagina: number;
  tamanio: number;
  totalElementos: number;
  totalPaginas: number;
}
