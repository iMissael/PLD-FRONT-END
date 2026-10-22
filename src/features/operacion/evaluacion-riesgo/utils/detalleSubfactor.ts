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
  "antiguedad empleado": "Antigüedad de empleo o en el giro mercantil",
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

/** Los ids de catálogo son numéricos en el contrato; el formulario los guarda como texto. */
interface CatalogosDetalle {
  tiposPersona?: { id?: string | number; nombre?: string }[];
  paises?: { idPais?: string | number; nombre?: string }[];
  peps?: { id?: string | number; nombre?: string }[];
  actividades?: { id?: string | number; descripcion?: string }[];
  /** `cat_tipo_credito` ya no tiene nombre: se identifica por su tipo de préstamo. */
  tiposCredito?: { id?: string | number; catTipoPrestamoId?: string | number }[];
  tiposPrestamo?: { id?: string | number; nombre?: string }[];
  origenes?: { id?: string | number; nombre?: string }[];
  destinos?: { id?: string | number; nombre?: string }[];
  canales?: { id?: string | number; nombre?: string }[];
  nombreLocalidad?: string;
}

function nombreDe(lista: { id?: string | number; nombre?: string }[] | undefined, id: string) {
  return id ? lista?.find((item) => String(item.id) === id)?.nombre : undefined;
}

/** Encadena tipo de crédito → tipo de préstamo para obtener un texto legible. */
function nombreTipoCredito(catalogos: CatalogosDetalle, id: string) {
  if (!id) return undefined;
  const credito = catalogos.tiposCredito?.find((item) => String(item.id) === id);
  if (!credito?.catTipoPrestamoId) return undefined;
  return nombreDe(catalogos.tiposPrestamo, String(credito.catTipoPrestamoId));
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
  const aniosActividad = calcularEdad(values.fechaInicioActividad, hoy);
  const antiguedad =
    aniosActividad === null
      ? undefined
      : `${aniosActividad} ${aniosActividad === 1 ? "año" : "años"} (desde ${values.fechaInicioActividad.split("-").reverse().join("/")})`;
  const actividad = catalogos.actividades?.find(
    (item) => String(item.id) === values.actividadEconomicaId,
  );

  const detalles: Record<string, string | undefined> = {
    "ubicacion geografica": catalogos.nombreLocalidad
      ? `Localidad: ${catalogos.nombreLocalidad}`
      : undefined,
    "tipo persona": nombreDe(catalogos.tiposPersona, values.tipoPersonaId),
    edad: edad === null ? undefined : `${edad} años`,
    nacionalidad: catalogos.paises?.find(
      (pais) => String(pais.idPais) === values.nacionalidadId,
    )?.nombre,
    "antiguedad giro anios": antiguedad,
    "antiguedad empleado": antiguedad,
    "es pep nacional":
      nombreDe(catalogos.peps, values.pepNacionalId ?? "") ?? "No es PEP nacional",
    "actividad economica": actividad?.descripcion,
    "tipo credito": nombreTipoCredito(catalogos, values.creditoTipo),
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
