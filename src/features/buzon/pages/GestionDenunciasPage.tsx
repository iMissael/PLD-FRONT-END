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
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {es.buzon.adminTitle}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {es.buzon.adminSubtitle}
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center gap-2">
          <FilterIcon className="h-4 w-4 text-slate-400" />
          <select
            value={estadoFilter ?? ""}
            onChange={(e) => {
              const val = e.target.value as EstadoDenuncia | "";
              setEstadoFilter(val ? val : undefined);
              setPage(0);
            }}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-10 w-full animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : !data || data.content.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
            {es.common.empty}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Fecha Incidente</th>
                  <th className="px-4 py-3 font-semibold">Denunciado</th>
                  <th className="px-4 py-3 font-semibold">Descripción</th>
                  <th className="px-4 py-3 font-semibold">Estatus</th>
                  <th className="px-4 py-3 font-semibold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.content.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                      #{item.id}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {new Date(item.fechaIncidente).toLocaleDateString("es-MX")}
                    </td>
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-200 font-medium">
                      {item.nombreDenunciado || "Anónimo"}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-slate-600 dark:text-slate-400">
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
                        className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
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
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-800">
            <span className="text-xs text-slate-500">
              Página {data.number + 1} de {data.totalPages} ({data.totalElements} registros)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={data.first}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="rounded-md border border-slate-300 px-3 py-1 text-xs disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={data.last}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-slate-300 px-3 py-1 text-xs disabled:opacity-40"
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
