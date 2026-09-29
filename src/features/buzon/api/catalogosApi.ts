import { apiClient } from "@/api/client";
import type { RazonAlerta, TipoAlertaBuzon } from "../types/catalogos";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store",
};

export const FALLBACK_TIPOS_ALERTA: TipoAlertaBuzon[] = [
  { id: 1, nombre: "INUSUAL", descripcion: "Operación Inusual", buzon: "S", estatus: "A" },
  { id: 2, nombre: "PREOCUPANTE", descripcion: "Operación Preocupante", buzon: "S", estatus: "A" },
  { id: 3, nombre: "CORRUPCION", descripcion: "Fraude Interno / Corrupción", buzon: "S", estatus: "A" },
  { id: 4, nombre: "INCUMPLIMIENTO", descripcion: "Incumplimiento de Políticas PLD", buzon: "S", estatus: "A" },
];

export const FALLBACK_RAZONES_ALERTA: Record<number, RazonAlerta[]> = {
  1: [
    { id: 1, catTipoAlertaId: 1, nombre: "01", descripcionRazonAlerta: "Movimientos inusuales de efectivo", estatus: "A" },
    { id: 2, catTipoAlertaId: 1, nombre: "02", descripcionRazonAlerta: "Transferencias sin justificación operativa", estatus: "A" },
  ],
  2: [
    { id: 3, catTipoAlertaId: 2, nombre: "03", descripcionRazonAlerta: "Documentación alterada o apócrifa", estatus: "A" },
    { id: 4, catTipoAlertaId: 2, nombre: "04", descripcionRazonAlerta: "Ocultamiento de beneficiario final", estatus: "A" },
  ],
  3: [
    { id: 5, catTipoAlertaId: 3, nombre: "05", descripcionRazonAlerta: "Conflicto de interés no declarado", estatus: "A" },
    { id: 6, catTipoAlertaId: 3, nombre: "06", descripcionRazonAlerta: "Aceptación de incentivos no autorizados", estatus: "A" },
  ],
  4: [
    { id: 7, catTipoAlertaId: 4, nombre: "07", descripcionRazonAlerta: "Omisión intencionada de reportes PLD", estatus: "A" },
  ],
};

export async function getTiposAlertaBuzon(signal?: AbortSignal): Promise<TipoAlertaBuzon[]> {
  try {
    const { data } = await apiClient.get<TipoAlertaBuzon[]>(
      "/api/catalogos/tipos-alerta/buzon",
      { headers: NO_CACHE_HEADERS, signal },
    );
    return data && data.length > 0 ? data : FALLBACK_TIPOS_ALERTA;
  } catch {
    // Si el backend requiere autenticación (401) en catálogos, usar fallback público
    return FALLBACK_TIPOS_ALERTA;
  }
}

export async function getRazonesAlertaPorTipo(
  tipoAlertaId: number,
  signal?: AbortSignal,
): Promise<RazonAlerta[]> {
  try {
    const { data } = await apiClient.get<RazonAlerta[]>(
      `/api/catalogos/razones-alerta/tipo-alerta/${tipoAlertaId}`,
      { headers: NO_CACHE_HEADERS, signal },
    );
    return data && data.length > 0 ? data : (FALLBACK_RAZONES_ALERTA[tipoAlertaId] ?? FALLBACK_RAZONES_ALERTA[1]!);
  } catch {
    // Si el backend requiere autenticación (401), usar fallback de razones
    return FALLBACK_RAZONES_ALERTA[tipoAlertaId] ?? FALLBACK_RAZONES_ALERTA[1]!;
  }
}
