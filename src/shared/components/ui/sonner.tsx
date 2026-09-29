import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      richColors
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          "--success-bg": "var(--success-soft)",
          "--success-text": "var(--success-hover)",
          "--success-border": "color-mix(in srgb, var(--success) 35%, white)",
          "--warning-bg": "var(--warning-soft)",
          "--warning-text": "var(--warning-hover)",
          "--warning-border": "color-mix(in srgb, var(--warning) 35%, white)",
          "--error-bg": "var(--destructive-soft)",
          "--error-text": "var(--destructive-hover)",
          "--error-border": "color-mix(in srgb, var(--destructive) 35%, white)",
          "--info-bg": "var(--primary-soft)",
          "--info-text": "var(--primary-strong)",
          "--info-border": "color-mix(in srgb, var(--primary) 35%, white)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
