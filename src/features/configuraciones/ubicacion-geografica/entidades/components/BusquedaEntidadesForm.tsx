import { useState } from "react";

import { card, field, label } from "@/shared/components/ui/styles";

export type FiltroEntidades = "ENTIDAD" | "ZONA";

interface BusquedaEntidadesFormProps {
  onBuscar: (busqueda: string, filtrarPor: FiltroEntidades) => void;
}

export function BusquedaEntidadesForm({ onBuscar }: BusquedaEntidadesFormProps) {
  const [valor, setValor] = useState("");
  const [filtro, setFiltro] = useState<FiltroEntidades>("ENTIDAD");

  const cambiarValor = (nuevoValor: string) => {
    setValor(nuevoValor);
    onBuscar(nuevoValor.trim(), filtro);
  };

  const cambiarFiltro = (nuevoFiltro: FiltroEntidades) => {
    setFiltro(nuevoFiltro);
    onBuscar(valor.trim(), nuevoFiltro);
  };

  return (
    <div className={`flex flex-wrap items-center gap-4 p-3 ${card}`}>
      <input
        type="text"
        placeholder={
          filtro === "ENTIDAD"
            ? "Buscar por nombre o clave CURP..."
            : "Buscar por nombre de zona geográfica..."
        }
        value={valor}
        onChange={(event) => cambiarValor(event.target.value)}
        className={`w-full max-w-sm flex-1 ${field}`}
      />

      <div className="flex items-center gap-3">
        <span className={label}>Filtrar por</span>
        <label className="flex items-center gap-1.5 text-sm text-foreground">
          <input
            type="radio"
            name="filtrarPorEntidad"
            checked={filtro === "ENTIDAD"}
            onChange={() => cambiarFiltro("ENTIDAD")}
            className="accent-accent"
          />
          Entidad
        </label>
        <label className="flex items-center gap-1.5 text-sm text-foreground">
          <input
            type="radio"
            name="filtrarPorEntidad"
            checked={filtro === "ZONA"}
            onChange={() => cambiarFiltro("ZONA")}
            className="accent-accent"
          />
          Zona Geográfica
        </label>
      </div>
    </div>
  );
}
