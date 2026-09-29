import type { ReactNode } from "react";

type Tono = "error" | "advertencia" | "exito";

interface AlertProps {
  tono?: Tono;
  children: ReactNode;
}

const POR_TONO: Record<Tono, string> = {
  error: "border-destructive/30 bg-destructive-soft text-destructive",
  advertencia: "border-warning/30 bg-warning-soft text-warning",
  exito: "border-success/30 bg-success-soft text-success-hover",
};

/**
 * Banner de mensaje. Los tonos son los de la guía: rojo para error, ámbar
 * para advertencia y verde para éxito.
 */
export function Alert({ tono = "error", children }: AlertProps) {
  return (
    <p className={`rounded-md border px-4 py-2 text-sm ${POR_TONO[tono]}`}>{children}</p>
  );
}
