import { useListasPaisesSelect } from "../../listas-paises/hooks/useListasPaises";

interface ListasMultiSelectProps {
  value: string[];
  onChange: (listaIds: string[]) => void;
  disabled?: boolean;
}

/**
 * Multi-select de listas de riesgo (cooperante, GAFI, paraísos fiscales...) para el formulario de Países. La
 * pantalla legacy de escritorio usa un combo de una sola zona, pero el DTO
 * real (`listaIds: List<String>`) permite varias — así que aquí se replica
 * el comportamiento real del backend en vez del combo simple del sistema
 * anterior.
 */
export function ListasMultiSelect({ value, onChange, disabled }: ListasMultiSelectProps) {
  const { data: listas, isLoading } = useListasPaisesSelect();

  const listasRiesgo = Array.isArray(listas)
    ? listas
    : Array.isArray((listas as unknown as { contenido?: typeof listas })?.contenido)
    ? ((listas as unknown as { contenido: typeof listas }).contenido ?? [])
    : [];

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando listas...</p>;
  }

  return (
    <div className="max-h-40 overflow-y-auto rounded-md border border-border p-2">
      {listasRiesgo.map((lista) => (
        <label
          key={lista.id}
          className="flex items-center gap-2 rounded px-2 py-1 text-sm text-foreground hover:bg-muted"
        >
          <input
            type="checkbox"
            disabled={disabled}
            checked={value.includes(lista.id)}
            onChange={() => toggle(lista.id)}
            className="rounded border-border accent-accent"
          />
          {lista.nombre}
        </label>
      ))}
      {listasRiesgo.length === 0 ? (
        <p className="px-2 py-1 text-sm text-muted-foreground">
          No hay listas registradas.
        </p>
      ) : null}
    </div>
  );
}
