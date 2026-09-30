import { useState } from "react";
import { Calendar, Filter, X } from "lucide-react";
import { es } from "@/shared/i18n/es";
import { TablePagination } from "@/shared/components/TablePagination";
import { useListarDenuncias } from "../hooks/useDenuncias";
import type { EstadoDenuncia } from "../types/buzon";
import { DetalleDenunciaModal } from "./DetalleDenunciaModal";

const BADGE_STYLES: Record<EstadoDenuncia, string> = {
  R: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  V: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
  A: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
  D: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export function GestionDenunciasPage() {
  const [estadoFilter, setEstadoFilter] = useState<EstadoDenuncia | undefined>();
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data, isLoading } = useListarDenuncias({
    estado: estadoFilter,
    fechaDesde: fechaDesde ? new Date(fechaDesde).toISOString() : undefined,
    fechaHasta: fechaHasta ? new Date(fechaHasta).toISOString() : undefined,
    page,
    size: rowsPerPage,
  });

  const hayFiltros = Boolean(estadoFilter || fechaDesde || fechaHasta);

  const limpiarFiltros = () => {
    setEstadoFilter(undefined);
    setFechaDesde("");
    setFechaHasta("");
    setPage(0);
  };

  const handleChangePage = (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {es.buzon.adminTitle}
          </h1>
          <p className="text-xs text-muted-foreground">
            {es.buzon.adminSubtitle}
          </p>
        </div>

        {/* Filter Toolbar: Fecha y Estatus */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filtro por Estatus */}
          <div className="flex items-center gap-1.5">
            <Filter className="size-3.5 text-muted-foreground" />
            <select
              value={estadoFilter ?? ""}
              onChange={(e) => {
                const val = e.target.value as EstadoDenuncia | "";
                setEstadoFilter(val ? val : undefined);
                setPage(0);
              }}
              className="rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Todos los estatus</option>
              <option value="R">Recepción (R)</option>
              <option value="V">Verificación (V)</option>
              <option value="A">Atendida (A)</option>
              <option value="D">Desechada (D)</option>
            </select>
          </div>

          {/* Filtro por Fecha Desde */}
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 text-muted-foreground" />
            <label className="text-[11px] text-muted-foreground">Desde:</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => {
                setFechaDesde(e.target.value);
                setPage(0);
              }}
              className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Filtro por Fecha Hasta */}
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] text-muted-foreground">Hasta:</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => {
                setFechaHasta(e.target.value);
                setPage(0);
              }}
              className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Botón para limpiar filtros */}
          {hayFiltros && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="size-3" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-10 w-full animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : !data || data.content.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            {es.common.empty}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Fecha Incidente</th>
                  <th className="px-4 py-3 font-semibold">Denunciado</th>
                  <th className="px-4 py-3 font-semibold">Descripción</th>
                  <th className="px-4 py-3 font-semibold">Estatus</th>
                  <th className="px-4 py-3 font-semibold text-right">
                    Doble clic para editar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.content.map((item) => (
                  <tr
                    key={item.id}
                    onDoubleClick={() => setSelectedId(item.id)}
                    title="Doble clic para ver o modificar este registro"
                    className="hover:bg-muted/40 transition-colors cursor-pointer select-none"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-foreground">
                      #{item.id}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(item.fechaIncidente).toLocaleDateString("es-MX")}
                    </td>
                    <td className="px-4 py-3 text-foreground font-medium">
                      {item.nombreDenunciado || "Anónimo"}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                      {item.descripcion}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${BADGE_STYLES[item.estado]}`}>
                        {es.buzon.statusLabels[item.estado]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className="rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted/80 transition-colors"
                      >
                        Ver Detalle / Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TablePagination Component */}
        <TablePagination
          component="div"
          count={data?.totalElements ?? 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </div>

      <DetalleDenunciaModal
        denunciaId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
