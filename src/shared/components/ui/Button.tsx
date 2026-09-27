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
  "focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:outline-none " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

const POR_VARIANTE: Record<Variante, string> = {
  primario: "bg-accent text-white hover:bg-accent-hover",
  secundario: "border border-line bg-panel text-fg hover:bg-hover",
  peligro: "border border-danger/40 text-danger hover:bg-danger-soft",
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
