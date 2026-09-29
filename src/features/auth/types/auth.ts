// Escritos a mano en vez de re-exportar components["schemas"] del OpenAPI
// generado: los DTOs de auth son records de Java sin anotaciones de
// validación, así que springdoc marca todos sus campos como opcionales,
// lo que obligaría a relajar el tipado del authStore sin necesidad real.
export interface LoginRequest {
  username: string;
  password: string;
}

export type LoginCredentials = LoginRequest;

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresInSeconds: number;
  usuario: {
    id: string;
    username: string;
    nombre: string;
    correo: string | null;
  };
  rol: {
    id: string;
    nombre: string;
  };
  permisos: {
    recurso: string;
    accion: string;
  }[];
}
