import { useMemo, useState } from "react";

import { Badge } from "@/shared/components/ui/CatalogoBadge";
import { card, emptyState, field, table } from "@/shared/components/ui/styles";
import { cn } from "@/shared/utils/cn";

import { useListaEmpleados } from "../hooks/useAlertas";
import type { EmpleadoExterno } from "../types/alertas";

type Criterio = "id" | "nombre";

const CRITERIOS: { valor: Criterio; etiqueta: string; placeholder: string }[] = [
  { valor: "id", etiqueta: "Clave Empleado", placeholder: "Buscar por clave" },
  { valor: "nombre", etiqueta: "Empleado", placeholder: "Buscar por nombre" },
];

function normalizar(texto: string | undefined) {
  return (texto ?? "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

function esInactivo(status: string | undefined) {
  const valor = (status ?? "").trim().toUpperCase();
  return valor === "I" || valor === "INACTIVO" || valor === "B" || valor === "BAJA";
}

const encabezado = `${table.headCell} sticky top-0 z-10 bg-muted py-2`;
const celda = "px-4 py-2";

interface TablaEmpleadosProps {
  seleccionadoId: string | null;
  onSeleccionar: (empleado: EmpleadoExterno) => void;
}

export function TablaEmpleados({ seleccionadoId, onSeleccionar }: TablaEmpleadosProps) {
  const [criterio, setCriterio] = useState<Criterio>("nombre");
  const [filtro, setFiltro] = useState("");
  const { data: empleados, isLoading, isError } = useListaEmpleados(true);

  const filtrados = useMemo(() => {
    const buscado = normalizar(filtro);
    if (!buscado) return empleados ?? [];
    return (empleados ?? []).filter((e) => normalizar(e[criterio]).includes(buscado));
  }, [empleados, filtro, criterio]);

  const placeholder = CRITERIOS.find((c) => c.valor === criterio)?.placeholder;

  return (
    <div className="flex flex-col gap-2">
      <input
        aria-label="Filtrar empleados"
        placeholder={placeholder}
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className={field}
      />
      <div className={cn(card, "max-h-72 overflow-auto")}>
        <table className={table.root}>
          <thead className={table.head}>
            <tr>
              {CRITERIOS.map((c) => (
                <th key={c.valor} className={encabezado}>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="criterioEmpleado"
                      checked={criterio === c.valor}
                      onChange={() => setCriterio(c.valor)}
                      className="accent-primary"
                    />
                    {c.etiqueta}
                  </label>
                </th>
              ))}
              <th className={encabezado}>Puesto</th>
              <th className={`${encabezado} w-28`}>Estatus</th>
            </tr>
          </thead>
          <tbody className={table.body}>
            {filtrados.map((empleado) => (
              <tr
                key={empleado.id}
                onClick={() => onSeleccionar(empleado)}
                className={table.row(empleado.id === seleccionadoId)}
              >
                <td className={`${celda} text-muted-foreground`}>{empleado.id}</td>
                <td className={`${celda} text-foreground font-medium`}>
                  {empleado.nombre}
                </td>
                <td className={`${celda} text-muted-foreground`}>
                  {empleado.area ?? "—"}
                </td>
                <td className={celda}>
                  <Badge tono={esInactivo(empleado.status) ? "inactivo" : "activo"}>
                    {esInactivo(empleado.status) ? "Inactivo" : "Activo"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading ? (
          <p className="text-muted-foreground p-4 text-center text-sm">
            Cargando empleados…
          </p>
        ) : isError ? (
          <p className="text-destructive p-4 text-center text-sm">
            No se pudo cargar la lista de empleados.
          </p>
        ) : filtrados.length === 0 ? (
          <p className={cn(emptyState, "rounded-none border-0 shadow-none")}>
            Sin empleados con este filtro.
          </p>
        ) : null}
      </div>
    </div>
  );
}
