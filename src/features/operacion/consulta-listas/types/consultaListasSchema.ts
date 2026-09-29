import { z } from "zod";
import {
  MENSAJE_NOMBRE,
  PATRON_CURP,
  PATRON_NOMBRE,
  PATRON_RFC,
  conFormato,
} from "@/shared/utils/validacion";

export const consultaListasSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(150, "Máximo 150 caracteres")
    .regex(PATRON_NOMBRE, MENSAJE_NOMBRE),
  primerApellido: conFormato(100, PATRON_NOMBRE, MENSAJE_NOMBRE),
  segundoApellido: conFormato(100, PATRON_NOMBRE, MENSAJE_NOMBRE),
  fechaNacimiento: z.string().optional(),
  rfc: conFormato(13, PATRON_RFC, "RFC inválido: 3 o 4 letras, 6 dígitos de fecha y 3 de homoclave (12 o 13 caracteres)"),
  curp: conFormato(18, PATRON_CURP, "CURP inválida: debe tener 18 caracteres con el formato oficial"),
  tipoPersona: z.string().optional(),
});

export type ConsultaListasFormValues = z.infer<typeof consultaListasSchema>;
