import { useState } from "react";

import { useTiposAlerta } from "@/features/alertas/hooks/useAlertas";
import { Input } from "@/shared/components/atoms/Input";

import { ReglaForm } from "../components/ReglaForm";
import { ReglasTable } from "../components/ReglasTable";
import { useReglasAlerta } from "../hooks/useReglasAlerta";
import type { EstadoRegla, FiltroReglas, ReglaAlerta } from "../types/reglaAlerta";

export function ReglasAlertaPage() {
  const [filtro, setFiltroState] = useState<FiltroReglas>({});
  const [pagina, setPagina] = useState(0);
  const [tamanio, setTamanio] = useState(20);
  const { data, isLoading, isError, error, refetch } = useReglasAlerta(
    filtro,
    pagina,
    tamanio,
  );

  const setFiltro = (actualizar: (prev: FiltroReglas) => FiltroReglas) => {
    setFiltroState(actualizar);
    setPagina(0);
  };
  const { data: tipos } = useTiposAlerta();

  const [seleccionada, setSeleccionada] = useState<ReglaAlerta | null>(null);

  const selectStyle =
    "border-border bg-card text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:opacity-50 disabled:cursor-not-allowed";

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
        <Input
          aria-label="Buscar regla"
          placeholder="Buscar por descripción"
          value={filtro.busqueda ?? ""}
          onChange={(e) =>
            setFiltro((prev) => ({ ...prev, busqueda: e.target.value || undefined }))
          }
          className="min-w-64 flex-1"
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
          className={selectStyle}
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
          className={selectStyle}
        >
          <option value="">Activas e inactivas</option>
          <option value="ACTIVO">Activas</option>
          <option value="INACTIVO">Inactivas</option>
        </select>
      </div>

      <ReglasTable
        reglas={data?.contenido}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onReintentar={() => void refetch()}
        seleccionadaId={seleccionada?.idConfiguracionAlerta ?? null}
        onSeleccionar={setSeleccionada}
        pagina={pagina}
        tamanio={tamanio}
        totalElementos={data?.totalElementos ?? 0}
        onCambiarPagina={setPagina}
        onCambiarTamanio={(nuevo) => {
          setTamanio(nuevo);
          setPagina(0);
        }}
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
