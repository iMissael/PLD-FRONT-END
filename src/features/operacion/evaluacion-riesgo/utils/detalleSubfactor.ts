import type { EvaluacionRiesgoFormValues } from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgoSchema";
import { calcularEdad } from "@/shared/utils/fechas";

/**
 * El resultado de la evaluación solo trae valor, puntaje y ponderación por subfactor. El texto
 * que acompaña a cada renglón (localidad, tipo de persona, edad…) se arma con lo capturado.
 */

const ETIQUETAS_FACTOR: Record<string, string> = {
  "informacion personal": "Información Personal",
  "actividad economica": "Giro o Actividad Económica",
  "productos servicio": "Productos y Servicios",
  "productos y servicios": "Productos y Servicios",
  "enfoque basado riesgo": "Enfoque Basado en Riesgo",
};

const ETIQUETAS_SUBFACTOR: Record<string, string> = {
  "Ubicacion geografica": "Ubicación Geográfica",
  "tipo persona": "Tipo de Persona",
  edad: "Edad",
  nacionalidad: "Nacionalidad",
  "antiguedad giro anios": "Antigüedad de empleo o en el giro mercantil",
  "es pep nacional": "PEPs Nacionales",
  "actividad economica": "Giro o Actividad Económica / Oficios",
  "tipo credito": "Tipo de Crédito",
  historial: "Historial Crediticio",
  "monto credito": "Monto del Crédito",
  "origen recursos": "Origen de los Recursos",
  "destino recursos": "Destino de los Recursos (Préstamo)",
  "canales pago": "Canales de Pago",
  "soluciones ebr": "Enfoque Basado en Riesgo",
};

export type DetallesSubfactor = Record<string, string>;

export function claveSubfactor(descripcion: string | undefined) {
  return (descripcion ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replaceAll("_", " ")
    .toLowerCase()
    .trim();
}

function conMayusculaInicial(texto: string) {
  const limpio = texto.replaceAll("_", " ").toLowerCase();
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

export function etiquetaFactor(descripcion: string | undefined) {
  return (
    ETIQUETAS_FACTOR[claveSubfactor(descripcion)] ??
    conMayusculaInicial(descripcion ?? "—")
  );
}

export function etiquetaSubfactor(descripcion: string | undefined) {
  return (
    ETIQUETAS_SUBFACTOR[claveSubfactor(descripcion)] ??
    conMayusculaInicial(descripcion ?? "—")
  );
}

interface CatalogosDetalle {
  tiposPersona?: { id?: string; nombre?: string }[];
  paises?: { idPais?: string; nombre?: string }[];
  peps?: { id?: string; nombre?: string }[];
  actividades?: { id?: string; descripcion?: string }[];
  tiposCredito?: { id?: string; nombre?: string }[];
  origenes?: { id?: string; nombre?: string }[];
  destinos?: { id?: string; nombre?: string }[];
  canales?: { id?: string; nombre?: string }[];
  nombreLocalidad?: string;
}

function nombreDe(lista: { id?: string; nombre?: string }[] | undefined, id: string) {
  return id ? lista?.find((item) => String(item.id) === id)?.nombre : undefined;
}

function montoConFormato(monto: string, moneda: string | undefined) {
  const numero = Number(monto);
  if (!monto || Number.isNaN(numero)) return undefined;
  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: moneda || "MXN",
    }).format(numero);
  } catch {
    return numero.toLocaleString("es-MX", { minimumFractionDigits: 2 });
  }
}

export function construirDetalles(
  values: EvaluacionRiesgoFormValues,
  catalogos: CatalogosDetalle,
  hoy = new Date(),
): DetallesSubfactor {
  const edad = calcularEdad(values.fechaNacimiento, hoy);
  const actividad = catalogos.actividades?.find(
    (item) => String(item.id) === values.actividadEconomicaId,
  );

  const detalles: Record<string, string | undefined> = {
    "ubicacion geografica": catalogos.nombreLocalidad
      ? `Localidad: ${catalogos.nombreLocalidad}`
      : undefined,
    "tipo persona": nombreDe(catalogos.tiposPersona, values.tipoPersonaId),
    edad: edad === null ? undefined : `${edad} años`,
    nacionalidad: catalogos.paises?.find((pais) => pais.idPais === values.nacionalidadId)
      ?.nombre,
    "antiguedad giro anios": values.antiguedadGiroAnios
      ? `${values.antiguedadGiroAnios} años`
      : undefined,
    "es pep nacional":
      nombreDe(catalogos.peps, values.pepNacionalId ?? "") ?? "No es PEP nacional",
    "actividad economica": actividad?.descripcion,
    "tipo credito": nombreDe(catalogos.tiposCredito, values.creditoTipo),
    historial:
      values.creditosAnteriores.length > 0
        ? "Cliente con historial"
        : "Sin historial crediticio",
    "monto credito": montoConFormato(values.monto, values.moneda),
    "origen recursos": nombreDe(catalogos.origenes, values.origenRecursos),
    "destino recursos": nombreDe(catalogos.destinos, values.destinoRecursos),
    "canales pago": nombreDe(catalogos.canales, values.canalPagoId),
    "soluciones ebr": values.ebrSoluciones || undefined,
  };

  return Object.fromEntries(
    Object.entries(detalles).filter(
      (entrada): entrada is [string, string] => entrada[1] !== undefined,
    ),
  );
}
