import { field } from "@/shared/components/ui/styles";

import { useZonasGeograficasSelect } from "../../zonas-geograficas/hooks/useZonasGeograficas";

interface ZonaSelectProps {
  id?: string;
  value: string;
  onChange: (zonaId: string) => void;
  disabled?: boolean;
  required?: boolean;
}

/** `<select>` de una sola zona, usado por Entidades (`AsignarCatZonaEntidadRequest.zonaId`). */
export function ZonaSelect({ id, value, onChange, disabled, required }: ZonaSelectProps) {
  const { data: zonas, isLoading } = useZonasGeograficasSelect();

  return (
    <select
      id={id}
      value={value}
      disabled={disabled || isLoading}
      required={required}
      onChange={(event) => onChange(event.target.value)}
      className={field}
    >
      <option value="">{isLoading ? "Cargando..." : "Selecciona una zona"}</option>
      {zonas?.map((zona) => (
        <option key={zona.id} value={zona.id}>
          {zona.nombre}
        </option>
      ))}
    </select>
  );
}
