import { useState } from "react";
import { FilterIcon } from "@/shared/components/icons";
import { es } from "@/shared/i18n/es";
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
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data, isLoading } = useListarDenuncias({
    estado: estadoFilter,
    page,
    size: 10,
  });

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

        {/* Filter Toolbar */}
        <div className="flex items-center gap-2">
          <FilterIcon className="h-4 w-4 text-muted-foreground" />
          <select
            value={estadoFilter ?? ""}
            onChange={(e) => {
              const val = e.target.value as EstadoDenuncia | "";
              setEstadoFilter(val ? val : undefined);
              setPage(0);
            }}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Todos los estatus</option>
            <option value="R">Recepción (R)</option>
            <option value="V">Verificación (V)</option>
            <option value="A">Atendida (A)</option>
            <option value="D">Desechada (D)</option>
          </select>
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
                  <th className="px-4 py-3 font-semibold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.content.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/40 transition-colors">
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
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-xs text-muted-foreground">
              Página {data.number + 1} de {data.totalPages} ({data.totalElements} registros)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={data.first}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="rounded-md border border-border bg-card px-3 py-1 text-xs text-foreground disabled:opacity-40 hover:bg-muted"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={data.last}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-border bg-card px-3 py-1 text-xs text-foreground disabled:opacity-40 hover:bg-muted"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      <DetalleDenunciaModal
        denunciaId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
