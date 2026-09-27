import type { ReactNode } from "react";

type Tono = "activo" | "inactivo" | "neutro";

interface BadgeProps {
  tono?: Tono;
  children: ReactNode;
}

const POR_TONO: Record<Tono, string> = {
  activo: "bg-success-soft text-success-hover",
  inactivo: "bg-hover text-muted",
  neutro: "bg-accent/10 text-accent",
};

/** Píldora de estatus para las tablas (Activa / Inactiva). */
export function Badge({ tono = "neutro", children }: BadgeProps) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${POR_TONO[tono]}`}
    >
      {children}
    </span>
  );
}
