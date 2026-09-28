import { card, field, label } from "@/shared/components/ui/styles";

interface BusquedaActividadesFormProps {
  valor: string;
  onCambiar: (valor: string) => void;
  totalFiltrado: number;
  totalGeneral: number;
}

/**
 * Búsqueda por descripción. Filtra en el cliente sobre el catálogo completo
 * que ya está en memoria, así que no hay debounce ni petición por tecla: el
 * resultado se actualiza al instante.
 */
export function BusquedaActividadesForm({
  valor,
  onCambiar,
  totalFiltrado,
  totalGeneral,
}: BusquedaActividadesFormProps) {
  return (
    <div
      className={`flex flex-col gap-2 p-4 sm:flex-row sm:items-end sm:justify-between ${card}`}
    >
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="busqueda" className={label}>
          Buscar por descripción
        </label>
        <input
          id="busqueda"
          type="search"
          value={valor}
          onChange={(event) => onCambiar(event.target.value)}
          placeholder="Ej. cultivo de arroz"
          className={field}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {valor.trim()
          ? `${totalFiltrado} de ${totalGeneral} actividades`
          : `${totalGeneral} actividades`}
      </p>
    </div>
  );
}
