import { z } from "zod";
import {
  conFormato,
  fechaNacimiento,
  fechaNoFutura,
  MENSAJE_NOMBRE,
  PATRON_CLAVE,
  PATRON_CURP,
  PATRON_NOMBRE,
  PATRON_NUMERO_DOMICILIO,
  PATRON_RFC,
  texto,
} from "@/shared/utils/validacion";

// Los máximos son los de las columnas de la base de datos (ver shared/utils/validacion.ts).

const EDAD_MINIMA = 18;

export const oficialCumplimientoSchema = z
  .object({
    // Datos generales
    nombre: z
      .string()
      .trim()
      .min(1, "El nombre es obligatorio")
      .max(150, "Máximo 150 caracteres")
      .regex(PATRON_NOMBRE, MENSAJE_NOMBRE),
    primerApellido: conFormato(100, PATRON_NOMBRE, MENSAJE_NOMBRE),
    segundoApellido: conFormato(100, PATRON_NOMBRE, MENSAJE_NOMBRE),
    nacionalidad: z.string().min(1, "La nacionalidad es obligatoria"),
    paisNacimientoId: z.string().optional(),
    entidadNacimientoId: z.string().optional(),
    lugarDeNacimiento: texto(100),
    fechaNacimiento: fechaNacimiento(
      EDAD_MINIMA,
      `El oficial debe ser mayor de ${EDAD_MINIMA} años`,
    ),
    genero: z.string().max(20, "Máximo 20 caracteres").optional(),
    rfc: conFormato(
      13,
      PATRON_RFC,
      "RFC inválido: 3 o 4 letras, 6 dígitos de fecha y 3 de homoclave (12 o 13 caracteres)",
    ),
    curp: conFormato(
      18,
      PATRON_CURP,
      "CURP inválida: debe tener 18 caracteres con el formato oficial",
    ),
    estadoCivil: z.string().optional(),
    numDependientes: conFormato(2, /^\d{1,2}$/, "Solo números enteros, de 0 a 99"),
    nivelEstudios: z.string().optional(),
    tipoIdentificacion: z.string().optional(),
    folioIdentificacion: conFormato(50, /^[A-Z0-9]+$/, "Solo letras y números"),
    telefono: conFormato(10, /^\d{10}$/, "El teléfono debe tener exactamente 10 dígitos"),
    correo: z
      .string()
      .trim()
      .max(150, "Máximo 150 caracteres")
      .refine(
        (valor) => valor === "" || z.string().email().safeParse(valor).success,
        "Correo inválido",
      )
      .optional(),

    // Domicilio
    tipoComprobante: z.string().optional(),
    tipoVialidad: z.string().optional(),
    calle: texto(100),
    numExterior: conFormato(
      10,
      PATRON_NUMERO_DOMICILIO,
      'Solo letras, números, "/" o "-"',
    ),
    numInterior: conFormato(
      10,
      PATRON_NUMERO_DOMICILIO,
      'Solo letras, números, "/" o "-"',
    ),
    nombreCalleIzquierda: texto(50),
    nombreCalleDerecha: texto(50),
    referencia: texto(100),
    posesionVivienda: z.string().optional(),
    antiguedadDomicilio: fechaNoFutura("La fecha no puede ser futura"),
    codigoPostal: conFormato(5, /^\d{5}$/, "El código postal debe tener 5 dígitos"),
    tipoAsentamiento: texto(50),
    colonia: texto(100),
    domicilioPaisId: z.string().min(1, "El país es obligatorio"),
    domicilioEntidadId: z.string().min(1, "La entidad es obligatoria"),
    municipioId: z.string().min(1, "El municipio es obligatorio"),
    localidadId: z.string().min(1, "La localidad es obligatoria"),

    // Parámetros PLD (datos de oficial)
    tipoPersona: z.string().min(1, "El tipo de persona es obligatorio"),
    claveDelOficialDeCumplimiento: conFormato(
      12,
      PATRON_CLAVE,
      "Solo letras, números y guion",
    ),
    claveDelSujetoObligado: z
      .string()
      .trim()
      .min(1, "La clave del sujeto obligado es obligatoria")
      .max(50, "Máximo 50 caracteres")
      .regex(PATRON_CLAVE, "Solo letras, números y guion"),
    claveOrganoSuperior: z
      .string()
      .trim()
      .min(1, "La clave del órgano supervisor es obligatoria")
      .max(50, "Máximo 50 caracteres")
      .regex(PATRON_CLAVE, "Solo letras, números y guion"),
    monedaDeOperacionPrincipal: conFormato(
      3,
      /^[A-Z]{3}$/,
      "Usa el código de 3 letras, por ejemplo MXN",
    ),
    actividadEconomicaId: z.string().optional(),
  });

export type OficialCumplimientoFormValues = z.infer<typeof oficialCumplimientoSchema>;
