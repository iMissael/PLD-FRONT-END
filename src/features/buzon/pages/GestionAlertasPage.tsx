import { useState } from "react";
import { FilterIcon, ShieldSearchIcon, XIcon } from "@/shared/components/icons";
import { es } from "@/shared/i18n/es";
import { useAlertaDetalle, useListarAlertas } from "../hooks/useAlertas";
import type { EstatusAlerta } from "../types/buzon";

const ALERTA_BADGES: Record<EstatusAlerta, string> = {
  A: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300",
  B: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  S: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
  E: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
};

export function GestionAlertasPage() {
  const [estatusFilter, setEstatusFilter] = useState<EstatusAlerta | undefined>();
  const [page, setPage] = useState(0);
  const [selectedAlertaId, setSelectedAlertaId] = useState<number | null>(null);

  const { data, isLoading } = useListarAlertas({
    estatus: estatusFilter,
    page,
    size: 10,
  });

  const { data: alertaDetalle } = useAlertaDetalle(selectedAlertaId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {es.buzon.alertsTitle}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {es.buzon.alertsSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <FilterIcon className="h-4 w-4 text-slate-400" />
          <select
            value={estatusFilter ?? ""}
            onChange={(e) => {
              const val = e.target.value as EstatusAlerta | "";
              setEstatusFilter(val ? val : undefined);
              setPage(0);
            }}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="">Todos los estatus</option>
            <option value="A">Activas (A)</option>
            <option value="B">Bloqueadas (B)</option>
            <option value="S">Suspendidas (S)</option>
            <option value="E">Evaluadas (E)</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3].map((n) => (
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
                  <th className="px-4 py-3 font-semibold">Descripción</th>
                  <th className="px-4 py-3 font-semibold">Importe</th>
                  <th className="px-4 py-3 font-semibold">Estatus</th>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.content.map((alerta) => (
                  <tr key={alerta.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                      #{alerta.id}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-slate-800 dark:text-slate-200 font-medium">
                      {alerta.descripcion}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">
                      ${alerta.importe?.toLocaleString("es-MX") ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${ALERTA_BADGES[alerta.estatus]}`}>
                        {es.buzon.alertStatusLabels[alerta.estatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(alerta.createdAt).toLocaleDateString("es-MX")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedAlertaId(alerta.id)}
                        className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        Ver Alerta
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Alerta Detail Modal */}
      {selectedAlertaId && alertaDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldSearchIcon className="h-5 w-5 text-amber-500" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Alerta PLD #{alertaDetalle.id}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAlertaId(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-500">Descripción:</span>
                <p className="mt-1 text-slate-800 dark:text-slate-200 font-medium">{alertaDetalle.descripcion}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-semibold text-slate-500">Importe:</span>
                  <p className="font-mono text-slate-800 dark:text-slate-200">${alertaDetalle.importe?.toLocaleString("es-MX")}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Moneda:</span>
                  <p className="text-slate-800 dark:text-slate-200">{alertaDetalle.importeMonedaAcronimo || "MXN"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-semibold text-slate-500">Forma de Pago:</span>
                  <p className="text-slate-800 dark:text-slate-200">{alertaDetalle.formaPago || "N/A"}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Estatus:</span>
                  <p className="font-bold text-emerald-600">{es.buzon.alertStatusLabels[alertaDetalle.estatus]}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
