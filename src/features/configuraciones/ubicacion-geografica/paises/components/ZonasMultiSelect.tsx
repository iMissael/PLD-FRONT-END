import { useZonasGeograficasSelect } from "../../zonas-geograficas/hooks/useZonasGeograficas";

interface ZonasMultiSelectProps {
  value: string[];
  onChange: (zonaIds: string[]) => void;
  disabled?: boolean;
}

/**
 * Multi-select de zonas geográficas para el formulario de Países. La
 * pantalla legacy de escritorio usa un combo de una sola zona, pero el DTO
 * real (`zonaIds: List<String>`) permite varias — así que aquí se replica
 * el comportamiento real del backend en vez del combo simple del sistema
 * anterior.
 */
export function ZonasMultiSelect({ value, onChange, disabled }: ZonasMultiSelectProps) {
  const { data: zonas, isLoading } = useZonasGeograficasSelect();

  const listaZonas = Array.isArray(zonas)
    ? zonas
    : Array.isArray((zonas as unknown as { contenido?: typeof zonas })?.contenido)
    ? ((zonas as unknown as { contenido: typeof zonas }).contenido ?? [])
    : [];

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando zonas...</p>;
  }

  return (
    <div className="max-h-40 overflow-y-auto rounded-md border border-border p-2">
      {listaZonas.map((zona) => (
        <label
          key={zona.id}
          className="flex items-center gap-2 rounded px-2 py-1 text-sm text-foreground hover:bg-muted"
        >
          <input
            type="checkbox"
            disabled={disabled}
            checked={value.includes(zona.id)}
            onChange={() => toggle(zona.id)}
            className="rounded border-border accent-accent"
          />
          {zona.nombre}
        </label>
      ))}
      {listaZonas.length === 0 ? (
        <p className="px-2 py-1 text-sm text-muted-foreground">
          No hay zonas registradas.
        </p>
      ) : null}
    </div>
  );
}
