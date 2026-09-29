/** Normaliza para comparar sin distinguir mayúsculas, acentos ni espacios repetidos. */
export function normalizar(valor: string | null | undefined) {
  return (valor ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

/** null cuando falta alguno de los dos valores: no se puede afirmar ni negar la coincidencia. */
export function coinciden(a: string | null | undefined, b: string | null | undefined) {
  const x = normalizar(a);
  const y = normalizar(b);
  if (!x || !y) return null;
  return x === y;
}

export function listasCoincidentes(coincidencia: {
  lista_negra?: { coincide?: boolean };
  lista_bloqueadas?: { coincide?: boolean };
}) {
  const listas: string[] = [];
  if (coincidencia.lista_bloqueadas?.coincide) listas.push("Personas bloqueadas");
  if (coincidencia.lista_negra?.coincide) listas.push("Lista negra");
  return listas;
}
