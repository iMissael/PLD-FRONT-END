import { useCallback, useState, type ReactNode } from "react";
import { setAuthToken } from "../authStore";
import type { AuthState, LoginResponse } from "../types/auth";
import { AuthContext } from "./authContextInstance";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    user: null,
    role: null,
    permissions: [],
  });

  const setSession = useCallback((response: LoginResponse) => {
    setAuthToken(response.token);
    setState({
      isAuthenticated: true,
      token: response.token,
      user: response.usuario,
      role: response.rol,
      permissions: response.permisos ?? [],
    });
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setState({
      isAuthenticated: false,
      token: null,
      user: null,
      role: null,
      permissions: [],
    });
  }, []);

  const hasPermission = useCallback(
    (recurso: string, accion: string): boolean => {
      if (!state.isAuthenticated) return false;
      if (state.role?.nombre === "ROLE_ADMIN") return true;
      return state.permissions.some(
        (p) => p.recurso === recurso && p.accion === accion,
      );
    },
    [state.isAuthenticated, state.role, state.permissions],
  );

  return (
    <AuthContext.Provider
      value={{
        ...state,
        setSession,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
