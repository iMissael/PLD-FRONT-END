import { http, HttpResponse } from "msw";

import type { ResultadoBusquedaResponse } from "@/features/configuracion-alertas/types/personaBloqueada";

/**
 * Debe coincidir con el tenant que fijan los tests vía
 * `setCurrentTenantId(...)` (ver `ConsultaBloqueadosPage.test.tsx`), porque
 * `tenantInterceptor.ts` arma la URL real con ese valor.
 */
export const TEST_TENANT_ID = "test-tenant-id";
const API_BASE_URL = `http://localhost:8080/SICANETSC/PLD/${TEST_TENANT_ID}`;

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
];
