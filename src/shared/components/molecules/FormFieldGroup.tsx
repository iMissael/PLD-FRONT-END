import type { ReactNode } from "react";
import { Label } from "@/shared/components/atoms/Label";
import { cn } from "@/shared/utils/cn";

export interface FormFieldGroupProps {
  label?: ReactNode;
  htmlFor?: string;
  required?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function FormFieldGroup({
  label,
  htmlFor,
  required,
  hint,
  error,
  className,
  children,
}: FormFieldGroupProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-1 text-destructive font-bold">*</span>}
        </Label>
      )}

      {children}

      {error ? (
        <p className="text-xs text-destructive font-medium leading-tight">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground leading-tight">{hint}</p>
      ) : null}
    </div>
  );
}
