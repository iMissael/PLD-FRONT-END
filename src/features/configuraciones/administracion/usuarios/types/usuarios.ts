import type { components } from "@/api/schema";

export type UsuarioResponse = components["schemas"]["UsuarioResponse"];
export type CrearUsuarioRequest = components["schemas"]["CrearUsuarioRequest"];
export type ActualizarUsuarioRequest = components["schemas"]["ActualizarUsuarioRequest"];
// El domicilio de un usuario ahora cuelga de su empleado interno (antes era una tabla
// propia de "usuario"); el endpoint y la forma de los campos no cambiaron, solo el nombre
// del DTO en el backend.
export type DomicilioUsuarioRequest = components["schemas"]["DomicilioEmpleadoInternoRequest"];
export type DomicilioUsuarioResponse =
  components["schemas"]["DomicilioEmpleadoInternoResponse"];

// El backend ya no expone /usuarios/{id}/oficial ni estos DTOs (los datos de oficial de
// cumplimiento se movieron a empleado_interno). Se dejan como tipos locales, sin backend
// real detrás, únicamente para que la feature "oficial-cumplimiento" siga compilando y
// cargando en runtime mientras se decide su rediseño: no reflejan un contrato vigente.
export interface OficialRequest {
  tipoPersona: string;
  claveDelOficialDeCumplimiento?: string;
  claveDelSujetoObligado: string;
  claveOrganoSuperior: string;
  monedaDeOperacionPrincipal?: string;
  actividadEconomicaId?: string;
}

export interface OficialResponse extends OficialRequest {
  idOficial?: number;
  usuarioId?: number;
  estatus?: string;
  createdAt?: string;
  updatedAt?: string;
}
