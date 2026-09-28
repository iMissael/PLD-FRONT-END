import { useCallback, useState, type ReactNode } from "react";
import { setAuthToken } from "../authStore";
import type { AuthState, LoginResponse } from "../types/auth";
import { AuthContext } from "./authContextInstance";

const USER_KEY = "pld_auth_user";
const ROLE_KEY = "pld_auth_role";
const PERM_KEY = "pld_auth_permissions";

function getInitialState(): AuthState {
  if (typeof window === "undefined") {
    return { isAuthenticated: false, token: null, user: null, role: null, permissions: [] };
  }
  const token = sessionStorage.getItem("pld_auth_token");
  const user = sessionStorage.getItem(USER_KEY);
  const role = sessionStorage.getItem(ROLE_KEY);
  const perms = sessionStorage.getItem(PERM_KEY);

  if (token && user) {
    try {
      return {
        isAuthenticated: true,
        token,
        user: JSON.parse(user),
        role: role ? JSON.parse(role) : null,
        permissions: perms ? JSON.parse(perms) : [],
      };
    } catch {
      // Fallback if parsing fails
    }
  }

  return { isAuthenticated: false, token: null, user: null, role: null, permissions: [] };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(getInitialState);

  const setSession = useCallback((response: LoginResponse) => {
    setAuthToken(response.token);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(USER_KEY, JSON.stringify(response.usuario));
      sessionStorage.setItem(ROLE_KEY, JSON.stringify(response.rol));
      sessionStorage.setItem(PERM_KEY, JSON.stringify(response.permisos ?? []));
    }
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
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(ROLE_KEY);
      sessionStorage.removeItem(PERM_KEY);
    }
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
