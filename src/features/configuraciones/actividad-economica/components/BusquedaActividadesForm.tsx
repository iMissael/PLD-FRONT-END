import { Input } from "@/shared/components/atoms/Input";
import { Card } from "@/shared/components/molecules";
import { label } from "@/shared/styles/tokens";

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
    <Card className="flex flex-col gap-2 p-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="busqueda" className={label}>
          Buscar por descripción
        </label>
        <Input
          id="busqueda"
          type="search"
          value={valor}
          onChange={(event) => onCambiar(event.target.value)}
          placeholder="Ej. cultivo de arroz"
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {valor.trim()
          ? `${totalFiltrado} de ${totalGeneral} actividades`
          : `${totalGeneral} actividades`}
      </p>
    </Card>
  );
}
