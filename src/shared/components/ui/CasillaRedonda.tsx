import type { ReactNode } from "react";
import { Check, Minus } from "lucide-react";

import { cn } from "@/shared/utils/cn";

interface CasillaRedondaProps {
  marcada: boolean;
  /** Algunos hijos marcados: se muestra un guion (estado "mixto"). */
  parcial?: boolean;
  onCambiar: () => void;
  /** Texto a la derecha de la casilla. */
  children?: ReactNode;
  /** Nombre accesible cuando no hay texto visible (p. ej. dentro de una tabla). */
  etiqueta?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Casilla de selección múltiple redonda. El input nativo sigue ahí (oculto) para el
 * teclado y los lectores de pantalla; el círculo es solo la parte visible.
 */
export function CasillaRedonda({
  marcada,
  parcial = false,
  onCambiar,
  children,
  etiqueta,
  disabled = false,
  className,
}: CasillaRedondaProps) {
  const mixta = parcial && !marcada;
  return (
    <label
      className={cn(
        "inline-flex select-none items-center gap-2",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className,
      )}
    >
      <input
        type="checkbox"
        checked={marcada}
        disabled={disabled}
        onChange={onCambiar}
        aria-label={etiqueta}
        aria-checked={mixta ? "mixed" : marcada}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "flex size-[18px] shrink-0 items-center justify-center rounded-full border transition-colors",
          "peer-focus-visible:ring-ring/50 peer-focus-visible:ring-2",
          marcada
            ? "border-primary bg-primary text-primary-foreground"
            : mixta
              ? "border-primary bg-primary/70 text-primary-foreground"
              : "border-input bg-card hover:border-primary/60",
        )}
      >
        {marcada ? (
          <Check className="size-3" strokeWidth={3} />
        ) : mixta ? (
          <Minus className="size-3" strokeWidth={3} />
        ) : null}
      </span>
      {children}
    </label>
  );
}
