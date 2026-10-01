import axios from "axios";

import { env } from "@/config/env";

import { authInterceptor, unauthorizedInterceptor } from "./interceptors/authInterceptor";
import { errorInterceptor } from "./interceptors/errorInterceptor";
import { tenantInterceptor } from "./interceptors/tenantInterceptor";

export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(tenantInterceptor);
apiClient.interceptors.request.use(authInterceptor);
// El 401 se atiende antes de normalizar el error.
apiClient.interceptors.response.use((response) => response, unauthorizedInterceptor);
apiClient.interceptors.response.use((response) => response, errorInterceptor);
