import { useListasPaisesSelect } from "../../listas-paises/hooks/useListasPaises";

interface ListasMultiSelectProps {
  value: string[];
  onChange: (listaIds: string[]) => void;
  disabled?: boolean;
}

/**
 * Multi-select de listas de países para el formulario de Países.
 */
export function ListasMultiSelect({ value, onChange, disabled }: ListasMultiSelectProps) {
  const { data: listas, isLoading } = useListasPaisesSelect();

  const listaItems = Array.isArray(listas)
    ? listas
    : Array.isArray((listas as unknown as { contenido?: typeof listas })?.contenido)
    ? ((listas as unknown as { contenido: typeof listas }).contenido ?? [])
    : [];

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando listas de países...</p>;
  }

  return (
    <div className="max-h-40 overflow-y-auto rounded-md border border-border p-2">
      {listaItems.map((lista) => (
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
          <span>{lista.nombre}</span>
          <span className="text-xs text-muted-foreground">({lista.nivelRiesgoDescripcion})</span>
        </label>
      ))}
      {listaItems.length === 0 ? (
        <p className="px-2 py-1 text-sm text-muted-foreground">
          No hay listas de países registradas.
        </p>
      ) : null}
    </div>
  );
}
