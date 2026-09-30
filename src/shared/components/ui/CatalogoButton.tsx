import * as React from "react";
import { Button as BaseButton, type buttonVariants } from "@/shared/components/ui/button";
import type { VariantProps } from "class-variance-authority";

type Variante = "primario" | "secundario" | "peligro";

export interface CatalogoButtonProps
  extends Omit<React.ComponentProps<"button">, "ref">,
    VariantProps<typeof buttonVariants> {
  variante?: Variante;
  asChild?: boolean;
}

const VARIANTE_MAP: Record<Variante, "default" | "outline" | "destructive"> = {
  primario: "default",
  secundario: "outline",
  peligro: "destructive",
};

/**
 * Botón unificado de la aplicación.
 * Compatible con la API tradicional de catálogos (`variante`) y la API estándar (`variant`).
 */
export function Button({
  variante,
  variant,
  className = "",
  ...props
}: CatalogoButtonProps) {
  const resolvedVariant = variant ?? (variante ? VARIANTE_MAP[variante] : "default");

  return <BaseButton variant={resolvedVariant} className={className} {...props} />;
}
