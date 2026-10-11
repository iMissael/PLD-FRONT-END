import { useMemo } from "react";
import DOMPurify from "dompurify";
import { useMensajeDenunciaPublico } from "../hooks/useMensajeDenuncia";

interface MensajeCabeceraDenunciaProps {
  tenantId?: string;
  className?: string;
}

const MENSAJE_DEFAULT_CABECERA = `<div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 10px; padding: 14px 16px;">
  <strong style="color: #059669; display: flex; align-items: center; gap: 6px; margin-bottom: 4px; font-size: 0.95rem;">🔒 Canal 100% Seguro y Confidencial</strong>
  <p style="margin: 0; font-size: 0.88rem; line-height: 1.5;">Tus denuncias son tratadas con estricta confidencialidad y sin represalias. Puedes detallar los hechos con total tranquilidad.</p>
</div>`;

export function MensajeCabeceraDenuncia({
  tenantId,
  className = "",
}: MensajeCabeceraDenunciaProps) {
  const { data, isLoading } = useMensajeDenunciaPublico(tenantId);

  const rawHtml = useMemo(() => {
    if (!data) return "";
    if (typeof data === "string") return data;
    const d = data as unknown as Record<string, unknown>;
    const inner = (d.data || d.result || d) as Record<string, unknown>;
    return (
      (inner.contenidoSanitizado as string) ||
      (inner.contenidoHtml as string) ||
      (inner.html as string) ||
      (inner.contenido as string) ||
      (inner.mensaje as string) ||
      (inner.htmlContent as string) ||
      (inner.texto as string) ||
      (typeof inner === "string" ? inner : "") ||
      ""
    );
  }, [data]);

  const cleanHtml = useMemo(() => {
    const htmlToSanitize = rawHtml && rawHtml.trim() ? rawHtml : MENSAJE_DEFAULT_CABECERA;

    let decoded = htmlToSanitize;
    if (decoded.includes("&lt;") && decoded.includes("&gt;")) {
      const parser = new DOMParser();
      const dom = parser.parseFromString(decoded, "text/html");
      decoded = dom.body.textContent || decoded;
    }

    const sanitized = DOMPurify.sanitize(decoded, {
      ADD_ATTR: ["target", "rel", "style", "class"],
      ADD_TAGS: ["mark"],
    });

    return sanitized && sanitized.trim() ? sanitized : MENSAJE_DEFAULT_CABECERA;
  }, [rawHtml]);

  if (isLoading) {
    return (
      <div className={`mb-6 animate-pulse rounded-xl border border-border bg-card p-4 shadow-xs ${className}`}>
        <div className="h-4 w-3/4 rounded bg-muted"></div>
        <div className="mt-2.5 h-3 w-1/2 rounded bg-muted"></div>
      </div>
    );
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
