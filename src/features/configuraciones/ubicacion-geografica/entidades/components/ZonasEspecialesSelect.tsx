import { useZonasGeograficasSelect } from "../../zonas-geograficas/hooks/useZonasGeograficas";

interface ZonasEspecialesSelectProps {
  value: string[];
  onChange: (zonaIds: string[]) => void;
  disabled?: boolean;
}

/**
 * Zonas especiales de la entidad (p. ej. ZONA FRONTERIZA). Una entidad puede estar en
 * varias; en todas conserva el nivel de su zona principal.
 */
export function ZonasEspecialesSelect({ value, onChange, disabled }: ZonasEspecialesSelectProps) {
  const { data: zonas, isLoading } = useZonasGeograficasSelect();
  const especiales = (zonas ?? []).filter((z) => z.esEntidadEspecial && z.estatus === "A");

  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando zonas...</p>;
  }
  if (especiales.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay zonas especiales registradas.</p>;
  }
  return (
    <div className="max-h-40 overflow-y-auto rounded-md border border-border p-2">
      {especiales.map((zona) => (
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
    </div>
  );
}
