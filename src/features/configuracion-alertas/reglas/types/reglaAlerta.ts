export type EstadoRegla = "ACTIVO" | "INACTIVO";

export type TipoPersonaRegla = "F" | "FA" | "M";

export type FormaPagoRegla = "E" | "T" | "*" | ".";

export type Moneda = "MXN" | "USD";

export type AplicaRegla = "C" | "E" | "A";

export interface ReglaAlerta {
  idConfiguracionAlerta: string;
  alertaAcronimo: string;
  tipoAlertaDescripcion: string | null;
  descripcion: string;
  fkPldCatRazonAlerta: number;
  razonAlertaNumero: string | null;
  razonAlertaDescripcion: string | null;
  importe: number;
  importeMonedaAcronimo: string;
  equivalenteMonedaAcronimo: string | null;
  tipoPersona: string;
  formaPago: string;
  acumulado: "S" | "N";
  automatica: "S" | "N";
  aplica: AplicaRegla;
  estado: EstadoRegla;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface GuardarReglaInput {
  alertaAcronimo: string;
  descripcion: string;
  fkPldCatRazonAlerta: number;
  importe: number;
  importeMonedaAcronimo: string;
  equivalenteMonedaAcronimo: string;
  tipoPersona: string;
  formaPago: string;
  acumulado: "S" | "N";
  automatica: "S" | "N";
  aplica: AplicaRegla;
  estado: EstadoRegla;
}

export interface FiltroReglas {
  busqueda?: string;
  alertaAcronimo?: string;
  estado?: EstadoRegla;
}

export interface PaginaReglas {
  contenido: ReglaAlerta[];
  pagina: number;
  tamanio: number;
  totalElementos: number;
  totalPaginas: number;
}
