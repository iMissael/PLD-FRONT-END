import { useState } from "react";

import { useTiposAlerta } from "@/features/alertas/hooks/useAlertas";
import { field } from "@/shared/components/ui/styles";

import { ReglaForm } from "../components/ReglaForm";
import { ReglasTable } from "../components/ReglasTable";
import { useReglasAlerta } from "../hooks/useReglasAlerta";
import type { EstadoRegla, FiltroReglas, ReglaAlerta } from "../types/reglaAlerta";

/**
 * "Configuración de alertas › Configuración de alertas" (manual Sicanet 4.2.1): las
 * reglas con las que se generan las alertas. Las automáticas de una sola operación
 * son las que evalúa cada movimiento de cajas.
 *
 * Por ahora es solo consulta, igual que en Sicanet: las reglas vienen establecidas y
 * no se crean, editan ni eliminan desde aquí. El API y los hooks de escritura
 * (`useCrearRegla`, `useActualizarRegla`, ...) siguen disponibles para cuando se habilite.
 */
export function ReglasAlertaPage() {
  const [filtro, setFiltro] = useState<FiltroReglas>({});
  const { data: reglas, isLoading } = useReglasAlerta(filtro);
  const { data: tipos } = useTiposAlerta();

  const [seleccionada, setSeleccionada] = useState<ReglaAlerta | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold">
          Configuración de alertas
        </h2>
        <p className="text-muted-foreground text-sm">
          Reglas establecidas que generan alertas PLD. Seleccione una para ver su
          configuración.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          aria-label="Buscar regla"
          placeholder="Buscar por descripción"
          value={filtro.busqueda ?? ""}
          onChange={(e) =>
            setFiltro((prev) => ({ ...prev, busqueda: e.target.value || undefined }))
          }
          className={`${field} min-w-64 flex-1`}
        />
        <select
          aria-label="Tipo de alerta"
          value={filtro.alertaAcronimo ?? ""}
          onChange={(e) =>
            setFiltro((prev) => ({
              ...prev,
              alertaAcronimo: e.target.value || undefined,
            }))
          }
          className={field}
        >
          <option value="">Todos los tipos</option>
          {(tipos ?? []).map((t) => (
            <option key={t.alertaAcronimo} value={t.alertaAcronimo}>
              {t.descripcion}
            </option>
          ))}
        </select>
        <select
          aria-label="Estatus"
          value={filtro.estado ?? ""}
          onChange={(e) =>
            setFiltro((prev) => ({
              ...prev,
              estado: (e.target.value || undefined) as EstadoRegla | undefined,
            }))
          }
          className={field}
        >
          <option value="">Activas e inactivas</option>
          <option value="ACTIVO">Activas</option>
          <option value="INACTIVO">Inactivas</option>
        </select>
      </div>

      <ReglasTable
        reglas={reglas}
        isLoading={isLoading}
        seleccionadaId={seleccionada?.idConfiguracionAlerta ?? null}
        onSeleccionar={setSeleccionada}
      />

      {seleccionada ? (
        <ReglaForm
          regla={seleccionada}
          soloLectura
          onCancelar={() => setSeleccionada(null)}
        />
      ) : null}
    </div>
  );
}
