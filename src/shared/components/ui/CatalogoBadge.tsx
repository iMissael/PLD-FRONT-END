import type { ReactNode } from "react";

type Tono = "activo" | "inactivo" | "neutro";

interface BadgeProps {
  tono?: Tono;
  children: ReactNode;
}

const POR_TONO: Record<Tono, string> = {
  activo: "bg-success-soft text-success-hover",
  inactivo: "bg-muted text-muted-foreground",
  neutro: "bg-primary/10 text-primary",
};

/** Píldora de estatus para las tablas (Activa / Inactiva). */
export function Badge({ tono = "neutro", children }: BadgeProps) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${POR_TONO[tono]}`}>
      {children}
    </span>
  );
}
