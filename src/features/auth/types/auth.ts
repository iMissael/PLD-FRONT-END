// Escritos a mano en vez de re-exportar components["schemas"] del OpenAPI
// generado: los DTOs de auth son records de Java sin anotaciones de
// validación, así que springdoc marca todos sus campos como opcionales,
// lo que obligaría a relajar el tipado del authStore sin necesidad real.
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresInSeconds: number;
  usuario: {
    id: number;
    empleadoId: number;
    username: string;
  };
  rol: {
    id: number;
    nombre: string;
  };
  permisos: {
    recurso: string;
    accion: string;
  }[];
}
