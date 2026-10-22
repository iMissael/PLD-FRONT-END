import {
  evaluacionRiesgoSchema,
  type EvaluacionRiesgoFormValues,
} from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgoSchema";
import type {
  ClienteMatrizRiesgo,
  EvaluacionRiesgoSolicitud,
} from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgo";
import type { AcreditadoPerfilRiesgo } from "@/features/acreditados/types/acreditados";

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
 * Lo que el perfil del acreditado ya sabe, con la forma del formulario de evaluación: identidad,
 * actividad, domicilio, crédito solicitado e historial crediticio. Lo que no trae queda vacío.
 */
export function valoresDesdePerfil(
  perfil: AcreditadoPerfilRiesgo,
): EvaluacionRiesgoFormValues {
  const domicilio = perfil.domicilio;
  const credito = perfil.creditoSolicitado;

  return {
    acreditadoReferencia: aTexto(perfil.referencia),
    acreditadoNombre: aTexto(perfil.nombre),
    acreditadoNombres: aTexto(perfil.nombres),
    acreditadoApellidoP: aTexto(perfil.apellidoPaterno),
    acreditadoApellidoM: aTexto(perfil.apellidoMaterno),
    rfc: aTexto(perfil.rfc),
    curp: aTexto(perfil.curp),
    tipoPersonaId: aTexto(perfil.tipoPersona?.id),
    nacionalidadId: aTexto(perfil.nacionalidad?.id),
    fechaNacimiento: aTexto(perfil.fechaNacimiento),
    fechaInicioActividad: aTexto(perfil.fechaInicioActividad),
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
  acreditadoReferencia: "Acreditado",
  acreditadoNombre: "Nombre del acreditado",
  tipoPersonaId: "Tipo de persona",
  nacionalidadId: "Nacionalidad",
  fechaNacimiento: "Fecha de nacimiento o constitución",
  fechaInicioActividad: "Fecha de inicio de actividad",
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

/** Cuerpo de `POST /evaluaciones` a partir de lo capturado (o cargado del perfil). */
export function construirSolicitud(
  values: EvaluacionRiesgoFormValues,
  contexto: { sucursalId?: string; verificadoPor: string },
  ahora = new Date(),
): EvaluacionRiesgoSolicitud {
  const tieneAsentamiento = Boolean(values.asentamientoTipo || values.asentamientoNombre);
  const tieneHistorial = values.creditosAnteriores.length > 0;

  return {
    meta: {
      timestamp: ahora.toISOString(),
      sucursal_id: contexto.sucursalId,
      usuario_verificador_ref: contexto.verificadoPor,
    },
    acreditado: {
      acreditado_ref: values.acreditadoReferencia,
      nombre: values.acreditadoNombres || values.acreditadoNombre,
      apellido_p: aTextoOIndefinido(values.acreditadoApellidoP),
      apellido_m: aTextoOIndefinido(values.acreditadoApellidoM),
      rfc: aTextoOIndefinido(values.rfc),
      curp: aTextoOIndefinido(values.curp),
      tipo_acreditado_id: Number(values.tipoPersonaId),
      nacionalidad_id: Number(values.nacionalidadId),
      fecha_nacimiento: values.fechaNacimiento,
      fecha_inicio_actividad_economica: values.fechaInicioActividad,
      // pep_nacional_id ya no existe en el contrato: el backend lo quitó y lo ignoraba de todas
      // formas (el riesgo PEP se resuelve por listas, no por este campo). El selector "PEP
      // Nacional" del formulario queda pendiente de retirar aparte.
      actividad_economica_id: Number(values.actividadEconomicaId),
    },
    domicilio: {
      localidad_id: Number(values.localidadId),
      direccion: {
        calle: aTextoOIndefinido(values.calle),
        tipo_calle: aTextoOIndefinido(values.tipoCalle),
        no_exterior: aTextoOIndefinido(values.noExterior),
        no_interior: aTextoOIndefinido(values.noInterior),
        codigo_postal: aTextoOIndefinido(values.codigoPostal),
        tipo: tieneAsentamiento ? aTextoOIndefinido(values.asentamientoTipo) : undefined,
        nombre: tieneAsentamiento ? aTextoOIndefinido(values.asentamientoNombre) : undefined,
      },
    },
    credito: {
      credito_ref: aTextoOIndefinido(values.creditoReferencia),
      tipo_id: Number(values.creditoTipo),
      monto: Number(values.monto),
      // moneda_id es un catálogo numérico; el formulario sigue capturando el código (MXN) como
      // texto libre, no hay con qué mapearlo todavía, así que se omite en vez de mandar un id falso.
      origen_recursos: aNumeroOIndefinido(values.origenRecursos),
      destino_recursos: aNumeroOIndefinido(values.destinoRecursos),
      canal_pago_id: Number(values.canalPagoId),
      tipo_pago_id: aNumeroOIndefinido(values.tipoPagoId),
    },
    historial_crediticio: tieneHistorial
      ? {
          creditos_anteriores: values.creditosAnteriores.map((anterior) => ({
            credito_ref: aTextoOIndefinido(anterior.referencia),
            tipo_credito_id: aNumeroOIndefinido(anterior.tipo),
            monto: aNumeroOIndefinido(anterior.monto),
            fecha_otorgamiento: aTextoOIndefinido(anterior.fechaOtorgamiento),
            estatus: aTextoOIndefinido(anterior.estatus),
          })),
        }
      : undefined,
  };
}

/** Expediente que el tablero muestra del acreditado recién evaluado. */
export function construirCliente(
  values: EvaluacionRiesgoFormValues,
  nombreTipoPersona: string | undefined,
  nombreSucursal: string | undefined,
  ahora = new Date(),
): ClienteMatrizRiesgo {
  const tipoPersona = nombreTipoPersona ?? "—";
  return {
    nombre: values.acreditadoNombre,
    numero: values.acreditadoReferencia,
    referencia: values.acreditadoReferencia,
    rfc: values.rfc || "—",
    curp: values.curp || "—",
    persona: /moral/i.test(tipoPersona) ? "MORAL" : "FISICA",
    tipoCliente: tipoPersona,
    fechaAlta: ahora.toLocaleDateString("es-MX"),
    sucursal: nombreSucursal ?? "—",
    fechaModificacion: fechaHoraActual(ahora),
  };
}
