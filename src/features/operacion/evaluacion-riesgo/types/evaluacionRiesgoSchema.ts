import { z } from "zod";

const creditoAnteriorSchema = z.object({
  referencia: z.string().optional(),
  tipo: z.string().optional(),
  monto: z.string().optional(),
  moneda: z.string().optional(),
  fechaOtorgamiento: z.string().optional(),
  estatus: z.string().optional(),
});

export const evaluacionRiesgoSchema = z.object({
  // Socio
  socioReferencia: z.string().min(1, "Selecciona un socio"),
  socioNombre: z.string().min(1, "Selecciona un socio"),
  // Los provee el perfil del socio (no se capturan): la consulta de listas los compara por separado.
  socioNombres: z.string().optional(),
  socioApellidoP: z.string().optional(),
  socioApellidoM: z.string().optional(),
  rfc: z.string().optional(),
  curp: z.string().optional(),
  tipoPersonaId: z.string().min(1, "Selecciona el tipo de persona"),
  nacionalidadId: z.string().min(1, "Selecciona la nacionalidad"),
  fechaNacimiento: z.string().min(1, "La fecha de nacimiento es obligatoria"),
  antiguedadGiroAnios: z.string().min(1, "La antigüedad es obligatoria"),
  pepNacionalId: z.string().optional(),
  actividadEconomicaId: z.string().min(1, "Selecciona la actividad económica"),

  // Domicilio
  paisId: z.string().optional(),
  entidadId: z.string().optional(),
  municipioId: z.string().optional(),
  localidadId: z.string().min(1, "Selecciona la localidad"),
  calle: z.string().optional(),
  tipoCalle: z.string().optional(),
  noExterior: z.string().optional(),
  noInterior: z.string().optional(),
  codigoPostal: z.string().optional(),
  asentamientoTipo: z.string().optional(),
  asentamientoNombre: z.string().optional(),
  latitud: z.string().optional(),
  longitud: z.string().optional(),

  // Crédito
  creditoReferencia: z.string().optional(),
  creditoTipo: z.string().min(1, "Selecciona el tipo de crédito"),
  monto: z.string().min(1, "El monto es obligatorio"),
  moneda: z.string().optional(),
  origenRecursos: z.string().min(1, "Selecciona el origen de los recursos"),
  destinoRecursos: z.string().min(1, "Selecciona el destino de los recursos"),
  canalPagoId: z.string().min(1, "Selecciona el canal de pago"),
  tipoPagoId: z.string().optional(),
  ebrSoluciones: z.string().optional(),

  creditosAnteriores: z.array(creditoAnteriorSchema),
});

export type CreditoAnteriorFormValues = z.infer<typeof creditoAnteriorSchema>;
export type EvaluacionRiesgoFormValues = z.infer<typeof evaluacionRiesgoSchema>;
