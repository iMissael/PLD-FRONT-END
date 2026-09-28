import { z } from "zod";

export const consultaListasSchema = z.object({
  nombreCompleto: z.string().min(1, "El nombre completo es obligatorio"),
  nombre: z.string().optional(),
  primerApellido: z.string().optional(),
  segundoApellido: z.string().optional(),
  rfc: z.string().optional(),
  curp: z.string().optional(),
  tipoPersona: z.string().optional(),
});

export type ConsultaListasFormValues = z.infer<typeof consultaListasSchema>;
