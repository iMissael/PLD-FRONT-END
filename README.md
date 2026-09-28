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
- Componentes de UI estilo shadcn sobre Radix (`shared/components/ui`), `lucide-react` para íconos, `sonner` para avisos y `zustand` para la sesión
- Vitest + React Testing Library + MSW
- ESLint + Prettier

## Empezar

```bash
pnpm install
cp .env.example .env.local   # ajusta VITE_API_BASE_URL si tu backend no corre en localhost:8080
pnpm dev
```

Para entrar a la app en desarrollo, usa una URL con el tenant incluido, por
ejemplo `http://localhost:5173/SICANETSC/PLD/<tenantId>/login`. Cualquier otra
ruta del tenant te manda al login si no hay sesión. Después del login se elige
la sucursal y se entra a la app (ver "Autenticación").

## Scripts

| Script                         | Qué hace                                                  |
| ------------------------------ | --------------------------------------------------------- |
| `pnpm dev`                     | Servidor de desarrollo                                    |
| `pnpm build`                   | Typecheck + build de producción                           |
| `pnpm typecheck`               | Solo typecheck (`tsc -b --noEmit`)                        |
| `pnpm lint`                    | ESLint                                                    |
| `pnpm format` / `format:check` | Prettier (aplica / solo verifica)                         |
| `pnpm test` / `test:watch`     | Vitest (una vez / watch)                                  |
| `pnpm gen:api`                 | Genera `src/api/schema.d.ts` desde el OpenAPI del backend |

## Estructura

```
src/
  api/                 # cliente Axios + interceptores (tenant, token, errores ProblemDetail) y schema.d.ts generado
  features/            # una carpeta por pantalla o dominio; el árbol sigue al menú lateral
    auth/              # login
    sucursales/        # elegir sucursal tras el login
    catalogos/         # hooks de solo lectura de catálogos (para selectores)
    socios/            # búsqueda de socios y perfil de riesgo
    configuracion-alertas/            # personas bloqueadas: consulta y carga masiva
    configuraciones/
      oficial-cumplimiento/           # ficha del oficial (datos, domicilio, parámetros PLD)
      matriz-riesgo/                  # versión activa y publicación de nuevas versiones
      administracion/{usuarios,roles,permisos}/
      ubicacion-geografica/{zonas-geograficas,entidades,localidades,paises}/
    operacion/
      evaluacion-riesgo/              # tablero de la matriz de riesgo: al elegir un socio se evalúa solo con su perfil
      consulta-listas/                # consulta de listas de coincidencia
    <feature>/
      api/             # funciones que llaman al backend (<x>Api.ts)
      hooks/           # hooks de TanStack Query (use<X>.ts)
      types/           # tipos y schemas de Zod
      components/      # formularios, tablas…
      pages/           # páginas del feature
      utils/           # funciones puras del feature (con sus pruebas)
  shared/
    auth/              # sesión (zustand), sucursal activa y guards de ruta
    components/ui/     # primitivas shadcn (button, input, select, sheet…)
    layouts/           # AppLayout (menú lateral), TenantRouteLayout, ContenidoAcotado
    tenant/            # tenant activo y rutas dentro del tenant
    utils/             # cn(), fechas, entradas (formatos de captura) y validacion (ayudantes de Zod)
  routes/              # router.tsx
  config/              # env.ts (variables de entorno validadas con Zod)
  test/                # setup de Vitest, test-utils y mocks de MSW
```

Regla del proyecto: los componentes nunca llaman a Axios/fetch directo, solo
a hooks de `api/`+`hooks/` del feature.

## Multi-tenant

El tenant activo viene de la URL, no de configuración: todas las rutas de
negocio cuelgan de `/SICANETSC/PLD/:tenantId/...` (`routes/router.tsx`).
`TenantRouteLayout` lee ese `:tenantId` al navegar y lo publica en
`shared/tenant/tenantStore.ts`; `api/interceptors/tenantInterceptor.ts` lo
lee de ahí en cada request y (a) le antepone `/SICANETSC/PLD/{tenantId}/api` a
la URL (los controllers del backend cuelgan de `/api/...` y el tenant se les
antepone) y (b) lo manda también como header `X-Tenant-Id` (el backend valida
que ambos coincidan). Se entra siempre con un link que ya incluye el tenant.
Para armar rutas del front dentro del tenant usa `useRutaTenant()`
(`shared/tenant/useRutaTenant.ts`) en lugar de escribir rutas absolutas.

## Autenticación

El backend exige un JWT en todo salvo el login. Flujo:

1. `/SICANETSC/PLD/:tenantId/login` → `POST /api/auth/login`. La sesión se guarda
   en `shared/auth/authStore.ts` (zustand): en `sessionStorage`, o en
   `localStorage` si se marca "Recuérdame".
2. `/seleccionar-sucursal` → se elige la sucursal de trabajo
   (`shared/auth/sucursalActivaStore.ts`). Una sesión nueva siempre la vuelve a pedir.
3. Dentro de la app, `authInterceptor` manda `Authorization: Bearer <token>`.
   Un 401 fuera del login cierra la sesión y lleva al login del tenant.

La sesión guarda el tenant en el que se inició: un token no sirve en otro tenant
(`RequireAuth` lo trata como sin sesión y `authInterceptor` no lo manda).
`RequireAuth` y `RequireSucursal` (`shared/auth/`) protegen las rutas.

## Componentes de UI

`shared/components/ui/` tiene primitivas al estilo shadcn (Radix + Tailwind):
button, input, select, popover, sheet, table, form (React Hook Form), badge,
card, checkbox, collapsible, skeleton y `sonner` para avisos. Las pantallas
nuevas deberían armarse con estas primitivas antes de escribir Tailwind a mano.
Los formularios con React Hook Form usan `FormControl` directo sobre el
`<Input>`: si se envuelve un contenedor, la etiqueta queda asociada al
contenedor y no al campo.

## Paleta de colores (regla 60 / 30 / 10)

La paleta oficial vive solo en `src/index.css` como tokens (`--primary`,
`--nav`, `--border`…) y Tailwind los expone como `bg-primary`, `text-nav`, etc.
No escribas hexadecimales ni tonos sueltos de Tailwind (`emerald`, `sky`…) en
los componentes.

| Peso | Rol                            | Tokens                                                                                                    |
| ---- | ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| 60 % | Superficies neutras            | `background` (#f8fafc, fondo de página), `card` y `popover` (#ffffff)                                     |
| 30 % | Estructura y navegación        | grises de texto, borde y hover (`foreground`, `muted*`, `border`, `secondary*`) y verde del menú (`nav*`) |
| 10 % | Acento, solo lo que se acciona | `primary` (#4f46e5), `primary-hover` (#6366f1), `ring` (foco)                                             |

Aparte de la regla, los colores de estado (`success`, `warning`, `destructive`)
solo comunican resultado y el gradiente `brand-mint` → `brand-teal` es de
identidad (login, elegir sucursal, logo): ninguno de los dos decora. Los
botones primarios (`<Button>`) son índigo; el menú activo, verde; "Cerrar
sesión", rosa (`logout`). En este proyecto `--accent` es el de shadcn (fondo de
hover), no el acento de marca. No hay modo oscuro todavía.

## Evaluación de riesgo automática

Al elegir un socio en `operacion/evaluacion-riesgo`, `useEvaluacionAutomatica` pide su
perfil (`GET /socios/{ref}/perfil-riesgo`: identidad, actividad, domicilio, antigüedad en el
giro, PEP, crédito solicitado e historial crediticio), arma la solicitud con
`utils/solicitud.ts` (la misma que usa el formulario) y la envía una sola vez por elección.
Si al perfil le falta algo, no evalúa: el tablero dice qué falta y "Completar y evaluar" abre el
formulario con lo que ya se sabe. Un socio con evaluación en la sesión no se evalúa de nuevo
(el botón "Volver a evaluar" lo hace a propósito). La moneda no se guarda con el crédito y se
manda como MXN; tipo de pago y EBR son opcionales y no se mandan.

## Captura de texto y validaciones

Todo el texto que se captura va en **mayúsculas**, salvo el correo y el nombre de
usuario (con el que se inicia sesión, que el backend compara tal cual), que van en
minúsculas, y las contraseñas, que no se tocan. El backend no valida formato ni
largo, así que el frontend es la única barrera: los máximos de los esquemas de Zod
son los de las columnas de la base de datos (un texto más largo termina en un 500).

- `shared/utils/entradas.ts`: formateadores que se aplican al escribir o pegar
  (`mayusculas`, `soloDigitos`, `rfc`, `nombreUsuario`…).
- `shared/components/InputFormateado.tsx`: `<InputFormateado {...field} formato={mayusculas} maxLength={50} />`
  aplica el formato, conserva el cursor y quita espacios sobrantes al salir. Con
  `formato` no pongas `maxLength` del navegador: lo maneja el componente (pegar
  "(951) 000-0001" se cortaría antes de limpiarlo).
- `shared/utils/validacion.ts`: `texto`, `conFormato`, patrones de RFC/CURP y
  demás ayudantes para los esquemas de Zod (oficial de cumplimiento y usuarios).

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
marcada con un comentario en el archivo.

## Tipos generados del backend

`src/api/schema.d.ts` se genera del OpenAPI del backend con el backend
levantado: `VITE_API_DOCS_URL=http://localhost:8080/v3/api-docs pnpm gen:api`
(el script lee la variable del shell, no de `.env.local`). Las features de
oficial de cumplimiento, matriz de riesgo, administración, evaluación de
riesgo y consulta de listas toman sus tipos de ahí
(`components["schemas"]["..."]`); vuelve a generarlo cuando cambien los DTOs
del backend. `personas-bloqueadas` y `auth` siguen con tipos escritos a mano.

## Pruebas

Las pruebas de componentes usan `renderWithProviders` (`test/test-utils.tsx`):
fija el tenant de prueba y monta React Query y un router en memoria. Los
endpoints se simulan con MSW en `test/mocks/handlers.ts`; las URLs llevan
`/SICANETSC/PLD/{tenant}/api/...` igual que en producción.
