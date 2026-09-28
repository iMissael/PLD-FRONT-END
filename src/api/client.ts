import axios from "axios";

import { env } from "@/config/env";
import { getAuthToken } from "@/features/auth/authStore";

import { errorInterceptor } from "./interceptors/errorInterceptor";
import { tenantInterceptor } from "./interceptors/tenantInterceptor";

/**
 * Instancia única de Axios para toda la app. Los `features/*` NUNCA
 * importan Axios directamente: siempre pasan por esta instancia, para que
 * el header de tenant, token de autenticación y la normalización de errores apliquen siempre.
 */
export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return tenantInterceptor(config);
});

apiClient.interceptors.response.use((response) => response, errorInterceptor);

