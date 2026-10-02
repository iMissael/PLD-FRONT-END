import type { Moneda } from "../types/reglaAlerta";

/**
 * Las reglas guardan listas como texto con el formato de Sicanet: "['F', 'FA', 'M']".
 * El evaluador del backend lee los códigos entre comillas simples, así que hay que
 * respetar ese formato al guardar.
 */
export function leerLista(texto: string | null | undefined): string[] {
  if (!texto) return [];
  return Array.from(texto.matchAll(/'([^']*)'/g), (m) =>
    (m[1] ?? "").trim().toUpperCase(),
  ).filter(Boolean);
}

export function escribirLista(codigos: string[]): string {
  return codigos.length === 0 ? "" : `[${codigos.map((c) => `'${c}'`).join(", ")}]`;
}

export interface MonedasRegla {
  permitidas: Moneda[];
  noPermitidas: Moneda[];
}

/**
 * "Configuración de monedas": a qué moneda de la OPERACIÓN aplica la regla.
 * JSON {"permitido":[{"moneda_acronimo":"MXN"}],"no_permitido":[...]}; vacío = todas.
 * Monedas que no sean MXN/USD (Sicanet trae "PSD" en una regla) se descartan: el
 * sistema solo opera esas dos.
 */
export function leerMonedas(json: string | null | undefined): MonedasRegla {
  const vacio: MonedasRegla = { permitidas: [], noPermitidas: [] };
  if (!json) return vacio;
  try {
    const datos = JSON.parse(json) as Record<
      string,
      { moneda_acronimo?: string }[] | undefined
    >;
    const extraer = (lista: { moneda_acronimo?: string }[] | undefined) =>
      (lista ?? [])
        .map((m) => (m.moneda_acronimo ?? "").toUpperCase())
        .filter((m): m is Moneda => m === "MXN" || m === "USD");
    return {
      permitidas: extraer(datos.permitido),
      noPermitidas: extraer(datos.no_permitido),
    };
  } catch {
    return vacio;
  }
}

export function escribirMonedas({ permitidas, noPermitidas }: MonedasRegla): string {
  const datos: Record<string, { moneda_acronimo: string }[]> = {};
  if (permitidas.length)
    datos.permitido = permitidas.map((m) => ({ moneda_acronimo: m }));
  if (noPermitidas.length)
    datos.no_permitido = noPermitidas.map((m) => ({ moneda_acronimo: m }));
  return Object.keys(datos).length === 0 ? "" : JSON.stringify(datos);
}

/** Texto corto para la tabla: "Operaciones en MXN", "Todas menos MXN", "Todas". */
export function describirMonedas(json: string | null | undefined): string {
  const { permitidas, noPermitidas } = leerMonedas(json);
  if (permitidas.length) return `Operaciones en ${permitidas.join(", ")}`;
  if (noPermitidas.length) return `Todas menos ${noPermitidas.join(", ")}`;
  return "Todas";
}
