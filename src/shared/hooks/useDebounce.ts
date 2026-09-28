import { useEffect, useState } from "react";

/**
 * Devuelve `valor` con retraso: solo se actualiza cuando pasan `ms` sin que
 * cambie. Sirve para campos de búsqueda que disparan peticiones — sin esto,
 * escribir "zacatepec" son nueve requests.
 *
 * Los catálogos chicos no lo necesitan (filtran en memoria); esto es para los
 * listados que buscan en el backend, como Localidades.
 */
export function useDebounce<T>(valor: T, ms = 350): T {
  const [retrasado, setRetrasado] = useState(valor);

  useEffect(() => {
    const timer = setTimeout(() => setRetrasado(valor), ms);
    return () => clearTimeout(timer);
  }, [valor, ms]);

  return retrasado;
}
