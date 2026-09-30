import { z } from "zod";
import {
  coordenadaEnRango,
  coordenadasEnPar,
  conFormato,
  fechaNoFutura,
  PATRON_NUMERO_DOMICILIO,
  texto,
} from "@/shared/utils/validacion";

// Los máximos del domicilio son los de las columnas de la tabla domicilio_usuario; el backend
// no los valida y un texto más largo terminaría en un error 500 al guardar.
//
// El usuario ya no captura identidad (nombre, RFC, CURP, domicilio de nacimiento, etc.): esos
// datos viven en `empleado_interno`, una tabla que esta app todavía no puede crear/editar. Por
// eso el alta de usuario solo pide el id del empleado ya existente + sus credenciales de acceso.
export const crearUsuarioSchema = z
  .object({
    // Paso 1 — Empleado y acceso
    empleadoId: z
      .string()
      .trim()
      .min(1, "El id de empleado es obligatorio")
      .max(10, "Máximo 10 dígitos")
      .regex(/^\d+$/, "El id de empleado debe ser numérico"),
    username: z
      .string()
      .trim()
      .min(1, "El username es obligatorio")
      .max(50, "Máximo 50 caracteres")
      .regex(/^[a-z0-9._-]+$/, "Solo minúsculas, números, punto, guion o guion bajo"),
    // bcrypt solo procesa los primeros 72 bytes: una contraseña más larga se rechaza.
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(72, "Máximo 72 caracteres"),
    confirmarPassword: z.string().min(1, "Confirma la contraseña"),
    rolId: z.string().min(1, "El rol es obligatorio"),

    // Paso 2 — Domicilio
    tipoComprobanteId: z.string().optional(),
    tipoVialidadId: z.string().optional(),
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
    laCasaEsId: z.string().optional(),
    antiguedadDomicilio: fechaNoFutura("La fecha no puede ser futura"),
    codigoPostal: conFormato(5, /^\d{5}$/, "El código postal debe tener 5 dígitos"),
    tipoAsentamiento: texto(50),
    colonia: texto(100),
    latitud: coordenadaEnRango(90, "La latitud debe estar entre -90 y 90"),
    longitud: coordenadaEnRango(180, "La longitud debe estar entre -180 y 180"),
    domicilioPaisId: z.string().min(1, "El país del domicilio es obligatorio"),
    domicilioEntidadId: z.string().min(1, "La entidad del domicilio es obligatoria"),
    municipioId: z.string().min(1, "El municipio es obligatorio"),
    localidadId: z.string().min(1, "La localidad es obligatoria"),
  })
  .superRefine((datos, contexto) => {
    if (datos.password !== datos.confirmarPassword) {
      contexto.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmarPassword"],
        message: "Las contraseñas no coinciden",
      });
    }
    coordenadasEnPar(datos, contexto);
  });

export type CrearUsuarioFormValues = z.infer<typeof crearUsuarioSchema>;

export const PASO1_CAMPOS = [
  "empleadoId",
  "username",
  "password",
  "confirmarPassword",
  "rolId",
] as const;

export const PASO2_CAMPOS = [
  "tipoComprobanteId",
  "tipoVialidadId",
  "calle",
  "numExterior",
  "numInterior",
  "nombreCalleIzquierda",
  "nombreCalleDerecha",
  "referencia",
  "laCasaEsId",
  "antiguedadDomicilio",
  "codigoPostal",
  "tipoAsentamiento",
  "colonia",
  "latitud",
  "longitud",
  "domicilioPaisId",
  "domicilioEntidadId",
  "municipioId",
  "localidadId",
] as const;
