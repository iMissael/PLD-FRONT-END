import { describe, expect, it } from "vitest";

import { escapeHtml, sanitizeRichHtml, urlSegura } from "./sanitizeHtml";

describe("sanitizeRichHtml", () => {
  it("elimina scripts y manejadores de eventos", () => {
    const out = sanitizeRichHtml(`<p onclick="alert(1)">hola</p><script>alert(1)</script><img src=x onerror=alert(1)>`);
    expect(out).not.toMatch(/onclick|onerror|<script/i);
    expect(out).toContain("hola");
  });

  it("quita href javascript: y fuerza rel/target en enlaces", () => {
    const out = sanitizeRichHtml(`<a href="javascript:alert(1)">x</a><a href="https://ok.mx">y</a>`);
    expect(out).not.toContain("javascript:");
    expect(out).toContain('href="https://ok.mx/"');
    expect(out).toContain('rel="noopener noreferrer"');
  });

  it("filtra CSS peligroso pero conserva estilos tipográficos", () => {
    const out = sanitizeRichHtml(
      `<div style="position:fixed; z-index:9999; color:#059669; background:url(https://evil)">t</div>`,
    );
    expect(out).toContain("color: #059669");
    expect(out).not.toMatch(/position|z-index|url\(/);
  });

  it("no convierte entidades escapadas en HTML activo", () => {
    const out = sanitizeRichHtml("&lt;img src=x onerror=alert(1)&gt;");
    expect(out).not.toMatch(/<img/i);
  });
});

describe("urlSegura / escapeHtml", () => {
  it("acepta solo http(s)/mailto", () => {
    expect(urlSegura("https://a.mx")).toBe("https://a.mx/");
    expect(urlSegura("mailto:a@b.mx")).toBe("mailto:a@b.mx");
    expect(urlSegura("javascript:alert(1)")).toBeNull();
    expect(urlSegura("data:text/html,x")).toBeNull();
    expect(urlSegura("no es url")).toBeNull();
  });

  it("escapa texto y comillas", () => {
    expect(escapeHtml(`"><script>`)).toBe("&quot;&gt;&lt;script&gt;");
  });
});
