import { useState } from "react";

import { useTiposAlerta } from "@/features/alertas/hooks/useAlertas";
import {
  ETIQUETA_ESTATUS,
  type EstatusAlerta,
  type FiltroAlertas,
  type OrigenAlerta,
} from "@/features/alertas/types/alertas";
import { Button } from "@/shared/components/ui/CatalogoButton";
import { card, field, label } from "@/shared/components/ui/styles";

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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onAplicar(filtro);
      }}
      className={`grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-6 ${card}`}
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="desde" className={label}>
          Desde
        </label>
        <input
          id="desde"
          type="date"
          value={filtro.desde ?? ""}
          onChange={(e) => cambiar("desde", e.target.value)}
          className={field}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="hasta" className={label}>
          Hasta
        </label>
        <input
          id="hasta"
          type="date"
          min={filtro.desde}
          value={filtro.hasta ?? ""}
          onChange={(e) => cambiar("hasta", e.target.value)}
          className={field}
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
          className={field}
        >
          <option value="">Todos</option>
          {(tipos ?? []).map((t) => (
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
          className={field}
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
          className={field}
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
        <input
          id="persona"
          value={filtro.persona ?? ""}
          placeholder="Nombre"
          onChange={(e) => cambiar("persona", e.target.value.toLocaleUpperCase("es-MX"))}
          className={field}
        />
      </div>
      <div className="flex justify-end gap-2 sm:col-span-3 lg:col-span-6">
        <Button type="submit">Aplicar filtros</Button>
      </div>
    </form>
  );
}
