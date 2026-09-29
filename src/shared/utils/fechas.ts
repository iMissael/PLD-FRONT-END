/** Edad en años cumplidos a `hoy`; null si falta la fecha, es inválida o futura. */
export function calcularEdad(fechaNacimiento: string | undefined, hoy = new Date()) {
  if (!fechaNacimiento) return null;
  const [anio, mes, dia] = fechaNacimiento.split("-").map(Number);
  if (!anio || !mes || !dia) return null;
  let edad = hoy.getFullYear() - anio;
  const cumpleTodavia =
    hoy.getMonth() + 1 > mes || (hoy.getMonth() + 1 === mes && hoy.getDate() >= dia);
  if (!cumpleTodavia) edad -= 1;
  return edad >= 0 ? edad : null;
}

/** Fecha de hoy (hora local) como AAAA-MM-DD, el formato de los campos de fecha. */
export function hoyIso(hoy = new Date()) {
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}
