import { useState, useMemo, type ReactNode } from "react";
import { Info } from "lucide-react";
import { SearchInput } from "@/shared/components/molecules/SearchInput";
import { TablePagination } from "@/shared/components/molecules/TablePagination";
import { EmptyState } from "@/shared/components/molecules/EmptyState";
import { Skeleton } from "@/shared/components/atoms/Skeleton";
import { table } from "@/shared/styles/tokens";

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
  getRowId = (item: T, index: number) => {
    if (item && typeof item === "object" && "id" in item) {
      return (item as Record<string, unknown>).id as string | number;
    }
    return index;
  },
  onRowClick,
  onRowDoubleClick,
  doubleClickTitle = "Doble clic para ver detalles",
  search = false,
  pagination = true,
  headerActions,
  filterBar,
  containerClassName = "",
}: DataTableProps<T>) {
  // Manejo de compatibilidad para datos paginados del backend o arreglos directos
  const safeData: T[] = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if ("contenido" in data && Array.isArray(data.contenido)) {
      return data.contenido;
    }
    return [];
  }, [data]);

  const activeSelectedId = seleccionadoId !== undefined ? seleccionadoId : selectedRowId;

  // Manejo de estado interno de búsqueda si no es controlada
  const isSearchEnabled = Boolean(search);
  const searchConfig = typeof search === "object" ? search : undefined;
  const [localSearch, setLocalSearch] = useState("");
  const currentSearch = searchConfig?.value !== undefined ? searchConfig.value : localSearch;

  // Manejo de estado de paginación
  const isServerPagination =
    typeof pagination === "object" && pagination.mode === "server";
  const serverConfig = isServerPagination ? pagination : undefined;
  const clientConfig =
    typeof pagination === "object" && pagination.mode === "client" ? pagination : undefined;

  const [localPage, setLocalPage] = useState(0);
  const [localRowsPerPage, setLocalRowsPerPage] = useState(
    clientConfig?.defaultRowsPerPage ?? 10,
  );

  const currentPage = serverConfig ? serverConfig.page : localPage;
  const currentRowsPerPage = serverConfig ? serverConfig.rowsPerPage : localRowsPerPage;
  const rowsPerPageOptions =
    (serverConfig ? serverConfig.rowsPerPageOptions : clientConfig?.rowsPerPageOptions) ?? [
      10, 25, 30,
    ];

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
  const totalElements = serverConfig
    ? serverConfig.totalCount
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
    if (serverConfig) {
      serverConfig.onPageChange(event, newPage);
    } else {
      setLocalPage(newPage);
    }
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newRows = parseInt(event.target.value, 10);
    if (serverConfig) {
      serverConfig.onRowsPerPageChange(event);
    } else {
      setLocalRowsPerPage(newRows);
      setLocalPage(0);
    }
  };

  const getAlignClass = (align?: "left" | "center" | "right") => {
    switch (align) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  return (
    <div className={`flex flex-col gap-3 ${containerClassName}`}>
      {/* Barra de herramientas superior (Búsqueda, Filtros y Acciones) */}
      {(isSearchEnabled || filterBar || headerActions || (onRowDoubleClick && doubleClickTitle)) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {isSearchEnabled && (
              <SearchInput
                value={currentSearch}
                onChange={handleSearchChange}
                placeholder={searchConfig?.placeholder ?? "Buscar..."}
              />
            )}
            {filterBar}
          </div>

          <div className="flex items-center gap-3">
            {Boolean(onRowDoubleClick && doubleClickTitle) && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-2.5 py-1 rounded-md border border-border/40">
                <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                {doubleClickTitle}
              </span>
            )}
            {headerActions && <div>{headerActions}</div>}
          </div>
        </div>
      )}

      {/* Contenedor de la Tabla */}
      <div className={table.wrapper}>
        {isLoading ? (
          <div className="space-y-3 p-6 text-center">
            <p className="text-xs text-muted-foreground pb-2">{loadingMessage}</p>
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} className="h-10 w-full" />
            ))}
          </div>
        ) : safeData.length === 0 ? (
          <div className="py-8">
            <EmptyState
              titulo="Sin datos"
              descripcion={emptyMessage ?? "No hay registros disponibles."}
            />
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
                    <td colSpan={columns.length} className="py-6">
                      <EmptyState
                        titulo="Sin coincidencias"
                        descripcion="No se encontraron registros que coincidan con el criterio de búsqueda."
                      />
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
