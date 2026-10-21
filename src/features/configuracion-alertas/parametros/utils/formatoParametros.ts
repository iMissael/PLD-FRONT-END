import type { VentanaEnvio } from "../types/parametrosAlerta";

export const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const DIAS_SEMANA = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

export type ParteDelMes = "primeros" | "ultimos";

export function parteDelMes(ventana: VentanaEnvio): ParteDelMes {
  return ventana.maximoDias < 0 ? "ultimos" : "primeros";
}

export function ventanaDesde(
  mes: number,
  parte: ParteDelMes,
  dias: number,
): VentanaEnvio {
  return { mes, maximoDias: parte === "ultimos" ? -Math.abs(dias) : Math.abs(dias) };
}

export function textoVentana(ventana: VentanaEnvio): string {
  const dias = Math.abs(ventana.maximoDias);
  const parte = ventana.maximoDias < 0 ? "últimos" : "primeros";
  return `${MESES[ventana.mes - 1]}: ${parte} ${dias} ${dias === 1 ? "día" : "días"}`;
}

export function textoFechaConDia(fecha: string): string {
  const [anio, mes, dia] = fecha.slice(0, 10).split("-").map(Number);
  if (!anio || !mes || !dia) return fecha;
  const diaSemana = DIAS_SEMANA[new Date(anio, mes - 1, dia).getDay()];
  return `${diaSemana} ${String(dia).padStart(2, "0")}/${String(mes).padStart(2, "0")}/${anio}`;
}

const UNIDAD_PLAZO = {
  naturales: ["natural", "naturales"],
  hábiles: ["hábil", "hábiles"],
} as const;

export function textoPlazo(valor: number, unidad: keyof typeof UNIDAD_PLAZO): string {
  const [singular, plural] = UNIDAD_PLAZO[unidad];
  return valor === 1 ? `1 día ${singular}` : `${valor} días ${plural}`;
}
