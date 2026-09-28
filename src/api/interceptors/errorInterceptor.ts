import type { AxiosError } from "axios";

/**
 * Error normalizado que consume el resto del front. Los componentes solo
 * necesitan leer `.message`; los hooks o pantallas que lo requieran pueden
 * usar `.status` o `.invalidParams` para casos más finos (409 de duplicado,
 * 400 de validación por campo, etc.).
 */
export class AppError extends Error {
  readonly status: number;
  readonly title: string;
  /** field -> mensaje. Solo viene en 400 de validación (MethodArgumentNotValidException). */
  readonly invalidParams?: Record<string, string>;
  readonly cause?: unknown;

  constructor(params: {
    status: number;
    title: string;
    detail?: string;
    invalidParams?: Record<string, string>;
    cause?: unknown;
  }) {
    super(params.detail ?? params.title);
    this.name = "AppError";
    this.status = params.status;
    this.title = params.title;
    this.invalidParams = params.invalidParams;
    this.cause = params.cause;
  }
}

/**
 * Forma real de los errores del backend. Dos orígenes distintos, misma
 * forma en el wire:
 *  - `GlobalExceptionHandler` (@RestControllerAdvice): siempre manda
 *    `ProblemDetailsResponse`, con `invalidParams` como MAPA
 *    (`Record<string, string>`, field -> mensaje) solo en el 400 de
 *    validación (`MethodArgumentNotValidException`) — nunca es un arreglo.
 *  - Los `@ExceptionHandler` locales de `PersonaBloqueadaController`
 *    (404, 409, 400 de argumento inválido) mandan un `ProblemDetail` plano
 *    de Spring, que nunca trae `invalidParams`.
 * Como ambos comparten los mismos campos base, un solo tipo cubre los dos
 * casos con `invalidParams` opcional.
 */
interface ProblemDetailBody {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  timestamp?: string;
  invalidParams?: Record<string, string>;
}

const FALLBACK_MESSAGES: Record<number, string> = {
  400: "La solicitud tiene datos inválidos.",
  401: "No autenticado.",
  403: "No tienes permiso para realizar esta acción.",
  404: "El recurso solicitado no existe.",
  409: "El recurso ya existe o está en conflicto con el estado actual.",
  422: "No se pudo procesar la solicitud.",
};

function fallbackMessage(status: number): string {
  return FALLBACK_MESSAGES[status] ?? "Ocurrió un error inesperado. Intenta de nuevo.";
}

/**
 * Convierte cualquier error de Axios (con o sin respuesta del backend) en
 * un AppError. Se usa como interceptor de respuesta, así que siempre debe
 * terminar en un `Promise.reject`.
 */
export function errorInterceptor(error: AxiosError<ProblemDetailBody>): Promise<never> {
  if (!error.response) {
    // Sin respuesta: caída de red, CORS, timeout, backend no disponible, etc.
    return Promise.reject(
      new AppError({
        status: 0,
        title: "Sin conexión con el servidor",
        detail:
          "No se pudo contactar al backend. Verifica tu conexión e intenta de nuevo.",
        cause: error,
      }),
    );
  }

  const { status, data } = error.response;

  return Promise.reject(
    new AppError({
      status,
      title: data?.title ?? fallbackMessage(status),
      detail: data?.detail ?? data?.title ?? fallbackMessage(status),
      invalidParams: data?.invalidParams,
      cause: error,
    }),
  );
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
