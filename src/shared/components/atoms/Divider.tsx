import * as React from "react";
import { cn } from "@/shared/utils/cn";

export interface DividerProps extends React.ComponentProps<"hr"> {
  orientation?: "horizontal" | "vertical";
}

export function Divider({
  orientation = "horizontal",
  className,
  ...props
}: DividerProps) {
  if (orientation === "vertical") {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn("h-full w-px bg-border shrink-0", className)}
        {...props}
      />
    );
  }

  return (
    <hr
      role="separator"
      aria-orientation="horizontal"
      className={cn("w-full border-t border-border my-2 shrink-0", className)}
      {...props}
    />
  );
}
