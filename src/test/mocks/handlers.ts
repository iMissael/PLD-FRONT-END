import { http, HttpResponse } from "msw";

import type { components } from "@/api/schema";
import type { LoginRequest, LoginResponse } from "@/features/auth/types/auth";
import type { ResultadoBusquedaResponse } from "@/features/configuracion-alertas/types/personaBloqueada";

/**
 * Debe coincidir con el tenant que fijan los tests vía
 * `setCurrentTenantId(...)` (ver `ConsultaBloqueadosPage.test.tsx`), porque
 * `tenantInterceptor.ts` arma la URL real con ese valor.
 */
export const TEST_TENANT_ID = "test-tenant-id";
const API_BASE_URL = `http://localhost:8080/SICANETSC/PLD/${TEST_TENANT_ID}`;

type UsuarioResponse = components["schemas"]["UsuarioResponse"];
type RolResponse = components["schemas"]["RolResponse"];
type PermisoResponse = components["schemas"]["PermisoResponse"];

const usuarios: UsuarioResponse[] = [
  {
    idUsuario: "bbbbbbbb-0000-0000-0000-000000000001",
    username: "admin",
    nombre: "Administrador",
    correo: "admin@example.com",
    estado: "ACTIVO",
    rolId: "d0000000-0000-0000-0000-000000000001",
    nacionalidadId: "c1000000-0000-0000-0000-000000000001",
  },
];

const roles: RolResponse[] = [
  {
    idRol: "d0000000-0000-0000-0000-000000000001",
    nombre: "ROLE_ADMIN",
    categoria: "ESTANDAR",
    descripcion: "Administrador general del sistema",
    estado: "ACTIVO",
  },
];

const permisos: PermisoResponse[] = [
  {
    idPermiso: "e0000000-0000-0000-0000-000000000001",
    recurso: "usuarios",
    accion: "crear",
    descripcion: "Permite crear usuarios",
    estado: "ACTIVO",
  },
];

const loginResponse: LoginResponse = {
  token: "fake-jwt-token",
  tokenType: "Bearer",
  expiresInSeconds: 28800,
  usuario: {
    id: "bbbbbbbb-0000-0000-0000-000000000001",
    username: "admin",
    nombre: "Administrador",
    correo: "admin@example.com",
  },
  rol: { id: "d0000000-0000-0000-0000-000000000001", nombre: "ROLE_ADMIN" },
  permisos: [{ recurso: "usuarios", accion: "crear" }],
};

const resultadosDeEjemplo: ResultadoBusquedaResponse[] = [
  {
    personaPrincipal: {
      id: 1,
      nombreCompleto: "Juan Pérez López",
      rfc: "PELJ800101ABC",
      curp: "PELJ800101HDFRPN01",
      fechaNacimiento: "1980-01-01",
      pais: "México",
      nombreLista: "OFAC",
      fechaPublicacion: "2020-05-10",
      oficio: null,
      informacionMotivo: null,
      alias: null,
      idPersonaPrincipal: null,
      estatus: "ACTIVO",
      createdAt: "2024-01-01T00:00:00-06:00",
      updatedAt: "2024-01-01T00:00:00-06:00",
    },
    alias: [],
    coincidenciaViaAlias: false,
    aliasCoincidentes: [],
  },
];

/**
 * Handlers por defecto usados en las pruebas. Cada test puede sobreescribir
 * uno puntual con `server.use(...)` para simular errores o casos vacíos.
 */
export const handlers = [
  http.get(`${API_BASE_URL}/personas-bloqueadas/consulta-bloqueados`, () => {
    return HttpResponse.json(resultadosDeEjemplo);
  }),

  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as LoginRequest;
    if (body.username === "admin" && body.password === "Admin123!") {
      return HttpResponse.json(loginResponse);
    }
    return HttpResponse.json(
      { detail: "Usuario o contraseña incorrectos" },
      { status: 401 },
    );
  }),

  http.get(`${API_BASE_URL}/usuarios`, () => HttpResponse.json(usuarios)),
  http.post(`${API_BASE_URL}/usuarios`, async ({ request }) => {
    const body = (await request.json()) as Partial<UsuarioResponse>;
    return HttpResponse.json(
      { ...body, idUsuario: crypto.randomUUID(), estado: "ACTIVO" },
      { status: 201 },
    );
  }),

  http.get(`${API_BASE_URL}/roles`, () => HttpResponse.json(roles)),
  http.post(`${API_BASE_URL}/roles`, async ({ request }) => {
    const body = (await request.json()) as Partial<RolResponse>;
    return HttpResponse.json(
      { ...body, idRol: crypto.randomUUID(), estado: "ACTIVO" },
      { status: 201 },
    );
  }),
  http.get(`${API_BASE_URL}/roles/:rolId/permisos`, () => HttpResponse.json([])),

  http.get(`${API_BASE_URL}/permisos`, () => HttpResponse.json(permisos)),
  http.post(`${API_BASE_URL}/permisos`, async ({ request }) => {
    const body = (await request.json()) as Partial<PermisoResponse>;
    return HttpResponse.json(
      { ...body, idPermiso: crypto.randomUUID(), estado: "ACTIVO" },
      { status: 201 },
    );
  }),
];
