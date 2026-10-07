/**
 * Sistemas satélite (Socios, Ventas, Cobranza...) que consumen la API de integración,
 * igual a los DTOs de `SistemaIntegracionController` (`/integraciones`).
 */

/** A = activo, B = baja (no puede pedir tokens nuevos). */
export type EstatusSistema = "A" | "B" | (string & {});

export interface CredencialResponse {
  id: number;
  etiqueta: string | null;
  expiraEn: string;
  revocadaEn: string | null;
  ultimoUsoEn: string | null;
  creadaEn: string;
  vigente: boolean;
}

export interface SistemaIntegracionResponse {
  id: number;
  clientId: string;
  nombre: string;
  estatus: EstatusSistema;
  scopes: string[];
  credenciales: CredencialResponse[];
  creadoEn: string;
}

export interface RegistrarSistemaInput {
  clientId: string;
  nombre: string;
  scopes: string[];
}

export interface ActualizarSistemaInput {
  nombre: string;
  scopes: string[];
}

export interface EmitirCredencialInput {
  etiqueta?: string;
  vigenciaDias?: number;
}

/** El secreto solo viaja en esta respuesta; el backend no lo vuelve a mostrar. */
export interface CredencialEmitidaResponse {
  clientId: string;
  clientSecret: string;
  credencial: CredencialResponse;
  aviso: string;
}

/** Qué permite cada scope, para mostrarlo junto a la casilla. */
export const DESCRIPCION_SCOPE: Record<string, string> = {
  "socios:read": "Consultar socios",
  "socios:write": "Enviar altas y cambios de socios",
  "evaluaciones:read": "Consultar evaluaciones",
  "evaluaciones:write": "Pedir evaluaciones de riesgo",
  "solicitudes:read": "Consultar el estado de sus solicitudes",
};

/** Mismas reglas que el backend: 3 a 50 caracteres, empieza con letra, minúsculas, números y guiones. */
export const CLIENT_ID_REGEX = /^[a-z][a-z0-9-]{2,49}$/;

/** Máximo de credenciales vigentes por sistema (para rotar sin cortes). */
export const MAX_CREDENCIALES_VIGENTES = 2;
