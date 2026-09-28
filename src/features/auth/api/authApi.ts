import { apiClient } from "@/api/client";
import type { LoginCredentials, LoginResponse } from "../types/auth";

export async function loginUser(
  credentials: LoginCredentials,
  signal?: AbortSignal,
): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/api/auth/login", credentials, {
    signal,
  });
  return data;
}
