export type TipoNotificacion =
  "REPORTE_CNBV" | "DICTAMEN_POR_VENCER" | "TRIMESTRAL_RELEVANTES";

export interface Notificacion {
  id: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  enlace: string | null;
  fecha: string;
  creadaEn: string;
  leida: boolean;
}

export interface PaginaNotificaciones {
  contenido: Notificacion[];
  pagina: number;
  tamanio: number;
  totalElementos: number;
  totalPaginas: number;
}
