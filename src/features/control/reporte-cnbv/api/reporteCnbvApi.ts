import { apiClient } from "@/api/client";
import type { Alerta } from "@/features/alertas/types/alertas";

export type TipoReporteCnbv = "IP" | "I" | "R";

export async function listarAlertasPorReportar(
  tipo: Exclude<TipoReporteCnbv, "R">,
): Promise<Alerta[]> {
  const { data } = await apiClient.get<Alerta[]>("/reportes-cnbv/alertas", {
    params: { tipo },
  });
  return data;
}

/** `ColumnaReporteCnbvResponse`: una de las 36 columnas del layout oficial, para la previsualización. */
export interface ColumnaReporteCnbv {
  numero: number;
  etiqueta: string;
  valor: string;
}

export async function obtenerPrevisualizacionReporteCnbv(
  alertaId: number,
): Promise<ColumnaReporteCnbv[]> {
  const { data } = await apiClient.get<ColumnaReporteCnbv[]>(
    `/reportes-cnbv/alertas/${alertaId}/previsualizacion`,
  );
  return data;
}

/** Nombre de archivo tomado de `Content-Disposition`, con el contenido como texto plano. */
export async function descargarArchivoReporteCnbv(
  alertaId: number,
): Promise<{ nombreArchivo: string; contenido: Blob }> {
  const { data, headers } = await apiClient.get<Blob>(
    `/reportes-cnbv/alertas/${alertaId}/archivo`,
    { responseType: "blob" },
  );
  const disposicion: string = headers["content-disposition"] ?? "";
  const coincidencia = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposicion);
  const nombreArchivo = coincidencia?.[1]
    ? decodeURIComponent(coincidencia[1])
    : `reporte-cnbv-${alertaId}.txt`;
  return { nombreArchivo, contenido: data };
}
