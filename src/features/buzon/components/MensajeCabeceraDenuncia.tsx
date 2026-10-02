import { useMemo } from "react";
import DOMPurify from "dompurify";
import { useMensajeDenunciaPublico } from "../hooks/useMensajeDenuncia";

interface MensajeCabeceraDenunciaProps {
  tenantId?: string;
  className?: string;
}

export function MensajeCabeceraDenuncia({
  tenantId,
  className = "",
}: MensajeCabeceraDenunciaProps) {
  const { data, isLoading, isError } = useMensajeDenunciaPublico(tenantId);

  const rawHtml =
    data?.contenidoSanitizado ||
    data?.contenidoHtml ||
    data?.html ||
    "";

  const cleanHtml = useMemo(() => {
    if (!rawHtml || typeof rawHtml !== "string") return "";
    return DOMPurify.sanitize(rawHtml, {
      USE_PROFILES: { html: true },
      ADD_ATTR: ["target", "rel"],
    });
  }, [rawHtml]);

  if (isLoading) {
    return (
      <div className={`mb-6 animate-pulse rounded-xl border border-border bg-card p-4 shadow-xs ${className}`}>
        <div className="h-4 w-3/4 rounded bg-muted"></div>
        <div className="mt-2.5 h-3 w-1/2 rounded bg-muted"></div>
      </div>
    );
  }

  if (isError || !cleanHtml.trim()) {
    return null;
  }

  return (
    <div
      className={`mb-6 rounded-xl border border-border/80 bg-card p-5 shadow-xs transition-colors dark:bg-card/90 ${className}`}
      data-testid="mensaje-cabecera-denuncia"
    >
      <div
        className="prose prose-sm max-w-none text-foreground leading-relaxed dark:prose-invert [&_a]:text-primary [&_a]:underline hover:[&_a]:text-primary-hover [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold"
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
    </div>
  );
}
