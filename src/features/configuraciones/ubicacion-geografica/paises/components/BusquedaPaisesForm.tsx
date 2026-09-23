import { useState } from "react";

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
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-white p-3">
      <input
        type="text"
        placeholder={
          filtro === "PAIS"
            ? "Buscar por nombre o código ISO..."
            : "Buscar por nombre de zona geográfica..."
        }
        value={valor}
        onChange={(event) => cambiarValor(event.target.value)}
        className="w-full max-w-sm flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-700">Filtrar por</span>
        <label className="flex items-center gap-1.5 text-sm text-slate-700">
          <input
            type="radio"
            name="filtrarPor"
            checked={filtro === "PAIS"}
            onChange={() => cambiarFiltro("PAIS")}
          />
          País
        </label>
        <label className="flex items-center gap-1.5 text-sm text-slate-700">
          <input
            type="radio"
            name="filtrarPor"
            checked={filtro === "ZONA"}
            onChange={() => cambiarFiltro("ZONA")}
          />
          Zona Geográfica
        </label>
      </div>
    </div>
  );
}
