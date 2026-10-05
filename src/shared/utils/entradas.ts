/**
 * Formateadores de captura: se aplican mientras se escribe (o se pega) para que el campo
 * solo acepte lo que le corresponde. Todo el texto del sistema va en mayúsculas; las
 * excepciones son el correo y el nombre de usuario (con el que se inicia sesión), que van en minúsculas.
 */

export type Formato = (valor: string) => string;

/** Sin espacios al inicio ni espacios seguidos (un espacio final se permite mientras se escribe). */
function espaciosLimpios(valor: string) {
  return valor.replace(/\s+/g, " ").replace(/^ /, "");
}

export const mayusculas: Formato = (valor) =>
  espaciosLimpios(valor.normalize("NFC").toLocaleUpperCase("es-MX"));

/** Nombres y apellidos: letras (con acentos y Ñ), espacio, punto, apóstrofo y guion. */
export const nombrePropio: Formato = (valor) =>
  mayusculas(valor.replace(/[^\p{L}\p{M} .'’-]/gu, ""));

export const soloDigitos: Formato = (valor) => valor.replace(/\D/g, "");

export const alfanumerico: Formato = (valor) =>
  valor.toLocaleUpperCase("es-MX").replace(/[^A-Z0-9]/g, "");

/** El RFC admite Ñ y & (razones sociales como "A&B"). */
export const rfc: Formato = (valor) =>
  valor.toLocaleUpperCase("es-MX").replace(/[^A-ZÑ&0-9]/g, "");

/** Claves regulatorias: letras, números y guion. */
export const clave: Formato = (valor) =>
  valor.toLocaleUpperCase("es-MX").replace(/[^A-Z0-9-]/g, "");

/** Números exterior e interior: "105", "12-A", "S/N". */
export const numeroDomicilio: Formato = (valor) =>
  espaciosLimpios(valor.toLocaleUpperCase("es-MX").replace(/[^A-ZÑ0-9/ -]/g, ""));

export const soloLetras: Formato = (valor) =>
  valor.toLocaleUpperCase("es-MX").replace(/[^A-Z]/g, "");

/** Los correos se guardan en minúsculas y sin espacios. */
export const correo: Formato = (valor) => valor.toLowerCase().replace(/\s/g, "");

/**
 * Nombre de usuario para iniciar sesión: minúsculas y sin espacios. El backend lo compara
 * tal cual, así que no se pasa a mayúsculas como el resto del texto.
 */
export const nombreUsuario: Formato = (valor) =>
  valor.toLowerCase().replace(/[^a-z0-9._-]/g, "");

/** Nombre y categoría de un rol: mayúsculas con letras, números, espacio, guion y guion bajo. */
export const nombreRol: Formato = (valor) =>
  espaciosLimpios(valor.toLocaleUpperCase("es-MX").replace(/[^A-ZÑ0-9 _-]/g, ""));

