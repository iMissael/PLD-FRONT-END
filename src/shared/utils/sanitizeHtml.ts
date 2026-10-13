import DOMPurify from "dompurify";

/**
 * Sanitización única para el HTML enriquecido que edita el administrador
 * (cabecera del buzón) y que se muestra en el buzón público.
 *
 * - Permite `style`, pero solo con propiedades tipográficas/de caja de la lista
 *   blanca: bloquea `position`, `z-index`, `url()`, etc., que permitirían
 *   overlays de phishing/clickjacking sobre el formulario de denuncia.
 * - Enlaces: solo http(s)/mailto, y siempre `target="_blank" rel="noopener noreferrer"`.
 */
const ESTILOS_PERMITIDOS = new Set([
  "color",
  "background",
  "background-color",
  "border",
  "border-color",
  "border-style",
  "border-width",
  "border-radius",
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "font-size",
  "font-weight",
  "font-style",
  "line-height",
  "text-align",
  "text-decoration",
  "display",
  "align-items",
  "gap",
]);

const DISPLAY_PERMITIDOS = new Set(["block", "inline", "inline-block", "flex", "inline-flex"]);
const VALOR_PELIGROSO = /url\s*\(|expression\s*\(|javascript:|@import|[<>\\]/i;
const ESQUEMAS_PERMITIDOS = new Set(["http:", "https:", "mailto:"]);

function filtrarEstilo(estilo: string): string {
  return estilo
    .split(";")
    .map((decl) => {
      const idx = decl.indexOf(":");
      if (idx === -1) return null;
      const prop = decl.slice(0, idx).trim().toLowerCase();
      const valor = decl.slice(idx + 1).trim();
      if (!ESTILOS_PERMITIDOS.has(prop) || !valor || VALOR_PELIGROSO.test(valor)) return null;
      if (prop === "display" && !DISPLAY_PERMITIDOS.has(valor.toLowerCase())) return null;
      return `${prop}: ${valor}`;
    })
    .filter(Boolean)
    .join("; ");
}

/** Devuelve la URL normalizada si es http(s)/mailto; si no, `null`. */
export function urlSegura(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    return ESQUEMAS_PERMITIDOS.has(parsed.protocol) ? parsed.href : null;
  } catch {
    return null;
  }
}

export function sanitizeRichHtml(html: string): string {
  DOMPurify.addHook("uponSanitizeAttribute", (_node, data) => {
    if (data.attrName === "style") {
      const filtrado = filtrarEstilo(data.attrValue);
      if (filtrado) data.attrValue = filtrado;
      else data.keepAttr = false;
    }
  });
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A") {
      const href = node.getAttribute("href");
      const segura = href ? urlSegura(href) : null;
      if (segura) node.setAttribute("href", segura);
      else node.removeAttribute("href");
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
  });

  try {
    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      ADD_ATTR: ["target", "rel", "style", "class"],
      ADD_TAGS: ["mark"],
      FORBID_TAGS: ["style", "form", "input", "button", "iframe", "object", "embed"],
    });
  } finally {
    DOMPurify.removeHook("uponSanitizeAttribute");
    DOMPurify.removeHook("afterSanitizeAttributes");
  }
}

/** Escapa texto plano para interpolarlo de forma segura dentro de HTML. */
export function escapeHtml(texto: string): string {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML.replace(/"/g, "&quot;");
}
