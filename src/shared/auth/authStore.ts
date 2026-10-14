import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

import type { LoginResponse } from "@/features/auth/types/auth";

const REMEMBER_FLAG_KEY = "auth-remember";
const STORAGE_KEY = "auth-storage";

const ROL_ADMINISTRADOR = ["ADMINISTRADOR"];

export function esRolAdmin(nombre: string | undefined | null) {
  return Boolean(nombre) && ROL_ADMINISTRADOR.includes(nombre!.trim().toUpperCase());
}

function getActiveStorage(): Storage {
  return localStorage.getItem(REMEMBER_FLAG_KEY) === "true"
    ? localStorage
    : sessionStorage;
}

// El storage se resuelve en cada llamada (no queda fijo al crear el store)
// para que "Recuérdame" pueda cambiar, sesión a sesión, si el token
// sobrevive el cierre del navegador (localStorage) o no (sessionStorage).
const rememberAwareStorage: StateStorage = {
  getItem: (name) => getActiveStorage().getItem(name),
  setItem: (name, value) => getActiveStorage().setItem(name, value),
  removeItem: (name) => getActiveStorage().removeItem(name),
};

interface AuthState {
  token: string | null;
  /** Tenant en el que se inició sesión: un token no vale para otro tenant. */
  tenantId: string | null;
  usuario: LoginResponse["usuario"] | null;
  rol: LoginResponse["rol"] | null;
  permisos: LoginResponse["permisos"];
  /** ¿Hay una sesión válida para este tenant? */
  isAuthenticated: (tenantId: string) => boolean;
  /** El administrador pasa siempre; el resto necesita el permiso exacto. */
  hasPermission: (recurso: string, accion: string) => boolean;
  setSession: (tenantId: string, data: LoginResponse, remember: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      tenantId: null,
      usuario: null,
      rol: null,
      permisos: [],
      isAuthenticated: (tenantId) => get().token !== null && get().tenantId === tenantId,
      hasPermission: (recurso, accion) => {
        if (esRolAdmin(get().rol?.nombre)) return true;
        return get().permisos.some((p) => p.recurso === recurso && p.accion === accion);
      },
      setSession: (tenantId, data, remember) => {
        localStorage.setItem(REMEMBER_FLAG_KEY, String(remember));
        set({
          token: data.token,
          tenantId,
          usuario: data.usuario,
          rol: data.rol,
          permisos: data.permisos,
        });
      },
      logout: () => {
        set({ token: null, tenantId: null, usuario: null, rol: null, permisos: [] });
        localStorage.removeItem(REMEMBER_FLAG_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_KEY);
      },
    }),
    { name: STORAGE_KEY, storage: createJSONStorage(() => rememberAwareStorage) },
  ),
);

/** Único origen del token: el store persistido. Sin fallbacks a claves legacy. */
export function getAuthToken(): string | null {
  return useAuthStore.getState().token;
}
