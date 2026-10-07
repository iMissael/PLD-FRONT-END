import { useState, useMemo, type ReactNode } from "react";
import { Search, X } from "lucide-react";
import { TablePagination } from "@/shared/components/TablePagination";
import { table } from "@/shared/components/ui/styles";

export interface ColumnDef<T> {
  header: ReactNode;
  accessorKey?: keyof T;
  cell?: (item: T, index: number, globalIndex: number) => ReactNode;
  className?: string;
  headerClassName?: string;
  align?: "left" | "center" | "right";
  width?: string;
}

export type PaginationConfig =
  | {
      mode: "client";
      defaultRowsPerPage?: number;
      rowsPerPageOptions?: number[];
    }
  | {
      mode: "server";
      page: number;
      rowsPerPage: number;
      totalCount: number;
      onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
      onRowsPerPageChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
      rowsPerPageOptions?: number[];
    };

export interface SearchConfig<T> {
  placeholder?: string;
  filterFn?: (item: T, query: string) => boolean;
  value?: string;
  onChange?: (value: string) => void;
}

export interface DataTableProps<T> {
  data: T[] | { contenido?: T[] } | undefined | null;
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  seleccionadoId?: string | number | null;
  selectedRowId?: string | number | null;
  getRowId?: (item: T, index: number) => string | number;
  onRowClick?: (item: T) => void;
  onRowDoubleClick?: (item: T) => void;
  doubleClickTitle?: string;
  search?: boolean | SearchConfig<T>;
  pagination?: boolean | PaginationConfig;
  headerActions?: ReactNode;
  filterBar?: ReactNode;
  containerClassName?: string;
}

export function DataTable<T>({
  data,
  columns,
  isLoading = false,
  loadingMessage = "Cargando registros...",
  emptyMessage = "No hay registros disponibles.",
  seleccionadoId,
  selectedRowId,
  getRowId = (item: unknown, idx: number) =>
    (item as { id?: string | number; idEntidad?: string | number; idRol?: string | number })?.id ??
    (item as { idEntidad?: string | number })?.idEntidad ??
    (item as { idRol?: string | number })?.idRol ??
    idx,
  onRowClick,
  onRowDoubleClick,
  doubleClickTitle = "Doble clic para modificar este registro",
  search = false,
  pagination = true,
  headerActions,
  filterBar,
  containerClassName = "",
}: DataTableProps<T>) {
  const activeSelectedId = selectedRowId !== undefined ? selectedRowId : seleccionadoId;

  // Extracción segura del arreglo (soporta arrays planos y respuestas paginadas { contenido: [...] })
  const safeData: T[] = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray((data as unknown as { contenido?: T[] })?.contenido)) {
      return (data as unknown as { contenido: T[] }).contenido ?? [];
    }
    return [];
  }, [data]);

  // Configuración de búsqueda
  const isSearchEnabled = Boolean(search);
  const searchConfig: SearchConfig<T> | undefined =
    typeof search === "object" ? search : undefined;

  const [localSearch, setLocalSearch] = useState("");
  const currentSearch = searchConfig?.value !== undefined ? searchConfig.value : localSearch;

  // Configuración de paginación
  const paginationConfig: PaginationConfig = useMemo(() => {
    if (typeof pagination === "object") {
      return pagination;
    }
    return {
      mode: "client",
      defaultRowsPerPage: 10,
      rowsPerPageOptions: [ 10, 25, 30],
    };
  }, [pagination]);

  const [localPage, setLocalPage] = useState(0);
  const [localRowsPerPage, setLocalRowsPerPage] = useState(
    paginationConfig.mode === "client" ? paginationConfig.defaultRowsPerPage ?? 10 : 10,
  );

  const isServerPagination = paginationConfig.mode === "server";
  const currentPage = isServerPagination ? paginationConfig.page : localPage;
  const currentRowsPerPage = isServerPagination
    ? paginationConfig.rowsPerPage
    : localRowsPerPage;
  const rowsPerPageOptions = paginationConfig.rowsPerPageOptions ?? [ 10, 25, 30];

  // 1. Filtrado de búsqueda
  const dataFiltrada = useMemo(() => {
    if (!safeData || safeData.length === 0) return [];
    if (!currentSearch.trim() || isServerPagination) return safeData;

    const query = currentSearch.toLowerCase().trim();

    if (searchConfig?.filterFn) {
      return safeData.filter((item) => searchConfig.filterFn!(item, query));
    }

    // Filtro por defecto: busca en todas las propiedades del objeto
    return safeData.filter((item) =>
      Object.values(item as Record<string, unknown>).some((val) =>
        String(val ?? "").toLowerCase().includes(query),
      ),
    );
  }, [safeData, currentSearch, isServerPagination, searchConfig]);

  // 2. Paginación de datos
  const totalElements = isServerPagination
    ? paginationConfig.totalCount
    : dataFiltrada.length;

  const paginatedData = useMemo(() => {
    if (!pagination || isServerPagination) return dataFiltrada;
    const start = currentPage * currentRowsPerPage;
    return dataFiltrada.slice(start, start + currentRowsPerPage);
  }, [dataFiltrada, currentPage, currentRowsPerPage, pagination, isServerPagination]);

  const handleSearchChange = (val: string) => {
    if (searchConfig?.onChange) {
      searchConfig.onChange(val);
    } else {
      setLocalSearch(val);
    }
    if (!isServerPagination) {
      setLocalPage(0);
    }
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    if (isServerPagination) {
      paginationConfig.onPageChange(event, newPage);
    } else {
      setLocalPage(newPage);
    }
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (isServerPagination) {
      paginationConfig.onRowsPerPageChange(e);
    } else {
      setLocalRowsPerPage(parseInt(e.target.value, 10));
      setLocalPage(0);
    }
  };

  const getAlignClass = (align?: "left" | "center" | "right") => {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
  };

  return (
    <div className={`flex flex-col gap-3 ${containerClassName}`}>
      {/* Barra de herramientas superior (Búsqueda, Filtros y Acciones) */}
      {(isSearchEnabled || filterBar || headerActions) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {isSearchEnabled && (
              <div className="relative flex items-center max-w-md w-full">
                <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={currentSearch}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={searchConfig?.placeholder ?? "Buscar..."}
                  className="w-full rounded-lg border border-border bg-card py-2 pr-9 pl-9 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {currentSearch && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange("")}
                    className="absolute right-2.5 rounded-full p-1 text-muted-foreground hover:bg-muted"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            )}
            {filterBar}
          </div>

          {headerActions && <div>{headerActions}</div>}
        </div>
      )}

      {/* Contenedor de la Tabla */}
      <div className={table.wrapper}>
        {isLoading ? (
          <div className="space-y-3 p-6 text-center">
            <p className="text-xs text-muted-foreground pb-2">{loadingMessage}</p>
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-10 w-full animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : safeData.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={table.root}>
              <thead className={table.head}>
                <tr>
                  {columns.map((col, idx) => (
                    <th
                      key={idx}
                      style={{ width: col.width }}
                      className={`${table.headCell} ${getAlignClass(col.align)} ${col.headerClassName ?? ""}`}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={table.body}>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="py-8 text-center text-xs text-muted-foreground"
                    >
                      No se encontraron registros que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, rowIndex) => {
                    const rowId = getRowId(item, rowIndex);
                    const isSelected = activeSelectedId != null && activeSelectedId === rowId;
                    const globalIdx = currentPage * currentRowsPerPage + rowIndex;

                    return (
                      <tr
                        key={rowId}
                        onClick={() => onRowClick?.(item)}
                        onDoubleClick={() => {
                          if (onRowDoubleClick) {
                            onRowDoubleClick(item);
                          } else if (onRowClick) {
                            onRowClick(item);
                          }
                        }}
                        title={onRowDoubleClick ? doubleClickTitle : undefined}
                        className={`${table.row(isSelected)} ${onRowClick || onRowDoubleClick ? "cursor-pointer" : ""}`}
                      >
                        {columns.map((col, colIdx) => (
                          <td
                            key={colIdx}
                            className={`${table.cell} ${getAlignClass(col.align)} ${col.className ?? ""}`}
                          >
                            {col.cell ? (
                              col.cell(item, rowIndex, globalIdx)
                            ) : col.accessorKey ? (
                              <span
                                title={
                                  item[col.accessorKey] !== undefined &&
                                  item[col.accessorKey] !== null
                                    ? String(item[col.accessorKey])
                                    : undefined
                                }
                                className="truncate block"
                              >
                                {String(item[col.accessorKey] ?? "—")}
                              </span>
                            ) : null}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación integrada */}
        {Boolean(pagination) && !isLoading && safeData.length > 0 && (
          <TablePagination
            component="div"
            count={totalElements}
            page={currentPage}
            onPageChange={handleChangePage}
            rowsPerPage={currentRowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={rowsPerPageOptions}
          />
        )}
      </div>
    </div>
  );
}
