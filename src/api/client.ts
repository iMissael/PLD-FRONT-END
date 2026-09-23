import axios from "axios";

import { env } from "@/config/env";

import { errorInterceptor } from "./interceptors/errorInterceptor";
import { tenantInterceptor } from "./interceptors/tenantInterceptor";

/**
 * Instancia única de Axios para toda la app. Los `features/*` NUNCA
 * importan Axios directamente: siempre pasan por esta instancia, para que
 * el header de tenant y la normalización de errores apliquen siempre.
 */
export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(tenantInterceptor);
apiClient.interceptors.response.use((response) => response, errorInterceptor);
