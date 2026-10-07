import { useMemo } from "react";

import { Badge } from "@/shared/components/ui/CatalogoBadge";
import { DataTable, type ColumnDef } from "@/shared/components/ui/DataTable";
import { table } from "@/shared/components/ui/styles";

import type { SistemaIntegracionResponse } from "../types/integraciones";
import { fechaHora } from "./formato";

interface SistemasTableProps {
  sistemas: SistemaIntegracionResponse[] | undefined;
  isLoading: boolean;
  seleccionadoId: number | null;
  onSeleccionar: (sistema: SistemaIntegracionResponse) => void;
}

export function SistemasTable({ sistemas, isLoading, seleccionadoId, onSeleccionar }: SistemasTableProps) {
  const columns = useMemo<ColumnDef<SistemaIntegracionResponse>[]>(
    () => [
      { header: "client_id", cell: (s) => <code className="text-xs whitespace-nowrap">{s.clientId}</code>, className: table.cellStrong },
      { header: "Nombre", accessorKey: "nombre" },
      {
        header: "Scopes",
        cell: (s) => (
          <div className="flex flex-wrap gap-1">
            {s.scopes.map((scope) => (
              <Badge key={scope} tono="neutro">
                {scope}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        header: "Credenciales vigentes",
        cell: (s) => s.credenciales.filter((c) => c.vigente).length,
      },
      {
        header: "Estatus",
        cell: (s) => (
          <Badge tono={s.estatus === "A" ? "activo" : "inactivo"} className="whitespace-nowrap">{s.estatus === "A" ? "Activo" : "De baja"}</Badge>
        ),
      },
      { header: "Alta", cell: (s) => fechaHora(s.creadoEn), className: table.cellMuted },
    ],
    [],
  );

  return (
    <DataTable<SistemaIntegracionResponse>
      data={sistemas ?? []}
      columns={columns}
      isLoading={isLoading}
      getRowId={(s) => String(s.id)}
      selectedRowId={seleccionadoId != null ? String(seleccionadoId) : null}
      onRowClick={onSeleccionar}
      emptyMessage="No hay sistemas registrados."
      search={{
        placeholder: "Buscar por client_id, nombre o scope...",
        filterFn: (s, term) =>
          s.clientId.includes(term) ||
          s.nombre.toLowerCase().includes(term) ||
          s.scopes.some((scope) => scope.includes(term)),
      }}
      pagination={{ mode: "client", defaultRowsPerPage: 10, rowsPerPageOptions: [5, 10, 25] }}
    />
  );
}
