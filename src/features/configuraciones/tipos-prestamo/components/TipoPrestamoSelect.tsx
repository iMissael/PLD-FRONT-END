import { field } from "@/shared/components/ui/styles";

import { useTiposPrestamo } from "../hooks/useTiposPrestamo";

interface TipoPrestamoSelectProps {
  id?: string;
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  required?: boolean;
}

/**
 * `<select>` compartido para el catálogo de Tipos de Préstamo. Lo usa el
 * formulario de Tipos de crédito.
 *
 * La opción vacía es un valor legítimo, no un placeholder: la columna
 * `cat_tipo_prestamo_id` es NOT NULL con default `''`, y `''` significa "sin
 * tipo de préstamo asignado". Por eso el select no es `required`.
 */
export function TipoPrestamoSelect({
  id,
  value,
  onChange,
  disabled,
  required,
}: TipoPrestamoSelectProps) {
  const { data: tipos, isLoading } = useTiposPrestamo();

  const listaTipos = Array.isArray(tipos)
    ? tipos
    : Array.isArray((tipos as unknown as { contenido?: typeof tipos })?.contenido)
    ? ((tipos as unknown as { contenido: typeof tipos }).contenido ?? [])
    : [];

  return (
    <select
      id={id}
      value={value}
      disabled={disabled || isLoading}
      required={required}
      onChange={(event) => onChange(event.target.value)}
      className={field}
    >
      <option value="">{isLoading ? "Cargando..." : "Sin asignar"}</option>
      {listaTipos.map((tipo) => (
        <option key={tipo.id} value={tipo.id}>
          {tipo.nombre}
        </option>
      ))}
    </select>
  );
}
