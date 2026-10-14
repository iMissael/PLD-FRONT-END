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

  const listaNiveles = Array.isArray(niveles)
    ? niveles
    : Array.isArray((niveles as unknown as { contenido?: typeof niveles })?.contenido)
    ? ((niveles as unknown as { contenido: typeof niveles }).contenido ?? [])
    : [];

  return (
    <select
      id={id}
      value={value}
      disabled={disabled || isLoading}
      required={required}
      onChange={(event) => onChange(Number(event.target.value))}
      className="border-input bg-card text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <option value="">{isLoading ? "Cargando..." : "Selecciona un nivel"}</option>
      {listaNiveles.map((nivel) => (
        <option key={nivel.id} value={nivel.id}>
          {nivel.nivelRiesgoDescripcion} ({nivel.nivelRiesgoValor})
        </option>
      ))}
    </select>
  );
}
