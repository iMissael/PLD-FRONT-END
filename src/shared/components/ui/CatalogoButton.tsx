import type { ButtonHTMLAttributes } from "react";

type Variante = "primario" | "secundario" | "peligro";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
}

/**
 * Botón de la app. Los colores vienen de los tokens del tema
 * (`estilos/paleta_colores.md`): el primario es el acento indigo, el
 * secundario es un contorno neutro y el de peligro usa el rojo de la guía.
 */
const CLASES_BASE =
  "rounded-md px-4 py-2 text-sm font-medium transition-colors " +
  "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

const POR_VARIANTE: Record<Variante, string> = {
  primario: "bg-primary text-white hover:bg-primary-hover",
  secundario: "border border-border bg-card text-foreground hover:bg-muted",
  peligro: "border border-destructive/40 text-destructive hover:bg-destructive-soft",
};

export function Button({
  variante = "primario",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${CLASES_BASE} ${POR_VARIANTE[variante]} ${className}`.trim()}
      {...props}
    />
  );
}
