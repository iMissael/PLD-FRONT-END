/**
 * Tipos del feature `personas-bloqueadas`, escritos a mano a partir de los
 * DTOs reales del backend (`PersonaBloqueadaRequest`, `PersonaBloqueadaResponse`,
 * `ResultadoBusquedaResponse`, `CargaMasivaResponse` — todos en
 * `infrastructure.adapters.in.rest.dto` de `denuncias-app`).
 *
 * Cuando el backend exponga su OpenAPI/Swagger, corre `pnpm gen:api` y
 * reemplaza esto por los tipos generados en `src/api/schema.d.ts`.
 */

/**
 * Valores confirmados: "ACTIVO". El resto del enum `Estatus` del dominio no
 * se ha confirmado todavía (el "eliminar" del front es un cambio de estatus,
 * no un DELETE real — ver eliminarPersonaBloqueadaPorRfcCurp). El tipo acepta
 * cualquier string para no romper si el backend usa otro valor no listado
 * aquí, pero el editor sigue sugiriendo "ACTIVO".
 */
export type Estatus = "ACTIVO" | (string & {});

/**
 * Igual a `PersonaBloqueadaRequest` del backend (record de Java): lo que se
 * manda al crear o actualizar. `nombreCompleto`, `rfc` y `curp` son
 * `@NotBlank` en el backend; el resto es opcional/nullable ahí también.
 */
export interface PersonaBloqueadaInput {
  nombreCompleto: string;
  rfc: string;
  curp: string;
  fechaNacimiento?: string | null;
  pais?: string | null;
  nombreLista?: string | null;
  fechaPublicacion?: string | null;
  oficio?: string | null;
  informacionMotivo?: string | null;
  alias?: string | null;
}

/**
 * Igual a `PersonaBloqueadaResponse` del backend. `fechaNacimiento` y
 * `fechaPublicacion` son `LocalDate` -> string `"YYYY-MM-DD"`; `createdAt`/
 * `updatedAt` son `OffsetDateTime` -> string ISO 8601 con offset.
 */
export interface PersonaBloqueadaResponse {
  id: number;
  nombreCompleto: string;
  rfc: string;
  curp: string;
  fechaNacimiento: string | null;
  pais: string | null;
  nombreLista: string | null;
  fechaPublicacion: string | null;
  oficio: string | null;
  informacionMotivo: string | null;
  alias: string | null;
  idPersonaPrincipal: number | null;
  estatus: Estatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Igual a `ResultadoBusquedaResponse` del backend: una fila de
 * `/consulta-bloqueados`. NO es una persona plana — es la persona principal
 * que hizo match, la lista de sus alias (si el match real fue por uno de
 * ellos), y si el match fue directo o vía alias.
 */
export interface ResultadoBusquedaResponse {
  personaPrincipal: PersonaBloqueadaResponse;
  alias: PersonaBloqueadaResponse[];
  coincidenciaViaAlias: boolean;
  aliasCoincidentes: string[];
}

/**
 * Query params reales de `GET /personas-bloqueadas/consulta-bloqueados`.
 * Todos opcionales en el backend, pero el front exige al menos uno (ver
 * `busquedaBloqueadosSchema.ts`).
 */
export interface ConsultaBloqueadosParams {
  nombre?: string;
  rfc?: string;
  curp?: string;
  fechaNacimiento?: string;
  socioRef?: string;
  usuarioRef?: string;
  sucursalRef?: string;
}

/**
 * Query params de `PUT /personas-bloqueadas` y `DELETE /personas-bloqueadas`
 * (actualizar/"eliminar" por RFC o CURP). Van como query string en el
 * request real hacia el backend, pero eso nunca se refleja en la URL visible
 * del front (ver `personasBloqueadasApi.ts`).
 */
export interface RfcCurpParams {
  rfc: string;
  curp: string;
}

/**
 * Igual a `FilaErrorCarga` del backend (record en `domain.model.enums`):
 * los nombres de campo son los del record de Java, no una interpretación
 * libre ("fila"/"error" no existen en el JSON real).
 */
export interface FilaErrorCarga {
  numeroFila: number;
  motivo: string;
}

/** Igual a `CargaMasivaResponse` del backend. */
export interface CargaMasivaResultado {
  totalFilas: number;
  exitosos: number;
  fallidos: number;
  detalleErrores: FilaErrorCarga[];
}
