import { z } from "zod";

export const consultaListasSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  primerApellido: z.string().optional(),
  segundoApellido: z.string().optional(),
  fechaNacimiento: z.string().optional(),
  rfc: z.string().optional(),
  curp: z.string().optional(),
  tipoPersona: z.string().optional(),
});

export type ConsultaListasFormValues = z.infer<typeof consultaListasSchema>;
