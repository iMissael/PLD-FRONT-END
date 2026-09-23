# PLD-FRONT

Frontend en React para consumir la API REST del backend de `denuncias-app`
(sistema PLD multi-tenant, Spring Boot / arquitectura hexagonal). Este
repositorio no tiene lógica de negocio propia: toda vive en el backend. La
estructura es por features, no por capas hexagonales.

## Stack

- Node.js 20+, pnpm
- Vite 6 + React 19 + TypeScript 5 (estricto)
- TanStack Query v5 + Axios
- React Router v7
- React Hook Form v7 + Zod v3
- Tailwind CSS v4 (config CSS-first, sin `tailwind.config.js`)
- Vitest + React Testing Library + MSW
- ESLint + Prettier

## Empezar

```bash
pnpm install
cp .env.example .env.local   # ajusta VITE_API_BASE_URL si tu backend no corre en localhost:8080
pnpm dev
```

Para entrar a la app en desarrollo, usa una URL con el tenant incluido, por
ejemplo `http://localhost:5173/SICANETSC/PLD/<tenantId>/personas-bloqueadas`
(no hay login ni selector de tenant todavía).

## Scripts

| Script                         | Qué hace                                                        |
| ------------------------------ | --------------------------------------------------------------- |
| `pnpm dev`                     | Servidor de desarrollo                                          |
| `pnpm build`                   | Typecheck + build de producción                                 |
| `pnpm typecheck`               | Solo typecheck (`tsc -b --noEmit`)                              |
| `pnpm lint`                    | ESLint                                                          |
| `pnpm format` / `format:check` | Prettier (aplica / solo verifica)                               |
| `pnpm test` / `test:watch`     | Vitest (una vez / watch)                                        |
| `pnpm gen:api`                 | Genera tipos desde el OpenAPI del backend (`VITE_API_DOCS_URL`) |

## Estructura

```
src/
  api/                 # cliente Axios + interceptores (X-Tenant-Id, errores ProblemDetail)
  features/
    personas-bloqueadas/
      api/             # funciones que llaman al backend
      types/           # tipos y schemas de Zod
      hooks/           # hooks de TanStack Query
      components/      # formulario, tabla
      pages/           # páginas del feature
  shared/              # UI, hooks y utils reutilizables entre features
  routes/              # router.tsx
  config/              # env.ts (variables de entorno validadas con Zod)
  test/                # setup de Vitest + mocks de MSW
```

Regla del proyecto: los componentes nunca llaman a Axios/fetch directo, solo
a hooks de `api/`+`hooks/` del feature.

## Multi-tenant

El tenant activo viene de la URL, no de configuración: todas las rutas de
negocio cuelgan de `/SICANETSC/PLD/:tenantId/...` (`routes/router.tsx`).
`TenantRouteLayout` lee ese `:tenantId` al navegar y lo publica en
`shared/tenant/tenantStore.ts`; `api/interceptors/tenantInterceptor.ts` lo
lee de ahí en cada request y (a) le antepone `/SICANETSC/PLD/{tenantId}` a
la URL y (b) lo manda también como header `X-Tenant-Id` (el backend valida
que ambos coincidan). No hay login todavía, así que se entra siempre con un
link que ya incluye el tenant.

RFC y CURP nunca viajan en la URL visible del front (ni como segmento ni
como query param de una ruta navegable): cuando el backend los pide como
query params (actualizar/eliminar por RFC o CURP), van en la llamada de
Axios que dispara un botón, nunca en `routes/router.tsx` ni en la barra de
direcciones.

## Feature: personas-bloqueadas

Primera pieza construida: búsqueda de coincidencias
(`GET /personas-bloqueadas/consulta-bloqueados`) con formulario (nombre,
RFC, CURP, fecha de nacimiento) y tarjetas de resultado (persona principal +
sus alias + si la coincidencia fue directa o vía alias). Las funciones para
crear, actualizar y "eliminar" (cambio de estatus) por RFC/CURP, y carga
masiva, ya están en `api/` y `hooks/`, listas para cuando se construyan sus
pantallas. El front nunca llama a los endpoints por id que también expone
el backend (`/personas-bloqueadas/{id}`): toda identificación es por RFC o
CURP, por decisión de producto.

Los tipos en `types/personaBloqueada.ts` están escritos a mano contra los
DTOs reales del backend (no son un placeholder). La única pieza sin
confirmar es `FilaErrorCarga` (detalle de errores de la carga masiva),
marcada con un comentario en el archivo. En cuanto el backend tenga su
OpenAPI/Swagger disponible, corre `pnpm gen:api` (con `VITE_API_DOCS_URL`
apuntando a él) y reemplaza estos tipos por los generados.
