import type { ReactNode } from "react";
import { StatusBadge, type StatusType } from "./StatusBadge";

interface BadgeProps {
  tono?: "activo" | "inactivo" | "neutro";
  status?: StatusType;
  children: ReactNode;
  className?: string;
}

/** Píldora unificada de estatus para las tablas (Activa / Inactiva, etc.). */
export function Badge({ tono, status, children, className }: BadgeProps) {
  return (
    <StatusBadge tono={tono} status={status} className={className}>
      {children}
    </StatusBadge>
  );
}
