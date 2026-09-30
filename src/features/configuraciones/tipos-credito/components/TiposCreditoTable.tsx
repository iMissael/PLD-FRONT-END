import { useMemo } from "react";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import { Badge } from "@/shared/components/ui/CatalogoBadge";
import { useTiposPrestamo } from "../../tipos-prestamo/hooks/useTiposPrestamo";
import { useNivelesRiesgo } from "../../ubicacion-geografica/niveles-riesgo/hooks/useNivelesRiesgo";
import type { TipoCreditoResponse } from "../types/tipoCredito";

interface TiposCreditoTableProps {
  tipos: TipoCreditoResponse[] | undefined;
  isLoading: boolean;
  seleccionadoId: string | null;
  onSeleccionar: (tipo: TipoCreditoResponse) => void;
  onDoubleClick?: (tipo: TipoCreditoResponse) => void;
}

export function TiposCreditoTable({
  tipos,
  isLoading,
  seleccionadoId,
  onSeleccionar,
  onDoubleClick,
}: TiposCreditoTableProps) {
  const { data: niveles } = useNivelesRiesgo();
  const { data: tiposPrestamo } = useTiposPrestamo();

  const listaNiveles = useMemo(() => {
    if (!niveles) return [];
    if (Array.isArray(niveles)) return niveles;
    if (Array.isArray((niveles as unknown as { contenido?: typeof niveles })?.contenido)) {
      return (niveles as unknown as { contenido: typeof niveles }).contenido ?? [];
    }
    return [];
  }, [niveles]);

  const listaTiposPrestamo = useMemo(() => {
    if (!tiposPrestamo) return [];
    if (Array.isArray(tiposPrestamo)) return tiposPrestamo;
    if (Array.isArray((tiposPrestamo as unknown as { contenido?: typeof tiposPrestamo })?.contenido)) {
      return (tiposPrestamo as unknown as { contenido: typeof tiposPrestamo }).contenido ?? [];
    }
    return [];
  }, [tiposPrestamo]);

  const mapaTiposPrestamo = useMemo(() => {
    const mapa = new Map<string, string>();
    listaTiposPrestamo.forEach((tp) => {
      mapa.set(tp.id, tp.nombre);
    });
    return mapa;
  }, [listaTiposPrestamo]);

  const columns: ColumnDef<TipoCreditoResponse>[] = useMemo(
    () => [
      {
        header: "#",
        width: "60px",
        className: "text-muted-foreground",
        cell: (_, __, globalIndex) => globalIndex + 1,
      },
      {
        header: "Nombre",
        accessorKey: "nombre",
        className: "font-semibold text-foreground",
      },
      {
        header: "Tipo de préstamo",
        cell: (item) => {
          if (!item.catTipoPrestamoId) return "— sin asignar —";
          return mapaTiposPrestamo.get(item.catTipoPrestamoId) ?? item.catTipoPrestamoId;
        },
      },
      {
        header: "Nivel de riesgo",
        cell: (item) => {
          const nivel = listaNiveles.find((n) => n.id === item.catNivelRiesgoId);
          if (!nivel) return String(item.catNivelRiesgoId);
          return `${nivel.nivelRiesgoDescripcion} (${nivel.nivelRiesgoValor})`;
        },
      },
      {
        header: "Estatus",
        width: "110px",
        cell: (item) => (
          <Badge tono={item.estatus === "A" ? "activo" : "inactivo"}>
            {item.estatus === "A" ? "Activo" : item.estatus === "B" ? "Baja" : "Inactivo"}
          </Badge>
        ),
      },
    ],
    [listaNiveles, mapaTiposPrestamo],
  );

  return (
    <DataTable
      data={tipos}
      columns={columns}
      isLoading={isLoading}
      loadingMessage="Cargando tipos de crédito..."
      emptyMessage="No hay tipos de crédito registrados."
      seleccionadoId={seleccionadoId}
      onRowClick={onSeleccionar}
      onRowDoubleClick={onDoubleClick}
      doubleClickTitle="Doble clic para modificar este registro"
      search={{
        placeholder: "Buscar tipo de crédito o tipo de préstamo...",
        filterFn: (item, term) => {
          const t = term.toLowerCase().trim();
          const nombrePrestamo = (mapaTiposPrestamo.get(item.catTipoPrestamoId) ?? "").toLowerCase();
          return item.nombre.toLowerCase().includes(t) || nombrePrestamo.includes(t);
        },
      }}
      pagination={{
        mode: "client",
        defaultRowsPerPage: 10,
        rowsPerPageOptions: [5, 10, 25, 50],
      }}
    />
  );
}
