import { apiClient } from "@/api/client";
import type { LoginRequest, LoginResponse } from "../types/auth";

export async function loginUser(
  credentials: LoginRequest,
  signal?: AbortSignal,
): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", credentials, {
    signal,
  });
  return data;
}

export function login(credentials: LoginRequest): Promise<LoginResponse> {
  return loginUser(credentials);
}
