import { useMemo } from "react";
import { useZonasGeograficasSelect } from "../../zonas-geograficas/hooks/useZonasGeograficas";
import type { ZonaGeograficaResponse } from "../../zonas-geograficas/types/zonaGeografica";

interface ZonasEntidadMultiSelectProps {
  value: string[];
  onChange: (zonaIds: string[]) => void;
  disabled?: boolean;
}

/**
 * Selector múltiple de zonas de riesgo para entidades federativas.
 * Regla de negocio:
 * - Zonas estándar (no especiales): Únicamente se puede seleccionar 1.
 * - Zonas especiales: Se pueden seleccionar múltiples zonas.
 */
export function ZonasEntidadMultiSelect({
  value,
  onChange,
  disabled,
}: ZonasEntidadMultiSelectProps) {
  const { data: zonas, isLoading } = useZonasGeograficasSelect();

  const listaZonas = useMemo(() => {
    if (!zonas) return [];
    if (Array.isArray(zonas)) return zonas;
    if (Array.isArray((zonas as unknown as { contenido?: ZonaGeograficaResponse[] })?.contenido)) {
      return (zonas as unknown as { contenido: ZonaGeograficaResponse[] }).contenido ?? [];
    }
    return [];
  }, [zonas]);

  const { zonasEstandar, zonasEspeciales } = useMemo(() => {
    const estandar: ZonaGeograficaResponse[] = [];
    const especiales: ZonaGeograficaResponse[] = [];

    listaZonas.forEach((z) => {
      if (z.esEntidadEspecial) {
        especiales.push(z);
      } else {
        estandar.push(z);
      }
    });

    return { zonasEstandar: estandar, zonasEspeciales: especiales };
  }, [listaZonas]);

  const handleToggle = (zona: ZonaGeograficaResponse) => {
    const esEspecial = Boolean(zona.esEntidadEspecial);

    if (esEspecial) {
      // Zona especial: agregar o quitar libremente
      if (value.includes(zona.id)) {
        onChange(value.filter((id) => id !== zona.id));
      } else {
        onChange([...value, zona.id]);
      }
    } else {
      // Zona no especial: solo 1 permitida (reemplaza a la zona no especial previa)
      if (value.includes(zona.id)) {
        onChange(value.filter((id) => id !== zona.id));
      } else {
        const idsNoEspeciales = new Set(zonasEstandar.map((z) => z.id));
        const sinNoEspeciales = value.filter((id) => !idsNoEspeciales.has(id));
        onChange([...sinNoEspeciales, zona.id]);
      }
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando zonas de riesgo...</p>;
  }

  return (
    <div className="flex flex-col gap-4 rounded-md border border-border p-3 bg-card">
      {/* Sección 1: Zonas estándar (No especiales - máx 1) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">
            Zona estándar (selección única)
          </span>
          <span className="text-[11px] text-muted-foreground">
            Máx. 1 zona no especial
          </span>
        </div>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {zonasEstandar.map((zona) => {
            const isChecked = value.includes(zona.id);
            return (
              <label
                key={zona.id}
                className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                  isChecked
                    ? "border-primary bg-primary/10 text-foreground font-medium"
                    : "border-border bg-card text-foreground hover:bg-muted"
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input
                  type="checkbox"
                  disabled={disabled}
                  checked={isChecked}
                  onChange={() => handleToggle(zona)}
                  className="rounded border-border accent-primary size-3.5"
                />
                <span className="flex-1 truncate">{zona.nombre}</span>
                <span className="text-[11px] text-muted-foreground">
                  ({zona.nivelRiesgoDescripcion})
                </span>
              </label>
            );
          })}
          {zonasEstandar.length === 0 ? (
            <p className="text-xs text-muted-foreground col-span-2">
              No hay zonas estándar registradas.
            </p>
          ) : null}
        </div>
      </div>

      {/* Sección 2: Zonas especiales (Múltiples) */}
      <div className="flex flex-col gap-2 border-t border-border pt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">
            Zonas especiales (selección múltiple)
          </span>
          <span className="text-[11px] text-muted-foreground">
            Puedes seleccionar varias
          </span>
        </div>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {zonasEspeciales.map((zona) => {
            const isChecked = value.includes(zona.id);
            return (
              <label
                key={zona.id}
                className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                  isChecked
                    ? "border-accent-foreground/50 bg-accent text-accent-foreground font-medium"
                    : "border-border bg-card text-foreground hover:bg-muted"
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input
                  type="checkbox"
                  disabled={disabled}
                  checked={isChecked}
                  onChange={() => handleToggle(zona)}
                  className="rounded border-border accent-primary size-3.5"
                />
                <span className="flex-1 truncate">{zona.nombre}</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  Especial
                </span>
                <span className="text-[11px] text-muted-foreground">
                  ({zona.nivelRiesgoDescripcion})
                </span>
              </label>
            );
          })}
          {zonasEspeciales.length === 0 ? (
            <p className="text-xs text-muted-foreground col-span-2">
              No hay zonas especiales registradas.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
