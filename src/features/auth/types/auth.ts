export interface LoginCredentials {
  username: string;
  password: string;
}

export interface Permiso {
  recurso: string;
  accion: string;
}

export interface Usuario {
  id: number;
  empleadoId: number;
  username: string;
}

export interface Rol {
  id: number;
  nombre: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresInSeconds: number;
  usuario: Usuario;
  rol: Rol;
  permisos: Permiso[];
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: Usuario | null;
  role: Rol | null;
  permissions: Permiso[];
}
