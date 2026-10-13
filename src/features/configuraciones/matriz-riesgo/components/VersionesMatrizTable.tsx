import { useMemo } from "react";
import { DataTable, type ColumnDef } from "@/shared/components/organisms/DataTable";
import { StatusBadge } from "@/shared/components/atoms/StatusBadge";
import { Button } from "@/shared/components/atoms/Button";
import { useVersionesMatriz } from "@/features/configuraciones/matriz-riesgo/hooks/useMatrizRiesgo";
import type { ConfiguracionMatrizRiesgo } from "@/features/configuraciones/matriz-riesgo/types/matrizRiesgo";

function fechaDe(version: ConfiguracionMatrizRiesgo) {
  return version.factores?.[0]?.createdAt;
}

function formatearFecha(fechaStr?: string) {
  if (!fechaStr) return "—";
  const fecha = new Date(fechaStr);
  return isNaN(fecha.getTime()) ? "—" : fecha.toLocaleString();
}

interface VersionesMatrizTableProps {
  onVerDetalle: (id: number) => void;
  seleccionadaId?: number | null;
}

export function VersionesMatrizTable({
  onVerDetalle,
  seleccionadaId,
}: VersionesMatrizTableProps) {
  const { data: versiones, isLoading, isError } = useVersionesMatriz();

  const listaOrdenada = useMemo(() => {
    if (!versiones) return [];
    return [...versiones].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
  }, [versiones]);

  const columns: ColumnDef<ConfiguracionMatrizRiesgo>[] = useMemo(
    () => [
      {
        header: "Versión",
        width: "110px",
        cell: (item) => (
          <span className="font-semibold text-foreground">
            v{item.version ?? item.id}
          </span>
        ),
      },
      {
        header: "Estado",
        width: "130px",
        cell: (item) => (
          <StatusBadge tono={item.activa ? "activo" : "inactivo"}>
            {item.activa ? "Activa" : "Histórica"}
          </StatusBadge>
        ),
      },
      {
        header: "Creado por",
        accessorKey: "creadoPor",
        cell: (item) => item.creadoPor ?? "—",
      },
      {
        header: "Fecha",
        cell: (item) => formatearFecha(fechaDe(item)),
      },
      {
        header: "Acciones",
        align: "right",
        width: "130px",
        cell: (item) => (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (item.id !== undefined) {
                onVerDetalle(item.id);
              }
            }}
          >
            Ver detalle
          </Button>
        ),
      },
    ],
    [onVerDetalle],
  );

  if (isError) {
    return (
      <p className="text-destructive text-sm">
        No se pudo cargar el historial de versiones.
      </p>
    );
  }

  return (
    <DataTable
      data={listaOrdenada}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Cargando historial de versiones..."
      emptyMessage="Aún no hay versiones registradas."
      seleccionadoId={seleccionadaId ?? null}
      onRowClick={(item) => {
        if (item.id !== undefined) {
          onVerDetalle(item.id);
        }
      }}
      pagination={{
        mode: "client",
        defaultRowsPerPage: 5,
        rowsPerPageOptions: [5, 10, 20],
      }}
    />
  );
}
