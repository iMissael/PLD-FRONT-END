import { z } from "zod";

const numeroPorcentaje = z
  .string()
  .min(1, "Requerido")
  .refine((valor) => !Number.isNaN(Number(valor)), "Debe ser un número")
  .refine(
    (valor) => Number(valor) >= 0 && Number(valor) <= 100,
    "Debe estar entre 0 y 100",
  );

export const subfactorFormSchema = z.object({
  id: z.number(),
  descripcion: z.string(),
  ponderacion: numeroPorcentaje,
  estatus: z.enum(["A", "INA"]),
});

export const factorFormSchema = z.object({
  id: z.number(),
  descripcion: z.string(),
  peso: numeroPorcentaje,
  estatus: z.enum(["A", "INA"]),
  subfactores: z
    .array(subfactorFormSchema)
    .min(1, "El factor debe tener al menos un subfactor"),
});

export const matrizRiesgoFormSchema = z.object({
  factores: z.array(factorFormSchema).min(1, "La matriz debe tener al menos un factor"),
});

export type SubfactorFormValues = z.infer<typeof subfactorFormSchema>;
export type FactorFormValues = z.infer<typeof factorFormSchema>;
export type MatrizRiesgoFormValues = z.infer<typeof matrizRiesgoFormSchema>;
