import { field } from "@/shared/components/ui/styles";

import { useZonasGeograficasSelect } from "../../zonas-geograficas/hooks/useZonasGeograficas";

interface ZonaSelectProps {
  id?: string;
  value: string;
  onChange: (zonaId: string) => void;
  disabled?: boolean;
  required?: boolean;
}

/** Zona principal de la entidad: solo zonas principales activas (una por entidad). */
export function ZonaSelect({ id, value, onChange, disabled, required }: ZonaSelectProps) {
  const { data: zonas, isLoading } = useZonasGeograficasSelect();
  const principales = (zonas ?? []).filter((z) => !z.esEntidadEspecial && z.estatus === "A");

  return (
    <select
      id={id}
      value={value}
      disabled={disabled || isLoading}
      required={required}
      onChange={(event) => onChange(event.target.value)}
      className={field}
    >
      <option value="">{isLoading ? "Cargando..." : "Selecciona la zona principal"}</option>
      {principales.map((zona) => (
        <option key={zona.id} value={zona.id}>
          {zona.nombre} — {zona.nivelRiesgoDescripcion}
        </option>
      ))}
    </select>
  );
}
