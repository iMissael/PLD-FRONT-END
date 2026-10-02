# Guía Oficial y Estándar de Tablas (`<DataTable />`)

Este documento establece las reglas obligatorias de maquetado, diseño y comportamiento para todas las tablas del frontend del sistema PLD.

---

## 1. ¿Por qué las tablas tenían tamaños y anchos diferentes? (Causas Técnicas)

Si dos pantallas usan la misma tipografía y colores pero se ven de anchos distintos, se debe a estas **5 variables clave**:

1. **Algoritmo de cálculo de tabla (`table-layout: auto`)**:
   - Una tabla HTML sin columnas fijas calcula el ancho de cada celda a partir del contenido del texto.
   - En pantallas con muchas columnas (p. ej. *Buzón de Denuncias* con 9 columnas y `width: 140px`), la tabla acumula un ancho intrínseco de más de 1000px y activa el scroll horizontal del contenedor.
   - En pantallas con pocas columnas (p. ej. *Países* con 3 columnas), la tabla estira esas 3 columnas a lo largo del 100% del viewport.
2. **Falta de `min-w-full` en el contenedor con scroll**:
   - Todo contenedor con `overflow-x-auto` debe tener `<table className="w-full min-w-full">` para garantizar que la tabla nunca mida menos del 100% de la tarjeta contenedora.
3. **Anchos de columnas (`width`) arbitrarios o inexistentes**:
   - Dejar todas las columnas sin `width` hace que el navegador adivine las proporciones según el primer registro que cargue la API.
   - Columnas estándar como `ID`, `Clave`, `Fecha`, `Estatus` o `Acciones` **deben tener siempre anchos estandarizados**.
4. **Paginadores y Buscadores externos fuera del componente**:
   - Crear botones sueltos de `<Button>Anterior</Button>` o `<input>` fuera de la tarjeta de la tabla rompe el margen, el alto y la cohesión visual del panel.
5. **Estrategia de Detalle/Edición (Modal vs Formulario bajo la tabla)**:
   - Pantallas que abren un **Modal** mantienen la tabla a pantalla completa y fija.
   - Pantallas que incrustan el formulario abajo modifican el scroll vertical. Ambos enfoques son válidos, pero deben respetar el contenedor `flex flex-col gap-6`.

---

## 2. Reglas Obligatorias para todo el Proyecto

> [!IMPORTANT]
> **REGLA #1: Prohibido escribir `<table>` fuera de `src/shared/components/ui/`**.
> Todas las vistas y características deben consumir exclusivamente `<DataTable />` de `@/shared/components/DataTable`.

> [!IMPORTANT]
> **REGLA #2: Usar siempre `<StatusBadge />` o `<CatalogoBadge />`**.
> No escribir clases de color ad-hoc (`bg-amber-100`, `text-green-800`, etc.) para los estatus. Usar las variantes o tonos unificados (`activo`, `inactivo`, `R`, `V`, `A`, `D`).

> [!IMPORTANT]
> **REGLA #3: No inventar componentes de paginación manuales**.
> La paginación (sea en cliente o en servidor) se delega al prop `pagination` de `<DataTable />`.

---

## 3. Contrato de `<DataTable />`

### 3.1. Modo Paginación en Cliente (Catálogos en Memoria)
Úsalo cuando el backend devuelve la lista completa de registros (p. ej. Países, Entidades, Zonas, Tipos de Persona, etc.):

```tsx
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";

const columns: ColumnDef<MiEntidad>[] = [
  {
    header: "Clave",
    accessorKey: "clave",
    width: "120px",
    className: "font-mono font-semibold text-foreground",
  },
  {
    header: "Nombre",
    accessorKey: "nombre",
    className: "font-medium text-foreground",
  },
  {
    header: "Estatus",
    width: "140px",
    cell: (item) => (
      <CatalogoBadge tono={item.estatus === "A" ? "activo" : "inactivo"}>
        {item.estatus === "A" ? "Activo" : "Inactivo"}
      </CatalogoBadge>
    ),
  },
];

<DataTable<MiEntidad>
  data={data}
  columns={columns}
  isLoading={isLoading}
  emptyMessage="No hay registros registrados."
  seleccionadoId={seleccionado?.id ?? null}
  getRowId={(item) => item.id}
  onRowClick={(item) => setSeleccionado(item)}
  onRowDoubleClick={(item) => handleEditar(item)}
  doubleClickTitle="Doble clic para modificar este registro"
  search={{
    placeholder: "Buscar por nombre o clave...",
    filterFn: (item, query) =>
      item.nombre.toLowerCase().includes(query.toLowerCase()) ||
      item.clave.toLowerCase().includes(query.toLowerCase()),
  }}
  pagination={{
    mode: "client",
    defaultRowsPerPage: 10,
    rowsPerPageOptions: [5, 10, 25, 50],
  }}
/>
```

---

### 3.2. Modo Paginación en Servidor (Datasets Grandes o Buzón)
Úsalo cuando el backend devuelve una página (`PaginaResponse` o `Page<T>` con `totalElements`, `page`, `size`):

```tsx
<DataTable<Denuncia>
  data={data?.content}
  columns={columns}
  isLoading={isLoading}
  emptyMessage="No hay denuncias disponibles."
  filterBar={<MiBarraDeFiltros />}
  pagination={{
    mode: "server",
    page: page,
    rowsPerPage: rowsPerPage,
    totalCount: data?.totalElements ?? 0,
    onPageChange: (_, newPage) => setPage(newPage),
    onRowsPerPageChange: (e) => {
      setRowsPerPage(parseInt(e.target.value, 10));
      setPage(0);
    },
    rowsPerPageOptions: [10, 20, 50],
  }}
  onRowDoubleClick={(item) => setSelectedId(item.id)}
  doubleClickTitle="Doble clic para ver detalle"
/>
```

---

## 4. Anchos de Columna Recomendados (`width`)

Para evitar saltos visuales entre pantallas, utiliza los anchos estándar en `ColumnDef`:

| Tipo de Columna | Prop `width` recomendada | Clases recomendadas |
| :--- | :--- | :--- |
| **ID / Consecutivo** | `width: "80px"` | `font-mono font-bold text-foreground` |
| **Clave / Código / CURP** | `width: "120px"` | `font-mono font-semibold text-foreground` |
| **Fechas (`dd/mm/aaaa`)** | `width: "140px"` | `text-muted-foreground` |
| **Badges de Estatus** | `width: "140px"` | `<CatalogoBadge>` o `<StatusBadge>` |
| **Botón de Acción única** | `width: "90px"` | `headerClassName: "text-right"`, `className: "text-right"` |
| **Texto descriptivo / Nombre** | *Sin width (flexible)* | `font-medium text-foreground` o `text-muted-foreground` |

---

## 5. Estructura Estándar de una Página con Tabla

Toda página debe seguir esta jerarquía para asegurar márgenes idénticos:

```tsx
export function CatalogoPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* 1. Encabezado de página */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Título del Catálogo</h2>
          <p className="text-sm text-muted-foreground">Descripción de la funcionalidad.</p>
        </div>
        <Button onClick={handleNuevo}>Nuevo registro</Button>
      </div>

      {/* 2. Mensaje de error si aplica */}
      {mensajeError ? <Alert>{mensajeError}</Alert> : null}

      {/* 3. Tabla unificada */}
      <DataTable ... />

      {/* 4. Formulario (si es inline) o Modal */}
      {mostrarFormulario ? <Formulario ... /> : null}
    </div>
  );
}
```
