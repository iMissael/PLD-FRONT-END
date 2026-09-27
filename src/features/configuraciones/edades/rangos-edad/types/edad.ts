/**
 * Tipos del feature `rangos-edad` (menú: "Configuración de edades" › "Edades"),
 * a partir de `CatEdadController` en `denuncias-app`.
 *
 * Nombres: el backend llama a los campos `edadInicial`/`edadFinal`; la UI los
 * etiqueta como "Edad mínima"/"Edad máxima", que es el lenguaje del negocio.
 * La carpeta se llama `rangos-edad` para no quedar como `edades/edades`, ya
 * que el módulo padre del menú también es "edades".
 */

/**
 * Valores del enum `Estatus` del backend: A=Activa, B=Baja, S=Suspendido,
 * E=Eliminado. El formulario solo ofrece A y B — `E` lo escribe el
 * soft-delete del backend y `S` no se usa en este catálogo.
 */
export type EstatusEdad = "A" | "B" | "S" | "E";

/**
 * Igual a `CrearCatEdadRequest`. No lleva `id`: el backend lo genera como
 * consecutivo (`siguienteId()` en el adaptador JDBC).
 *
 * `edadFinal` es obligatorio aquí aunque la columna sea nullable en la base:
 * el backend lo pide `@NotNull` y los rangos existentes siempre cierran
 * (el "76 o más" se modela como 76–110).
 */
export interface CrearEdadInput {
  edadInicial: number;
  edadFinal: number;
  catNivelRiesgoId: number;
  estatus: EstatusEdad;
}

/** Igual a `ActualizarCatEdadRequest` (mismo shape que Crear). */
export type ActualizarEdadInput = CrearEdadInput;

/** Igual a `CatEdadResponse`. */
export interface EdadResponse {
  id: string;
  edadInicial: number;
  /** Nullable en la base; en la práctica siempre viene con valor. */
  edadFinal: number | null;
  catNivelRiesgoId: number;
  estatus: EstatusEdad;
  createdAt: string;
  updatedAt: string;
}
