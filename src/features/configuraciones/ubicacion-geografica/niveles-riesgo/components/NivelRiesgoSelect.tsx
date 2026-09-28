import { field } from "@/shared/components/ui/styles";

import { useNivelesRiesgo } from "../hooks/useNivelesRiesgo";

interface NivelRiesgoSelectProps {
  id?: string;
  value: number | "";
  onChange: (id: number) => void;
  disabled?: boolean;
  required?: boolean;
}

/**
 * `<select>` compartido para el catálogo de Niveles de Riesgo. Lo usan los
 * formularios de Zonas geográficas, Países, Localidades (cambio de riesgo) y
 * los catálogos de Configuraciones.
 */
export function NivelRiesgoSelect({
  id,
  value,
  onChange,
  disabled,
  required,
}: NivelRiesgoSelectProps) {
  const { data: niveles, isLoading } = useNivelesRiesgo();

  return (
    <select
      id={id}
      value={value}
      disabled={disabled || isLoading}
      required={required}
      onChange={(event) => onChange(Number(event.target.value))}
      className={field}
    >
      <option value="">{isLoading ? "Cargando..." : "Selecciona un nivel"}</option>
      {niveles?.map((nivel) => (
        <option key={nivel.id} value={nivel.id}>
          {nivel.nivelRiesgoDescripcion} ({nivel.nivelRiesgoValor})
        </option>
      ))}
    </select>
  );
}
