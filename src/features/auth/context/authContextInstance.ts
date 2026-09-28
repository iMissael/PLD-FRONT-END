import { createContext } from "react";
import type { AuthState, LoginResponse } from "../types/auth";

export interface AuthContextValue extends AuthState {
  setSession: (response: LoginResponse) => void;
  logout: () => void;
  hasPermission: (recurso: string, accion: string) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
