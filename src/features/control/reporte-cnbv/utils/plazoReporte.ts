import type {
  Alerta,
  ReportadoAlerta,
  TipoReportado,
} from "@/features/alertas/types/alertas";

export type NivelPlazoReporte = "vencido" | "urgente" | "proximo" | "holgado";

export function nivelPlazoReporte(dias: number): NivelPlazoReporte {
  if (dias < 0) return "vencido";
  if (dias === 0) return "urgente";
  if (dias === 1) return "proximo";
  return "holgado";
}

export function textoDiasHabilesReporte(dias: number): string {
  if (dias < 0) {
    const pasados = Math.abs(dias);
    return `Fuera de plazo: hace ${pasados} ${pasados === 1 ? "día hábil" : "días hábiles"}`;
  }
  if (dias === 0) return "Vence hoy";
  return dias === 1 ? "Queda 1 día hábil" : `Quedan ${dias} días hábiles`;
}

export interface OpcionReportado {
  referencia: string;
  nombre: string;
}

export function reportadosDe(alertas: Alerta[], tipo: TipoReportado): OpcionReportado[] {
  const unicos = new Map<string, OpcionReportado>();
  alertas
    .map((a) => a.reportado)
    .filter((r): r is ReportadoAlerta => r !== null && r.tipoReportado === tipo)
    .forEach((r) =>
      unicos.set(r.referencia, { referencia: r.referencia, nombre: r.nombre }),
    );
  return [...unicos.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, "es-MX"));
}

export function filtrarPorReportado(
  alertas: Alerta[],
  acreditado: string,
  empleado: string,
): Alerta[] {
  return alertas.filter(
    (a) =>
      (!acreditado ||
        (a.reportado?.tipoReportado === "SOCIO" &&
          a.reportado.referencia === acreditado)) &&
      (!empleado ||
        (a.reportado?.tipoReportado === "EMPLEADO" &&
          a.reportado.referencia === empleado)),
  );
}
