import { Search } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { field } from "@/shared/components/ui/styles";

import { useListaEmpleados } from "../hooks/useAlertas";
import type { EmpleadoExterno } from "../types/alertas";

function sinAcentos(texto: string | undefined) {
  return (texto ?? "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

/**
 * Igual que `BuscadorSocios`, pero sobre los empleados del core: al abrirlo lista
 * todos y se filtra escribiendo (nombre, clave o RFC). Se usa en alertas
 * "Interna preocupante", que se levantan sobre empleados.
 */
export function BuscadorEmpleados({
  id,
  valor,
  onSeleccionar,
}: {
  id?: string;
  valor: string;
  onSeleccionar: (empleado: EmpleadoExterno) => void;
}) {
  const idLista = useId();
  const [abierto, setAbierto] = useState(false);
  const [filtro, setFiltro] = useState("");
  const contenedor = useRef<HTMLDivElement>(null);
  const { data: empleados, isFetching, isError } = useListaEmpleados(abierto);

  useEffect(() => {
    if (!abierto) return;
    function alHacerClicFuera(evento: MouseEvent) {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false);
    }
    document.addEventListener("mousedown", alHacerClicFuera);
    return () => document.removeEventListener("mousedown", alHacerClicFuera);
  }, [abierto]);

  const coincidencias = useMemo(() => {
    const buscado = sinAcentos(filtro.trim());
    if (!buscado) return empleados ?? [];
    return (empleados ?? []).filter((e) =>
      sinAcentos(`${e.nombre} ${e.id} ${e.rfc ?? ""}`).includes(buscado),
    );
  }, [empleados, filtro]);

  return (
    <div ref={contenedor} className="relative">
      <div className="relative">
        <input
          id={id}
          value={abierto ? filtro : valor}
          placeholder="Clave o nombre del empleado"
          onFocus={() => setAbierto(true)}
          onChange={(e) => {
            setFiltro(e.target.value);
            setAbierto(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setAbierto(false);
          }}
          role="combobox"
          aria-expanded={abierto}
          aria-controls={idLista}
          autoComplete="off"
          className={`${field} w-full pr-10`}
        />
        <Search
          className="text-muted-foreground pointer-events-none absolute inset-y-0 right-3 my-auto size-4"
          aria-hidden
        />
      </div>

      {abierto && (
        <div
          id={idLista}
          role="listbox"
          aria-label="Empleados"
          className="border-border bg-popover absolute top-full right-0 left-0 z-40 mt-1 max-h-72 overflow-y-auto rounded-lg border shadow-lg"
        >
          <p className="border-border bg-popover text-muted-foreground sticky top-0 border-b px-3 py-2 text-[11px] font-semibold tracking-wide uppercase">
            {isFetching ? "Cargando empleados…" : `${coincidencias.length} empleados`}
          </p>
          {isError && (
            <p className="text-destructive px-3 py-3 text-sm">
              No se pudo cargar la lista de empleados.
            </p>
          )}
          {!isFetching && !isError && coincidencias.length === 0 && (
            <p className="text-muted-foreground px-3 py-3 text-sm">Sin resultados.</p>
          )}
          {coincidencias.map((empleado) => (
            <button
              key={empleado.id}
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => {
                onSeleccionar(empleado);
                setAbierto(false);
                setFiltro("");
              }}
              className="hover:bg-muted flex w-full flex-col items-start px-3 py-2 text-left text-sm"
            >
              <span className="text-foreground font-medium">{empleado.nombre}</span>
              <span className="text-muted-foreground text-xs">
                {empleado.id}
                {empleado.area ? ` · ${empleado.area}` : ""}
                {empleado.sucursal ? ` · ${empleado.sucursal}` : ""}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
