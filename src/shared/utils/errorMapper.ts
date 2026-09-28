import { AppError } from "@/api/interceptors/errorInterceptor";
import { es } from "@/shared/i18n/es";

interface StandardErrorResponse {
  message: string;
  detail?: string;
  traceId?: string;
}

const ERROR_CODE_MAP: Record<string, string> = {
  BAD_CREDENTIALS: "El usuario o la contraseña son incorrectos. Por favor verifica tus datos.",
  USER_LOCKED: "La cuenta se encuentra bloqueada por múltiples intentos fallidos. Contacta al administrador.",
  TOKEN_EXPIRED: "Tu sesión ha expirado. Por favor inicia sesión de nuevo.",
  DENUNCIA_NOT_EDITABLE: "La denuncia solo se puede editar si está en estado de REVISION (V).",
  INVALID_FILE_TYPE: "El tipo de archivo adjunto no está permitido.",
  FILE_TOO_LARGE: "El archivo excede el límite permitido de 10MB.",
  TENANT_NOT_FOUND: "El identificador de organización (tenant) es inválido o no existe.",
};

const HTTP_STATUS_MAP: Record<number, string> = {
  400: "La solicitud contiene información inválida o incompleta.",
  401: "No cuentas con autenticación válida. Por favor inicia sesión.",
  403: "No tienes los permisos necesarios para realizar esta acción.",
  404: "El recurso solicitado no fue encontrado.",
  409: "Existe un conflicto con la información actual en el servidor.",
  422: "La solicitud no se pudo procesar debido a errores de validación.",
  429: "Has realizado demasiadas solicitudes en poco tiempo. Intenta en un momento.",
  500: "Error interno del servidor. Por favor intenta de nuevo más tarde.",
  503: "El servicio no se encuentra disponible temporalmente.",
};

export function mapBackendError(error: unknown): StandardErrorResponse {
  if (error instanceof AppError) {
    const codeMessage = error.title ? ERROR_CODE_MAP[error.title] : undefined;
    const statusMessage = HTTP_STATUS_MAP[error.status];
    const traceId = (error.cause as { response?: { headers?: Record<string, string> } })?.response
      ?.headers?.["x-trace-id"] ?? Math.random().toString(36).substring(2, 9).toUpperCase();

    const detailText = error.invalidParams
      ? Object.entries(error.invalidParams)
          .map(([k, v]) => `${k}: ${v}`)
          .join(" | ")
      : error.message;

    return {
      message: codeMessage ?? statusMessage ?? error.message ?? es.common.error,
      detail: detailText !== error.message ? detailText : undefined,
      traceId,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message || es.common.error,
      traceId: Math.random().toString(36).substring(2, 9).toUpperCase(),
    };
  }

  return {
    message: "Ocurrió un error inesperado. Intenta nuevamente o contacta a soporte.",
    traceId: Math.random().toString(36).substring(2, 9).toUpperCase(),
  };
}
