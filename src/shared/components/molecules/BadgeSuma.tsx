import { cn } from "@/shared/utils/cn";

export interface BadgeSumaProps {
  suma: number;
  objetivo?: number;
  tolerancia?: number;
  className?: string;
}

export function BadgeSuma({
  suma,
  objetivo = 100,
  tolerancia = 0.01,
  className,
}: BadgeSumaProps) {
  const esValido = Math.abs(suma - objetivo) < tolerancia;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        esValido
          ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
          : "border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/60 dark:text-red-300",
        className
      )}
    >
      Suma: {suma.toFixed(2)}%
    </span>
  );
}
