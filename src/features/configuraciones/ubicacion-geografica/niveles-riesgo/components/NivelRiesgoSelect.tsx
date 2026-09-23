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
 * formularios de Zonas geográficas, Países y Localidades (cambio de riesgo).
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
      className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none disabled:opacity-50"
    >
      <option value="">{isLoading ? "Cargando..." : "Selecciona un nivel"}</option>
      {niveles?.map((nivel) => (
        <option key={nivel.id} value={nivel.id}>
          {nivel.nivel_riesgo_descripcion} ({nivel.nivel_riesgo_valor})
        </option>
      ))}
    </select>
  );
}
