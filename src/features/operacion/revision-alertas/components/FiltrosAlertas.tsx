import { useState } from "react";

import { useTiposAlerta } from "@/features/alertas/hooks/useAlertas";
import {
  ETIQUETA_ESTATUS,
  type EstatusAlerta,
  type FiltroAlertas,
  type OrigenAlerta,
} from "@/features/alertas/types/alertas";
import { Button } from "@/shared/components/atoms/Button";
import { Input } from "@/shared/components/atoms/Input";
import { Card } from "@/shared/components/molecules";
import { label } from "@/shared/styles/tokens";

const selectStyle =
  "border-border bg-card text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:opacity-50 disabled:cursor-not-allowed";

interface FiltrosAlertasProps {
  inicial: FiltroAlertas;
  onAplicar: (filtro: FiltroAlertas) => void;
}

/** Filtros de "Revisión de alertas": se aplican al presionar el botón, no al teclear. */
export function FiltrosAlertas({ inicial, onAplicar }: FiltrosAlertasProps) {
  const { data: tipos } = useTiposAlerta();
  const [filtro, setFiltro] = useState<FiltroAlertas>(inicial);

  const cambiar = <K extends keyof FiltroAlertas>(
    clave: K,
    valor: FiltroAlertas[K] | "",
  ) => setFiltro((prev) => ({ ...prev, [clave]: valor === "" ? undefined : valor }));

  return (
    <Card className="p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onAplicar(filtro);
        }}
        className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-6"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="desde" className={label}>
            Desde
          </label>
          <Input
            id="desde"
            type="date"
            value={filtro.desde ?? ""}
            onChange={(e) => cambiar("desde", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="hasta" className={label}>
            Hasta
          </label>
          <Input
            id="hasta"
            type="date"
            min={filtro.desde}
            value={filtro.hasta ?? ""}
            onChange={(e) => cambiar("hasta", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="tipo" className={label}>
            Tipo
          </label>
          <select
            id="tipo"
            value={filtro.alertaAcronimo ?? ""}
            onChange={(e) => cambiar("alertaAcronimo", e.target.value)}
            className={selectStyle}
          >
            <option value="">Todos</option>
            {(tipos ?? [])
              .filter((t) => t.alertaAcronimo !== "A")
              .map((t) => (
                <option key={t.alertaAcronimo} value={t.alertaAcronimo}>
                  {t.descripcion}
                </option>
              ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="estatus" className={label}>
            Estatus
          </label>
          <select
            id="estatus"
            value={filtro.estatus ?? ""}
            onChange={(e) => cambiar("estatus", e.target.value as EstatusAlerta | "")}
            className={selectStyle}
          >
            <option value="">Todos</option>
            {(Object.keys(ETIQUETA_ESTATUS) as EstatusAlerta[]).map((estatus) => (
              <option key={estatus} value={estatus}>
                {ETIQUETA_ESTATUS[estatus]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="origen" className={label}>
            Origen
          </label>
          <select
            id="origen"
            value={filtro.origen ?? ""}
            onChange={(e) => cambiar("origen", e.target.value as OrigenAlerta | "")}
            className={selectStyle}
          >
            <option value="">Todos</option>
            <option value="AUTOMATICA">Automática (cajas)</option>
            <option value="MANUAL">Manual</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="persona" className={label}>
            Persona
          </label>
          <Input
            id="persona"
            value={filtro.persona ?? ""}
            placeholder="Nombre"
            onChange={(e) => cambiar("persona", e.target.value.toLocaleUpperCase("es-MX"))}
          />
        </div>
        <div className="flex justify-end gap-2 sm:col-span-3 lg:col-span-6">
          <Button type="submit">Aplicar filtros</Button>
        </div>
      </form>
    </Card>
  );
}
