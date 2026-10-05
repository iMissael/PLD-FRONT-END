import type { CrearUsuarioFormValues } from "@/features/configuraciones/administracion/usuarios/types/usuarioSchema";
import type {
  DomicilioUsuarioResponse,
  OficialResponse,
  UsuarioResponse,
} from "@/features/configuraciones/administracion/usuarios/types/usuarios";

// "categoria" es texto libre (ver cat_roles.csv, p. ej. "PLD", "OPERATIVO"), no un valor
// fijo "OFICIAL": el rol de Oficial de Cumplimiento solo se identifica de forma estable
// por su nombre sembrado. rolId se compara como texto porque llega como number desde
// UsuarioResponse pero como string desde el <Select> del formulario.
export const NOMBRE_ROL_OFICIAL_CUMPLIMIENTO = "Oficial de Cumplimiento";

/** El formulario de roles guarda los nombres en mayúsculas: se compara sin mayúsculas, acentos ni espacios extra. */
function normalizarNombreRol(nombre: string | undefined) {
  return (nombre ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

export function esRolOficial(
  roles: { idRol?: number; nombre?: string }[] | undefined,
  rolId: number | string | undefined,
) {
  if (rolId === undefined || rolId === "") return false;
  return (
    normalizarNombreRol(roles?.find((rol) => String(rol.idRol) === String(rolId))?.nombre) ===
    normalizarNombreRol(NOMBRE_ROL_OFICIAL_CUMPLIMIENTO)
  );
}

const texto = (valor: string | number | null | undefined) =>
  valor === null || valor === undefined ? "" : String(valor);

/** Valores del formulario a partir de lo guardado, para editar. La contraseña queda vacía. */
export function valoresDeUsuario(
  usuario: UsuarioResponse,
  domicilio: DomicilioUsuarioResponse | null,
  oficial: OficialResponse | null,
): CrearUsuarioFormValues {
  return {
    username: texto(usuario.username),
    password: "",
    confirmarPassword: "",
    correo: texto(usuario.correo),
    telefono: texto(usuario.telefono),
    nombre: texto(usuario.nombre),
    primerApellido: texto(usuario.primerApellido),
    segundoApellido: texto(usuario.segundoApellido),
    nacionalidad: texto(usuario.nacionalidad),
    paisNacimientoId: texto(usuario.paisNacimientoId),
    entidadNacimientoId: texto(usuario.entidadNacimientoId),
    lugarDeNacimiento: texto(usuario.lugarDeNacimiento),
    fechaNacimiento: texto(usuario.fechaNacimiento),
    genero: texto(usuario.genero),
    rfc: texto(usuario.rfc),
    curp: texto(usuario.curp),
    estadoCivil: texto(usuario.estadoCivil),
    numDependientes: texto(usuario.numDependientes),
    nivelEstudios: texto(usuario.nivelEstudios),
    tipoIdentificacion: texto(usuario.tipoIdentificacion),
    folioIdentificacion: texto(usuario.folioIdentificacion),
    tipoComprobante: texto(domicilio?.tipoComprobante),
    tipoVialidad: texto(domicilio?.tipoVialidad),
    calle: texto(domicilio?.calle),
    numExterior: texto(domicilio?.numExterior),
    numInterior: texto(domicilio?.numInterior),
    nombreCalleIzquierda: texto(domicilio?.nombreCalleIzquierda),
    nombreCalleDerecha: texto(domicilio?.nombreCalleDerecha),
    referencia: texto(domicilio?.referencia),
    posesionVivienda: texto(domicilio?.posesionVivienda),
    antiguedadDomicilio: texto(domicilio?.antiguedadDomicilio),
    codigoPostal: texto(domicilio?.codigoPostal),
    tipoAsentamiento: texto(domicilio?.tipoAsentamiento),
    colonia: texto(domicilio?.colonia),
    domicilioPaisId: texto(domicilio?.paisId),
    domicilioEntidadId: texto(domicilio?.entidadId),
    municipioId: texto(domicilio?.municipioId),
    localidadId: texto(domicilio?.localidadId),
    rolId: texto(usuario.rolId),
    tipoPersona: texto(oficial?.tipoPersona),
    claveDelOficialDeCumplimiento: texto(oficial?.claveDelOficialDeCumplimiento),
    claveDelSujetoObligado: texto(oficial?.claveDelSujetoObligado),
    claveOrganoSuperior: texto(oficial?.claveOrganoSuperior),
    monedaDeOperacionPrincipal: texto(oficial?.monedaDeOperacionPrincipal),
    actividadEconomicaId: texto(oficial?.actividadEconomicaId),
  };
}
