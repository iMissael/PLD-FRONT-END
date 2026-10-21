import type { components } from "@/api/schema";

export type PermisoResponse = components["schemas"]["PermisoResponse"];
export type CrearPermisoRequest = components["schemas"]["CrearPermisoRequest"];
export type ActualizarPermisoRequest = components["schemas"]["ActualizarPermisoRequest"];

/** `GET /permisos`: filtra por recurso o descripción (ver PermisoJpaAdapter.filtro). */
export interface FiltroPermisos {
  busqueda?: string;
}

/** La paginación de `GET /permisos` la hace el backend (igual que los catálogos), no el frontend. */
export interface PaginaPermisos {
  contenido: PermisoResponse[];
  pagina: number;
  tamanio: number;
  totalElementos: number;
  totalPaginas: number;
}
