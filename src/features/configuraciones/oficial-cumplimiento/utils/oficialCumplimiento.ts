import type { OficialCumplimientoFormValues } from "@/features/configuraciones/oficial-cumplimiento/types/oficialCumplimientoSchema";
import { correo, mayusculas, soloDigitos } from "@/shared/utils/entradas";
import type {
  ActualizarUsuarioRequest,
  DomicilioUsuarioRequest,
  DomicilioUsuarioResponse,
  OficialRequest,
  OficialResponse,
  UsuarioResponse,
} from "@/features/configuraciones/administracion/usuarios/types/usuarios";

function texto(valor: string | number | null | undefined) {
  return valor === null || valor === undefined ? "" : String(valor);
}

function textoOIndefinido(valor: string | undefined) {
  const limpio = valor?.trim();
  return limpio ? limpio : undefined;
}

function numeroOIndefinido(valor: string | undefined) {
  if (!valor) return undefined;
  const numero = Number(valor);
  return Number.isNaN(numero) ? undefined : numero;
}

// Todo el texto del oficial va en mayúsculas: también el que ya estaba guardado de otra forma.
export function valoresIniciales(
  usuario: UsuarioResponse,
  domicilio: DomicilioUsuarioResponse | null,
  oficial: OficialResponse | null,
): OficialCumplimientoFormValues {
  return {
    nombre: mayusculas(texto(usuario.nombre)),
    primerApellido: mayusculas(texto(usuario.primerApellido)),
    segundoApellido: mayusculas(texto(usuario.segundoApellido)),
    nacionalidadId: texto(usuario.nacionalidadId),
    paisNacimientoId: texto(usuario.paisNacimientoId),
    entidadNacimientoId: texto(usuario.entidadNacimientoId),
    lugarDeNacimiento: mayusculas(texto(usuario.lugarDeNacimiento)),
    fechaNacimiento: texto(usuario.fechaNacimiento),
    genero: texto(usuario.genero),
    rfc: mayusculas(texto(usuario.rfc)),
    curp: mayusculas(texto(usuario.curp)),
    estadoCivilId: texto(usuario.estadoCivilId),
    numDependientes: texto(usuario.numDependientes),
    nivelEstudiosId: texto(usuario.nivelEstudiosId),
    tipoIdentificacionId: texto(usuario.tipoIdentificacionId),
    folioIdentificacion: mayusculas(texto(usuario.folioIdentificacion)),
    telefono: soloDigitos(texto(usuario.telefono)),
    correo: correo(texto(usuario.correo)),

    tipoComprobanteId: texto(domicilio?.tipoComprobanteId),
    tipoVialidadId: texto(domicilio?.tipoVialidadId),
    calle: mayusculas(texto(domicilio?.calle)),
    numExterior: mayusculas(texto(domicilio?.numExterior)),
    numInterior: mayusculas(texto(domicilio?.numInterior)),
    nombreCalleIzquierda: mayusculas(texto(domicilio?.nombreCalleIzquierda)),
    nombreCalleDerecha: mayusculas(texto(domicilio?.nombreCalleDerecha)),
    referencia: mayusculas(texto(domicilio?.referencia)),
    laCasaEsId: texto(domicilio?.laCasaEsId),
    antiguedadDomicilio: texto(domicilio?.antiguedadDomicilio),
    codigoPostal: soloDigitos(texto(domicilio?.codigoPostal)),
    tipoAsentamiento: texto(domicilio?.tipoAsentamiento),
    colonia: mayusculas(texto(domicilio?.colonia)),
    latitud: texto(domicilio?.latitud),
    longitud: texto(domicilio?.longitud),
    domicilioPaisId: texto(domicilio?.paisId),
    domicilioEntidadId: texto(domicilio?.entidadId),
    municipioId: texto(domicilio?.municipioId),
    localidadId: texto(domicilio?.localidadId),

    tipoPersona: texto(oficial?.tipoPersona),
    claveDelOficialDeCumplimiento: mayusculas(
      texto(oficial?.claveDelOficialDeCumplimiento),
    ),
    claveDelSujetoObligado: mayusculas(texto(oficial?.claveDelSujetoObligado)),
    claveOrganoSuperior: mayusculas(texto(oficial?.claveOrganoSuperior)),
    monedaDeOperacionPrincipal: mayusculas(texto(oficial?.monedaDeOperacionPrincipal)),
    actividadEconomicaId: texto(oficial?.actividadEconomicaId),
  };
}

// sucursalId no se edita aquí, pero el PUT reemplaza el registro completo: se conserva.
export function aUsuarioPayload(
  values: OficialCumplimientoFormValues,
  sucursalId: string | undefined,
): ActualizarUsuarioRequest {
  return {
    nombre: values.nombre,
    primerApellido: textoOIndefinido(values.primerApellido),
    segundoApellido: textoOIndefinido(values.segundoApellido),
    sucursalId: textoOIndefinido(sucursalId),
    entidadNacimientoId: textoOIndefinido(values.entidadNacimientoId),
    paisNacimientoId: textoOIndefinido(values.paisNacimientoId),
    nacionalidadId: values.nacionalidadId,
    lugarDeNacimiento: textoOIndefinido(values.lugarDeNacimiento),
    fechaNacimiento: textoOIndefinido(values.fechaNacimiento),
    genero: textoOIndefinido(values.genero),
    rfc: textoOIndefinido(values.rfc?.toUpperCase()),
    curp: textoOIndefinido(values.curp?.toUpperCase()),
    estadoCivilId: textoOIndefinido(values.estadoCivilId),
    numDependientes: numeroOIndefinido(values.numDependientes),
    nivelEstudiosId: textoOIndefinido(values.nivelEstudiosId),
    tipoIdentificacionId: textoOIndefinido(values.tipoIdentificacionId),
    folioIdentificacion: textoOIndefinido(values.folioIdentificacion),
    telefono: textoOIndefinido(values.telefono),
    correo: textoOIndefinido(values.correo),
  };
}

export function aDomicilioPayload(
  values: OficialCumplimientoFormValues,
): DomicilioUsuarioRequest {
  return {
    tipoComprobanteId: textoOIndefinido(values.tipoComprobanteId),
    tipoVialidadId: textoOIndefinido(values.tipoVialidadId),
    calle: textoOIndefinido(values.calle),
    numExterior: textoOIndefinido(values.numExterior),
    numInterior: textoOIndefinido(values.numInterior),
    nombreCalleIzquierda: textoOIndefinido(values.nombreCalleIzquierda),
    nombreCalleDerecha: textoOIndefinido(values.nombreCalleDerecha),
    referencia: textoOIndefinido(values.referencia),
    laCasaEsId: textoOIndefinido(values.laCasaEsId),
    antiguedadDomicilio: textoOIndefinido(values.antiguedadDomicilio),
    codigoPostal: textoOIndefinido(values.codigoPostal),
    tipoAsentamiento: textoOIndefinido(values.tipoAsentamiento),
    colonia: textoOIndefinido(values.colonia),
    latitud: textoOIndefinido(values.latitud),
    longitud: textoOIndefinido(values.longitud),
    paisId: values.domicilioPaisId,
    entidadId: values.domicilioEntidadId,
    municipioId: values.municipioId,
    localidadId: values.localidadId,
  };
}

// Si no se manda estatus el backend lo reinicia a ACTIVO, así que se reenvía el actual.
export function aOficialPayload(
  values: OficialCumplimientoFormValues,
  estatus: OficialResponse["estatus"],
): OficialRequest {
  return {
    tipoPersona: values.tipoPersona,
    claveDelOficialDeCumplimiento: textoOIndefinido(values.claveDelOficialDeCumplimiento),
    claveDelSujetoObligado: values.claveDelSujetoObligado,
    claveOrganoSuperior: values.claveOrganoSuperior,
    monedaDeOperacionPrincipal: textoOIndefinido(
      values.monedaDeOperacionPrincipal?.toUpperCase(),
    ),
    actividadEconomicaId: textoOIndefinido(values.actividadEconomicaId),
    estatus,
  };
}

export function ultimaActualizacion(fechas: (string | undefined)[]) {
  const validas = fechas.filter((fecha): fecha is string => Boolean(fecha));
  if (validas.length === 0) return null;
  return validas.reduce((a, b) => (new Date(a) > new Date(b) ? a : b));
}

const SINONIMOS_GENERO = {
  Masculino: ["masculino", "hombre", "m"],
  Femenino: ["femenino", "mujer", "f"],
} as const;

/** El género se guarda como texto libre: devuelve la opción que corresponde al valor, si la hay. */
export function generoConocido(valor: string | undefined) {
  const limpio = (valor ?? "").trim().toLowerCase();
  if (!limpio) return null;
  const encontrado = (
    Object.entries(SINONIMOS_GENERO) as [
      keyof typeof SINONIMOS_GENERO,
      readonly string[],
    ][]
  ).find(([, sinonimos]) => sinonimos.includes(limpio));
  return encontrado ? encontrado[0] : null;
}

/** "MXN" → "peso mexicano"; devuelve null si el código no es una moneda conocida. */
export function nombreMoneda(codigo: string | undefined) {
  const limpio = (codigo ?? "").trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(limpio)) return null;
  try {
    const nombre = new Intl.DisplayNames(["es-MX"], { type: "currency" }).of(limpio);
    return nombre && nombre !== limpio ? nombre : null;
  } catch {
    return null;
  }
}

/** Enlace al mapa con las coordenadas del domicilio; null si faltan o no son válidas. */
export function urlMapa(latitud: string | undefined, longitud: string | undefined) {
  const lat = Number((latitud ?? "").trim());
  const lon = Number((longitud ?? "").trim());
  if (!latitud?.trim() || !longitud?.trim()) return null;
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;
}
