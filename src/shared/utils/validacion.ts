import { z } from "zod";
import { calcularEdad, hoyIso } from "@/shared/utils/fechas";

// Ayudantes de validación de los formularios que capturan personas (oficial de cumplimiento
// y usuarios). Los máximos que se pasan son los de las columnas de la base de datos: el backend
// no los valida y un texto más largo terminaría en un error 500 al guardar.

export const PATRON_NOMBRE = /^[\p{L}\p{M} .'’-]+$/u;
export const PATRON_RFC = /^([A-ZÑ&]{3}|[A-ZÑ&]{4})\d{6}[A-Z0-9]{3}$/;
export const PATRON_CURP = /^[A-Z]{4}\d{6}[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d$/;
export const PATRON_NUMERO_DOMICILIO = /^[A-ZÑ0-9/ -]+$/;
export const PATRON_CLAVE = /^[A-Z0-9-]+$/;

export const MENSAJE_NOMBRE = "Solo letras, espacios, punto, apóstrofo o guion";

const ANIO_MINIMO = 1900;

/** Texto opcional con límite de largo. */
export function texto(maximo: number) {
  return z.string().trim().max(maximo, `Máximo ${maximo} caracteres`).optional();
}

/** Texto opcional que, si se captura, debe cumplir el patrón. */
export function conFormato(maximo: number, patron: RegExp, mensaje: string) {
  // Un solo chequeo para controlar el orden: primero el formato ("exactamente
  // 10 dígitos" orienta más que "máximo 10 caracteres") y luego el largo.
  return z
    .string()
    .trim()
    .superRefine((valor, contexto) => {
      if (valor !== "" && !patron.test(valor)) {
        contexto.addIssue({ code: z.ZodIssueCode.custom, message: mensaje });
      }
      if (valor.length > maximo) {
        contexto.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Máximo ${maximo} caracteres`,
        });
      }
    })
    .optional();
}

export function fechaNoFutura(mensaje: string) {
  return z
    .string()
    .refine((valor) => !valor || valor <= hoyIso(), mensaje)
    .optional();
}

/** Fecha de nacimiento opcional: válida, posterior a 1900 y de alguien con la edad mínima. */
export function fechaNacimiento(edadMinima: number, mensajeEdad: string) {
  return z
    .string()
    .refine(
      (valor) =>
        !valor || (calcularEdad(valor) !== null && valor >= `${ANIO_MINIMO}-01-01`),
      "La fecha de nacimiento no es válida",
    )
    .refine(
      (valor) => !valor || (calcularEdad(valor) ?? edadMinima) >= edadMinima,
      mensajeEdad,
    )
    .optional();
}

export function esCoordenada(valor: string | undefined, limite: number) {
  if (!valor) return true;
  if (!/^-?\d{1,3}(\.\d+)?$/.test(valor)) return false;
  return Math.abs(Number(valor)) <= limite;
}

/** Una coordenada sola no sirve para ubicar el domicilio: van las dos o ninguna. */
export function coordenadasEnPar(
  valores: { latitud?: string; longitud?: string },
  contexto: z.RefinementCtx,
) {
  const latitud = valores.latitud?.trim();
  const longitud = valores.longitud?.trim();
  if (latitud && !longitud) {
    contexto.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["longitud"],
      message: "Captura también la longitud",
    });
  }
  if (longitud && !latitud) {
    contexto.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["latitud"],
      message: "Captura también la latitud",
    });
  }
}

/** Coordenada opcional dentro de ±`limite` grados. */
export function coordenadaEnRango(limite: number, mensaje: string) {
  return z
    .string()
    .trim()
    .refine((valor) => esCoordenada(valor, limite), mensaje)
    .optional();
}
