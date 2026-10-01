import { z } from "zod";
import {
  MENSAJE_NOMBRE,
  PATRON_CURP,
  PATRON_NOMBRE,
  PATRON_RFC,
  conFormato,
  fechaNoFutura,
} from "@/shared/utils/validacion";

export const consultaListasSchema = z
  .object({
    tipoPersona: z.enum(["FISICA", "MORAL"]),
    nombre: z
      .string()
      .trim()
      .min(1, "El nombre es obligatorio")
      .max(150, "Máximo 150 caracteres"),
    primerApellido: conFormato(100, PATRON_NOMBRE, MENSAJE_NOMBRE),
    segundoApellido: conFormato(100, PATRON_NOMBRE, MENSAJE_NOMBRE),
    fechaConstitucion: fechaNoFutura("La fecha de constitución no puede ser futura"),
    rfc: conFormato(13, PATRON_RFC, "RFC inválido: 3 o 4 letras, 6 dígitos de fecha y 3 de homoclave (12 o 13 caracteres)"),
    curp: conFormato(18, PATRON_CURP, "CURP inválida: debe tener 18 caracteres con el formato oficial"),
  })
  .superRefine((valores, ctx) => {
    // La razón social de una persona moral admite "&", comas, números, etc.
    if (valores.tipoPersona === "FISICA" && !PATRON_NOMBRE.test(valores.nombre)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["nombre"], message: MENSAJE_NOMBRE });
    }
  });

export type ConsultaListasFormValues = z.infer<typeof consultaListasSchema>;
