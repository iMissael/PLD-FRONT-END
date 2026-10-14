import { useState, useMemo } from "react";
import { Calendar, Eye, Filter, X } from "lucide-react";
import { ShieldSearchIcon } from "@/shared/components/icons";
import { es } from "@/shared/i18n/es";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import { useAlertaDetalle, useListarAlertas } from "../hooks/useAlertas";
import {
  ETIQUETA_ESTATUS,
  type Alerta,
  type EstatusAlerta,
} from "@/features/alertas/types/alertas";
import { formatearFecha } from "@/features/operacion/revision-alertas/utils/formato";

const ALERTA_BADGES: Record<EstatusAlerta, string> = {
  PENDIENTE: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  CONFIRMADA: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300",
  RECHAZADA: "bg-muted text-muted-foreground",
  REPORTADA: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
};

const ESTATUS: EstatusAlerta[] = ["PENDIENTE", "CONFIRMADA", "RECHAZADA", "REPORTADA"];

function razonDe(alerta: Alerta): string {
  if (!alerta.razonAlertaDescripcion) return "Sin razón";
  return alerta.razonAlertaNumero
    ? `${alerta.razonAlertaNumero} - ${alerta.razonAlertaDescripcion}`
    : alerta.razonAlertaDescripcion;
}

export function GestionAlertasPage() {
  const [estatusFilter, setEstatusFilter] = useState<EstatusAlerta | undefined>();
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedAlertaId, setSelectedAlertaId] = useState<number | null>(null);

  const { data, isLoading } = useListarAlertas({
    estatus: estatusFilter,
    fechaDesde: fechaDesde || undefined,
    fechaHasta: fechaHasta || undefined,
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

  const columns: ColumnDef<Alerta>[] = useMemo(
    () => [
      {
        header: "Folio",
        width: "90px",
        className: "font-mono font-bold text-foreground",
        cell: (item) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedAlertaId(item.id);
            }}
            className="font-mono font-bold text-primary hover:underline cursor-pointer"
            title="Ver detalle"
          >
            #{item.folio}
          </button>
        ),
      },
      {
        header: "Denuncia",
        width: "100px",
        className: "font-mono text-muted-foreground",
        cell: (item) => (item.denunciaId ? `#${item.denunciaId}` : "—"),
      },
      {
        header: "Reportado",
        className: "max-w-[14rem] font-medium text-foreground",
        cell: (item) => (
          <span
            title={item.reportado?.nombre ?? undefined}
            className="block max-w-[14rem] truncate"
          >
            {item.reportado?.nombre || "Sin reportado"}
          </span>
        ),
      },
      {
        header: "Tipo / Razón",
        className: "max-w-xs text-foreground",
        cell: (item) => (
          <div className="max-w-xs">
            <span className="block truncate font-medium">{item.tipoAlertaDescripcion}</span>
            <span title={razonDe(item)} className="block truncate text-[11px] text-muted-foreground">
              {razonDe(item)}
            </span>
          </div>
        ),
      },
      {
        header: "Estatus",
        width: "120px",
        cell: (item) => (
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${ALERTA_BADGES[item.estatus]}`}
          >
            {ETIQUETA_ESTATUS[item.estatus]}
          </span>
        ),
      },
      {
        header: "Fecha alerta",
        width: "120px",
        className: "text-muted-foreground",
        cell: (item) => formatearFecha(item.fechaAlerta),
      },
      {
        header: "Acciones",
        headerClassName: "text-right",
        align: "right",
        width: "110px",
        cell: (item) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedAlertaId(item.id);
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
            title="Ver detalle de la alerta"
          >
            <Eye className="size-3.5" />
            Ver
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
          {ESTATUS.map((estatus) => (
            <option key={estatus} value={estatus}>
              {ETIQUETA_ESTATUS[estatus]}
            </option>
          ))}
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
                  Alerta PLD #{alertaDetalle.folio}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-semibold text-muted-foreground">Estatus:</span>
                  <p>
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${ALERTA_BADGES[alertaDetalle.estatus]}`}
                    >
                      {ETIQUETA_ESTATUS[alertaDetalle.estatus]}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Denuncia:</span>
                  <p className="font-mono text-foreground">
                    {alertaDetalle.denunciaId ? `#${alertaDetalle.denunciaId}` : "—"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-semibold text-muted-foreground">Tipo de alerta:</span>
                  <p className="text-foreground">{alertaDetalle.tipoAlertaDescripcion}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Razón:</span>
                  <p className="text-foreground">{razonDe(alertaDetalle)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-semibold text-muted-foreground">Fecha de incidencia:</span>
                  <p className="text-foreground">{formatearFecha(alertaDetalle.fechaIncidencia)}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Fecha de alerta:</span>
                  <p className="text-foreground">{formatearFecha(alertaDetalle.fechaAlerta)}</p>
                </div>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Reportado:</span>
                {alertaDetalle.reportado ? (
                  <p className="text-foreground">
                    {alertaDetalle.reportado.nombre}
                    {alertaDetalle.reportado.referencia && (
                      <span className="ml-1 font-mono text-muted-foreground">
                        ({alertaDetalle.reportado.referencia})
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-muted-foreground">Sin reportado (denuncia anónima)</p>
                )}
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Descripción:</span>
                <p className="mt-1 whitespace-pre-line text-foreground font-medium">
                  {alertaDetalle.descripcion || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
