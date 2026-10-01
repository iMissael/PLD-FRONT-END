import { useMemo, useState } from "react";

import { useListaSocios } from "@/features/socios/hooks/useSocios";
import type { SocioExterno } from "@/features/socios/types/socios";
import { Badge } from "@/shared/components/ui/CatalogoBadge";
import { card, emptyState, field, table } from "@/shared/components/ui/styles";
import { cn } from "@/shared/utils/cn";

type Criterio = "id" | "nombre" | "rfc";

const CRITERIOS: { valor: Criterio; etiqueta: string; placeholder: string }[] = [
  { valor: "id", etiqueta: "Referencia Cliente", placeholder: "Buscar por referencia" },
  { valor: "nombre", etiqueta: "Cliente", placeholder: "Buscar por nombre" },
  { valor: "rfc", etiqueta: "RFC", placeholder: "Buscar por RFC" },
];

function normalizar(texto: string | undefined) {
  return (texto ?? "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

const encabezado = `${table.headCell} sticky top-0 z-10 bg-muted py-2`;
const celda = "px-4 py-2";

interface TablaClientesProps {
  seleccionadoId: string | null;
  onSeleccionar: (socio: SocioExterno) => void;
}

export function TablaClientes({ seleccionadoId, onSeleccionar }: TablaClientesProps) {
  const [criterio, setCriterio] = useState<Criterio>("nombre");
  const [filtro, setFiltro] = useState("");
  const { data: socios, isLoading, isError } = useListaSocios(true);

  const clientes = useMemo(() => {
    const buscado = normalizar(filtro);
    if (!buscado) return socios ?? [];
    return (socios ?? []).filter((s) => normalizar(s[criterio]).includes(buscado));
  }, [socios, filtro, criterio]);

  const placeholder = CRITERIOS.find((c) => c.valor === criterio)?.placeholder;

  return (
    <div className="flex flex-col gap-2">
      <input
        aria-label="Filtrar clientes"
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
                      name="criterioCliente"
                      checked={criterio === c.valor}
                      onChange={() => setCriterio(c.valor)}
                      className="accent-primary"
                    />
                    {c.etiqueta}
                  </label>
                </th>
              ))}
              <th className={`${encabezado} w-28`}>Estatus</th>
            </tr>
          </thead>
          <tbody className={table.body}>
            {clientes.map((socio) => (
              <tr
                key={socio.id}
                onClick={() => onSeleccionar(socio)}
                className={table.row(socio.id === seleccionadoId)}
              >
                <td className={`${celda} text-muted-foreground`}>{socio.id}</td>
                <td className={`${celda} text-foreground font-medium`}>{socio.nombre}</td>
                <td className={`${celda} text-muted-foreground`}>{socio.rfc ?? "—"}</td>
                <td className={celda}>
                  <Badge tono={socio.status === "I" ? "inactivo" : "activo"}>
                    {socio.status === "I" ? "Inactivo" : "Activo"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading ? (
          <p className="text-muted-foreground p-4 text-center text-sm">
            Cargando clientes…
          </p>
        ) : isError ? (
          <p className="text-destructive p-4 text-center text-sm">
            No se pudo cargar la lista de clientes.
          </p>
        ) : clientes.length === 0 ? (
          <p className={cn(emptyState, "rounded-none border-0 shadow-none")}>
            Sin clientes con este filtro.
          </p>
        ) : null}
      </div>
    </div>
  );
}
