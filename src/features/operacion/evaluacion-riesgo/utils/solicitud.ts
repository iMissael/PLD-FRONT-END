import {
  evaluacionRiesgoSchema,
  type EvaluacionRiesgoFormValues,
} from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgoSchema";
import type {
  ClienteMatrizRiesgo,
  EvaluacionRiesgoSolicitud,
} from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgo";
import type { SocioPerfilRiesgo } from "@/features/socios/types/socios";

/** Moneda con la que se evalúa cuando el crédito no trae otra: el crédito solicitado no la guarda. */
export const MONEDA_POR_DEFECTO = "MXN";

function aTexto(valor: string | number | null | undefined) {
  return valor === undefined || valor === null ? "" : String(valor);
}

export function aTextoOIndefinido(valor: string | undefined) {
  return valor ? valor : undefined;
}

export function aNumeroOIndefinido(valor: string | undefined) {
  if (!valor) return undefined;
  const numero = Number(valor);
  return Number.isNaN(numero) ? undefined : numero;
}

function dosDigitos(n: number) {
  return String(n).padStart(2, "0");
}

export function fechaHoraActual(ahora = new Date()) {
  const fecha = `${ahora.getFullYear()}-${dosDigitos(ahora.getMonth() + 1)}-${dosDigitos(ahora.getDate())}`;
  const hora = `${dosDigitos(ahora.getHours())}:${dosDigitos(ahora.getMinutes())}:${dosDigitos(ahora.getSeconds())}`;
  return `${fecha} ${hora}`;
}

/**
 * Lo que el perfil del socio ya sabe, con la forma del formulario de evaluación: identidad,
 * actividad, domicilio, crédito solicitado e historial crediticio. Lo que no trae queda vacío.
 */
export function valoresDesdePerfil(
  perfil: SocioPerfilRiesgo,
): EvaluacionRiesgoFormValues {
  const domicilio = perfil.domicilio;
  const credito = perfil.creditoSolicitado;

  return {
    socioReferencia: aTexto(perfil.referencia),
    socioNombre: aTexto(perfil.nombre),
    socioNombres: aTexto(perfil.nombres),
    socioApellidoP: aTexto(perfil.apellidoPaterno),
    socioApellidoM: aTexto(perfil.apellidoMaterno),
    rfc: aTexto(perfil.rfc),
    curp: aTexto(perfil.curp),
    tipoPersonaId: aTexto(perfil.tipoPersona?.id),
    nacionalidadId: aTexto(perfil.nacionalidad?.id),
    fechaNacimiento: aTexto(perfil.fechaNacimiento),
    antiguedadGiroAnios: aTexto(perfil.antiguedadGiroAnios),
    pepNacionalId: aTexto(perfil.pepNacionalId),
    actividadEconomicaId: aTexto(perfil.actividadEconomica?.id),

    paisId: aTexto(domicilio?.paisId),
    entidadId: aTexto(domicilio?.entidadId),
    municipioId: aTexto(domicilio?.municipioId),
    localidadId: aTexto(domicilio?.localidadId),
    calle: aTexto(domicilio?.calle),
    tipoCalle: aTexto(domicilio?.tipoCalle),
    noExterior: aTexto(domicilio?.noExterior),
    noInterior: aTexto(domicilio?.noInterior),
    codigoPostal: aTexto(domicilio?.codigoPostal),
    asentamientoTipo: aTexto(domicilio?.tipoAsentamiento),
    asentamientoNombre: aTexto(domicilio?.nombreAsentamiento),
    latitud: aTexto(domicilio?.latitud),
    longitud: aTexto(domicilio?.longitud),

    creditoReferencia: aTexto(credito?.referencia),
    creditoTipo: aTexto(credito?.tipo),
    monto: aTexto(credito?.monto),
    moneda: MONEDA_POR_DEFECTO,
    origenRecursos: aTexto(credito?.origenRecursos),
    destinoRecursos: aTexto(credito?.destinoRecursos),
    canalPagoId: aTexto(credito?.canalPagoId),
    tipoPagoId: "",
    ebrSoluciones: "",

    creditosAnteriores: (perfil.historialCrediticio ?? []).map((anterior) => ({
      referencia: aTexto(anterior.referencia),
      tipo: aTexto(anterior.tipo),
      monto: aTexto(anterior.monto),
      moneda: MONEDA_POR_DEFECTO,
      fechaOtorgamiento: aTexto(anterior.fechaOtorgamiento),
      estatus: aTexto(anterior.estatus),
    })),
  };
}

const ETIQUETAS_CAMPO: Partial<Record<keyof EvaluacionRiesgoFormValues, string>> = {
  socioReferencia: "Socio",
  socioNombre: "Nombre del socio",
  tipoPersonaId: "Tipo de persona",
  nacionalidadId: "Nacionalidad",
  fechaNacimiento: "Fecha de nacimiento o constitución",
  antiguedadGiroAnios: "Antigüedad en el giro",
  actividadEconomicaId: "Actividad económica",
  localidadId: "Domicilio (localidad)",
  creditoTipo: "Tipo de crédito",
  monto: "Monto del crédito",
  origenRecursos: "Origen de los recursos",
  destinoRecursos: "Destino de los recursos",
  canalPagoId: "Canal de pago",
};

/** Lo que falta para poder evaluar sin abrir el formulario (vacío si ya se puede). */
export function datosFaltantes(values: EvaluacionRiesgoFormValues): string[] {
  const resultado = evaluacionRiesgoSchema.safeParse(values);
  if (resultado.success) return [];
  const etiquetas = resultado.error.issues.map((problema) => {
    const campo = problema.path[0] as keyof EvaluacionRiesgoFormValues;
    return ETIQUETAS_CAMPO[campo] ?? String(campo);
  });
  return [...new Set(etiquetas)];
}

/** Cuerpo de `POST /pld/evaluaciones` a partir de lo capturado (o cargado del perfil). */
export function construirSolicitud(
  values: EvaluacionRiesgoFormValues,
  contexto: { sucursalId: string; verificadoPor: string },
  ahora = new Date(),
): EvaluacionRiesgoSolicitud {
  const tieneAsentamiento = Boolean(values.asentamientoTipo || values.asentamientoNombre);
  const tieneGeolocalizacion = Boolean(values.latitud || values.longitud);
  const tieneHistorial = values.creditosAnteriores.length > 0;

  return {
    metadata: {
      fecha_solicitud: ahora.toISOString(),
      sucursal_id: contexto.sucursalId,
      usuario_verficador_ref: contexto.verificadoPor,
    },
    socio: {
      referencia: values.socioReferencia,
      nombre: values.socioNombres || values.socioNombre,
      apellido_p: aTextoOIndefinido(values.socioApellidoP),
      apellido_m: aTextoOIndefinido(values.socioApellidoM),
      rfc: aTextoOIndefinido(values.rfc),
      curp: aTextoOIndefinido(values.curp),
      tipo_persona_id: values.tipoPersonaId,
      nacionalidad_id: values.nacionalidadId,
      fecha_nacimiento: values.fechaNacimiento,
      antiguedad_giro_anios: values.antiguedadGiroAnios,
      pep_nacional_id: aTextoOIndefinido(values.pepNacionalId),
      actividad_economica_id: values.actividadEconomicaId,
    },
    domicilio: {
      localidad_id: Number(values.localidadId),
      direccion: {
        calle: aTextoOIndefinido(values.calle),
        tipo_calle: aTextoOIndefinido(values.tipoCalle),
        no_exterior: aNumeroOIndefinido(values.noExterior),
        no_interior: aNumeroOIndefinido(values.noInterior),
        codigo_postal: aTextoOIndefinido(values.codigoPostal),
        asentamiento: tieneAsentamiento
          ? {
              tipo: aTextoOIndefinido(values.asentamientoTipo),
              nombre: aTextoOIndefinido(values.asentamientoNombre),
            }
          : undefined,
        geolocalizacion: tieneGeolocalizacion
          ? {
              latitud: aNumeroOIndefinido(values.latitud),
              longitud: aNumeroOIndefinido(values.longitud),
            }
          : undefined,
      },
    },
    credito: {
      referencia: aTextoOIndefinido(values.creditoReferencia),
      tipo: values.creditoTipo,
      monto: Number(values.monto),
      moneda: aTextoOIndefinido(values.moneda),
      origen_recursos: values.origenRecursos,
      destino_recursos: values.destinoRecursos,
      canal_pago_id: Number(values.canalPagoId),
      tipo_pago_id: aNumeroOIndefinido(values.tipoPagoId),
      ebr_soluciones: aTextoOIndefinido(values.ebrSoluciones),
    },
    historial_crediticio: tieneHistorial
      ? {
          creditos_anteriores: values.creditosAnteriores.map((anterior) => ({
            referencia: aTextoOIndefinido(anterior.referencia),
            tipo: aTextoOIndefinido(anterior.tipo),
            monto: aNumeroOIndefinido(anterior.monto),
            moneda: aTextoOIndefinido(anterior.moneda),
            fecha_otorgamiento: aTextoOIndefinido(anterior.fechaOtorgamiento),
            estatus: aTextoOIndefinido(anterior.estatus),
          })),
        }
      : undefined,
  };
}

/** Expediente que el tablero muestra del socio recién evaluado. */
export function construirCliente(
  values: EvaluacionRiesgoFormValues,
  nombreTipoPersona: string | undefined,
  nombreSucursal: string | undefined,
  ahora = new Date(),
): ClienteMatrizRiesgo {
  const tipoPersona = nombreTipoPersona ?? "—";
  return {
    nombre: values.socioNombre,
    numero: values.socioReferencia,
    referencia: values.socioReferencia,
    rfc: values.rfc || "—",
    curp: values.curp || "—",
    persona: /moral/i.test(tipoPersona) ? "MORAL" : "FISICA",
    tipoCliente: tipoPersona,
    fechaAlta: ahora.toLocaleDateString("es-MX"),
    sucursal: nombreSucursal ?? "—",
    fechaModificacion: fechaHoraActual(ahora),
  };
}
