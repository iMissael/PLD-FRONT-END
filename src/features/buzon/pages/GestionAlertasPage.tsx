import { useState, useMemo } from "react";
import { Calendar, Filter, X } from "lucide-react";
import { ShieldSearchIcon } from "@/shared/components/icons";
import { es } from "@/shared/i18n/es";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import { useAlertaDetalle, useListarAlertas } from "../hooks/useAlertas";
import type { AlertaPLD, EstatusAlerta } from "../types/buzon";

const ALERTA_BADGES: Record<EstatusAlerta, string> = {
  A: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300",
  B: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  S: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
  E: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
};

export function GestionAlertasPage() {
  const [estatusFilter, setEstatusFilter] = useState<EstatusAlerta | undefined>();
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedAlertaId, setSelectedAlertaId] = useState<number | null>(null);

  const { data, isLoading } = useListarAlertas({
    estatus: estatusFilter,
    fechaDesde: fechaDesde ? new Date(fechaDesde).toISOString() : undefined,
    fechaHasta: fechaHasta ? new Date(fechaHasta).toISOString() : undefined,
    page,
    size: rowsPerPage,
  });

  const { data: alertaDetalle } = useAlertaDetalle(selectedAlertaId);

  const hayFiltros = Boolean(estatusFilter || fechaDesde || fechaHasta);

  const limpiarFiltros = () => {
    setEstatusFilter(undefined);
    setFechaDesde("");
    setFechaHasta("");
    setPage(0);
  };

  const columns: ColumnDef<AlertaPLD>[] = useMemo(
    () => [
      {
        header: "ID",
        width: "80px",
        className: "font-mono font-bold text-foreground",
        cell: (item) => `#${item.id}`,
      },
      {
        header: "Descripción",
        className: "max-w-xs truncate font-medium text-foreground",
        accessorKey: "descripcion",
      },
      {
        header: "Importe",
        width: "130px",
        className: "font-mono text-foreground",
        cell: (item) => `$${item.importe?.toLocaleString("es-MX") ?? 0}`,
      },
      {
        header: "Estatus",
        width: "120px",
        cell: (item) => (
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${ALERTA_BADGES[item.estatus]}`}
          >
            {es.buzon.alertStatusLabels[item.estatus]}
          </span>
        ),
      },
      {
        header: "Fecha",
        width: "140px",
        className: "text-muted-foreground",
        cell: (item) => new Date(item.createdAt).toLocaleDateString("es-MX"),
      },
      {
        header: "Doble clic para ver",
        headerClassName: "text-right",
        align: "right",
        width: "140px",
        cell: (item) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedAlertaId(item.id);
            }}
            className="rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted/80 transition-colors"
          >
            Ver Alerta
          </button>
        ),
      },
    ],
    [],
  );

  const filterBar = (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5">
        <Filter className="size-3.5 text-muted-foreground" />
        <select
          value={estatusFilter ?? ""}
          onChange={(e) => {
            const val = e.target.value as EstatusAlerta | "";
            setEstatusFilter(val ? val : undefined);
            setPage(0);
          }}
          className="rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Todos los estatus</option>
          <option value="A">Activas (A)</option>
          <option value="B">Bloqueadas (B)</option>
          <option value="S">Suspendidas (S)</option>
          <option value="E">Evaluadas (E)</option>
        </select>
      </div>

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
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {es.buzon.alertsTitle}
        </h1>
        <p className="text-xs text-muted-foreground">{es.buzon.alertsSubtitle}</p>
      </div>

      <DataTable
        data={data?.content}
        columns={columns}
        isLoading={isLoading}
        emptyMessage={es.common.empty}
        pagination={{
          mode: "server",
          page,
          rowsPerPage,
          totalCount: data?.totalElements ?? 0,
          onPageChange: (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) =>
            setPage(newPage),
          onRowsPerPageChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          },
        }}
        onRowDoubleClick={(item) => setSelectedAlertaId(item.id)}
        doubleClickTitle="Doble clic para ver detalle de la alerta"
        filterBar={filterBar}
      />

      {/* Modal de Detalle de Alerta */}
      {selectedAlertaId && alertaDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl text-foreground">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldSearchIcon className="h-5 w-5 text-amber-500" />
                <h2 className="text-base font-bold text-foreground">
                  Alerta PLD #{alertaDetalle.id}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAlertaId(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="font-semibold text-muted-foreground">Descripción:</span>
                <p className="mt-1 text-foreground font-medium">{alertaDetalle.descripcion}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-semibold text-muted-foreground">Importe:</span>
                  <p className="font-mono text-foreground">${alertaDetalle.importe?.toLocaleString("es-MX")}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Moneda:</span>
                  <p className="text-foreground">{alertaDetalle.importeMonedaAcronimo || "MXN"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-semibold text-muted-foreground">Forma de Pago:</span>
                  <p className="text-foreground">{alertaDetalle.formaPago || "N/A"}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Estatus:</span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">{es.buzon.alertStatusLabels[alertaDetalle.estatus]}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
