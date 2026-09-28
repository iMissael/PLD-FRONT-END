import { useState } from "react";

import { card, field, label } from "@/shared/components/ui/styles";

export type FiltroPaises = "PAIS" | "ZONA";

interface BusquedaPaisesFormProps {
  onBuscar: (busqueda: string, filtrarPor: FiltroPaises) => void;
}

/**
 * Barra de búsqueda de la pantalla de Países, con el mismo "Filtrar por"
 * (País / Zona Geográfica) de la pantalla legacy de escritorio. El filtrado
 * es en vivo: cada letra escrita dispara `onBuscar` de inmediato (el
 * catálogo completo ya está en memoria en la página, así que no hace falta
 * esperar a un clic en "Buscar" ni ir al backend en cada tecla).
 */
export function BusquedaPaisesForm({ onBuscar }: BusquedaPaisesFormProps) {
  const [valor, setValor] = useState("");
  const [filtro, setFiltro] = useState<FiltroPaises>("PAIS");

  const cambiarValor = (nuevoValor: string) => {
    setValor(nuevoValor);
    onBuscar(nuevoValor.trim(), filtro);
  };

  const cambiarFiltro = (nuevoFiltro: FiltroPaises) => {
    setFiltro(nuevoFiltro);
    onBuscar(valor.trim(), nuevoFiltro);
  };

  return (
    <div className={`flex flex-wrap items-center gap-4 p-3 ${card}`}>
      <input
        type="text"
        placeholder={
          filtro === "PAIS"
            ? "Buscar por nombre o código ISO..."
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
            name="filtrarPor"
            checked={filtro === "PAIS"}
            onChange={() => cambiarFiltro("PAIS")}
            className="accent-accent"
          />
          País
        </label>
        <label className="flex items-center gap-1.5 text-sm text-foreground">
          <input
            type="radio"
            name="filtrarPor"
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
