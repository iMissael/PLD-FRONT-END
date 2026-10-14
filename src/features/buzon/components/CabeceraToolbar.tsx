import { useState } from "react";
import { toast } from "sonner";
import { escapeHtml, urlSegura } from "@/shared/utils/sanitizeHtml";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  Palette,
  Square,
  Link2,
  ChevronDown,
  Shield,
  HelpCircle,
  AlertTriangle,
  Undo,
  Redo,
  Trash2,
  Pilcrow,
} from "lucide-react";
import { Button } from "@/shared/components/atoms/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/molecules/Popover";

interface CabeceraToolbarProps {
  ejecutarComando: (comando: string, valor?: string) => void;
  insertarElementoHtml: (html: string) => void;
  onLimpiarTodo: () => void;
}

export function CabeceraToolbar({
  ejecutarComando,
  insertarElementoHtml,
  onLimpiarTodo,
}: CabeceraToolbarProps) {
  const [encabezadoPopoverAbierto, setEncabezadoPopoverAbierto] = useState(false);
  const [colorPopoverAbierto, setColorPopoverAbierto] = useState(false);
  const [cuadroPopoverAbierto, setCuadroPopoverAbierto] = useState(false);
  const [linkPopoverAbierto, setLinkPopoverAbierto] = useState(false);
  const [linkTexto, setLinkTexto] = useState("");
  const [linkUrl, setLinkUrl] = useState("https://");

  const aplicarColorTexto = (hexColor: string) => {
    ejecutarComando("foreColor", hexColor);
    setColorPopoverAbierto(false);
  };

  const aplicarResaltado = (bgHex: string, textHex: string) => {
    const seleccion = window.getSelection();
    if (seleccion && seleccion.toString().trim()) {
      const texto = escapeHtml(seleccion.toString());
      const markHtml = `<mark style="background-color: ${bgHex}; color: ${textHex}; padding: 2px 6px; border-radius: 4px; font-weight: 500;">${texto}</mark>`;
      insertarElementoHtml(markHtml);
    } else {
      insertarElementoHtml(
        `<mark style="background-color: ${bgHex}; color: ${textHex}; padding: 2px 6px; border-radius: 4px; font-weight: 500;">Texto resaltado</mark>&nbsp;`,
      );
    }
    setColorPopoverAbierto(false);
  };

  const insertarEnlace = () => {
    const href = linkUrl === "https://" ? null : urlSegura(linkUrl);
    if (!href) {
      toast.error("Ingresa una URL válida que inicie con http://, https:// o mailto:.");
      return;
    }
    const texto = escapeHtml(linkTexto.trim() || href);
    const enlaceHtml = `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" style="color: #059669; text-decoration: underline; font-weight: 500;">${texto}</a>&nbsp;`;
    insertarElementoHtml(enlaceHtml);
    setLinkPopoverAbierto(false);
    setLinkUrl("https://");
    setLinkTexto("");
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 p-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Deshacer / Rehacer */}
        <div className="flex items-center gap-0.5 rounded-lg border border-border/70 bg-background p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => ejecutarComando("undo")}
            className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Deshacer (Ctrl + Z)"
          >
            <Undo className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => ejecutarComando("redo")}
            className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Rehacer (Ctrl + Y)"
          >
            <Redo className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Formato de texto básico: Negrita, Cursiva, Subrayado */}
        <div className="flex items-center gap-0.5 rounded-lg border border-border/70 bg-background p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => ejecutarComando("bold")}
            className="flex h-7 w-7 items-center justify-center rounded font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Negrita"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => ejecutarComando("italic")}
            className="flex h-7 w-7 items-center justify-center rounded italic text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Cursiva"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => ejecutarComando("underline")}
            className="flex h-7 w-7 items-center justify-center rounded text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Subrayado"
          >
            <Underline className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Títulos y Párrafo */}
        <Popover open={encabezadoPopoverAbierto} onOpenChange={setEncabezadoPopoverAbierto}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-7 items-center gap-1 rounded-lg border border-border/70 bg-background px-2 text-xs font-medium text-foreground shadow-2xs hover:bg-muted transition-colors cursor-pointer"
              title="Tamaño de texto"
            >
              <Pilcrow className="h-3.5 w-3.5 text-primary" />
              <span>Estilo</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-1.5" align="start">
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  ejecutarComando("formatBlock", "<h2>");
                  setEncabezadoPopoverAbierto(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-bold hover:bg-muted transition-colors cursor-pointer"
              >
                <Heading1 className="h-4 w-4 text-primary shrink-0" />
                <span>Título Grande</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  ejecutarComando("formatBlock", "<h3>");
                  setEncabezadoPopoverAbierto(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
              >
                <Heading2 className="h-4 w-4 text-primary shrink-0" />
                <span>Subtítulo</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  ejecutarComando("formatBlock", "<p>");
                  setEncabezadoPopoverAbierto(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted transition-colors border-t border-border/40 pt-1 cursor-pointer"
              >
                <Pilcrow className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>Párrafo Normal</span>
              </button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Viñetas / Puntos */}
        <div className="flex items-center rounded-lg border border-border/70 bg-background p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => ejecutarComando("insertUnorderedList")}
            className="flex h-7 items-center gap-1 rounded px-2 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Lista con viñetas"
          >
            <List className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Viñetas</span>
          </button>
        </div>

        {/* Colores y Resaltador */}
        <Popover open={colorPopoverAbierto} onOpenChange={setColorPopoverAbierto}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-7 items-center gap-1 rounded-lg border border-border/70 bg-background px-2 text-xs font-medium text-foreground shadow-2xs hover:bg-muted transition-colors cursor-pointer"
              title="Color de texto o resaltado"
            >
              <Palette className="h-3.5 w-3.5 text-amber-500" />
              <span>Color</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-3" align="start">
            <div className="space-y-2.5">
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Color de Texto
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { nombre: "Verde", color: "#059669", bg: "bg-emerald-600" },
                    { nombre: "Azul", color: "#2563eb", bg: "bg-blue-600" },
                    { nombre: "Ámbar", color: "#d97706", bg: "bg-amber-600" },
                    { nombre: "Rojo", color: "#dc2626", bg: "bg-red-600" },
                  ].map((item) => (
                    <button
                      key={item.nombre}
                      type="button"
                      onClick={() => aplicarColorTexto(item.color)}
                      className="flex h-7 items-center justify-center rounded-md border border-border/80 hover:scale-105 hover:shadow-xs transition-all cursor-pointer"
                      title={item.nombre}
                    >
                      <span className={`h-3.5 w-3.5 rounded-full ${item.bg}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-border/50 pt-2">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Resaltar Fondo
                </p>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => aplicarResaltado("#fef08a", "#1e293b")}
                    className="rounded-md bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-900 text-left hover:brightness-95 transition-all cursor-pointer"
                  >
                    Resaltado Amarillo
                  </button>
                  <button
                    type="button"
                    onClick={() => aplicarResaltado("#d1fae5", "#065f46")}
                    className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-900 text-left hover:brightness-95 transition-all cursor-pointer"
                  >
                    Resaltado Verde
                  </button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Cuadro Informativo */}
        <Popover open={cuadroPopoverAbierto} onOpenChange={setCuadroPopoverAbierto}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-7 items-center gap-1 rounded-lg border border-border/70 bg-background px-2 text-xs font-medium text-foreground shadow-2xs hover:bg-muted transition-colors cursor-pointer"
              title="Insertar cuadro informativo"
            >
              <Square className="h-3.5 w-3.5 text-emerald-500" />
              <span>Cuadro</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-2" align="start">
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  insertarElementoHtml(
                    `<div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 10px; padding: 14px 16px; margin: 12px 0;">
  <strong style="color: #059669; display: flex; align-items: center; gap: 6px; margin-bottom: 4px; font-size: 0.95rem;">🔒 Canal 100% Seguro y Confidencial</strong>
  <p style="margin: 0; font-size: 0.88rem; line-height: 1.5; color: #334155;">Tus denuncias son tratadas con estricta confidencialidad y sin represalias.</p>
</div><p></p>`,
                  );
                  setCuadroPopoverAbierto(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2 text-left hover:bg-emerald-500/10 transition-colors cursor-pointer"
              >
                <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
                <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  Cuadro Seguro / Confidencial (Verde)
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  insertarElementoHtml(
                    `<div style="background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.35); border-radius: 10px; padding: 14px 16px; margin: 12px 0;">
  <strong style="color: #2563eb; display: flex; align-items: center; gap: 6px; margin-bottom: 4px; font-size: 0.95rem;">ℹ️ Información Importante</strong>
  <p style="margin: 0; font-size: 0.88rem; line-height: 1.5; color: #334155;">Recuerda incluir detalles claros como fechas, lugares y personas involucradas.</p>
</div><p></p>`,
                  );
                  setCuadroPopoverAbierto(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 p-2 text-left hover:bg-blue-500/10 transition-colors cursor-pointer"
              >
                <HelpCircle className="h-4 w-4 text-blue-600 shrink-0" />
                <div className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                  Cuadro Informativo / Guía (Azul)
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  insertarElementoHtml(
                    `<div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 10px; padding: 14px 16px; margin: 12px 0;">
  <strong style="color: #d97706; display: flex; align-items: center; gap: 6px; margin-bottom: 4px; font-size: 0.95rem;">⚠️ Advertencia</strong>
  <p style="margin: 0; font-size: 0.88rem; line-height: 1.5; color: #334155;">No compartas contraseñas ni datos bancarios personales.</p>
</div><p></p>`,
                  );
                  setCuadroPopoverAbierto(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2 text-left hover:bg-amber-500/10 transition-colors cursor-pointer"
              >
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                  Cuadro de Advertencia (Ámbar)
                </div>
              </button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Enlace */}
        <Popover open={linkPopoverAbierto} onOpenChange={setLinkPopoverAbierto}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-7 items-center gap-1 rounded-lg border border-border/70 bg-background px-2 text-xs font-medium text-foreground shadow-2xs hover:bg-muted transition-colors cursor-pointer"
              title="Insertar enlace web"
            >
              <Link2 className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">Enlace</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="start">
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-foreground">Insertar Enlace Web</p>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                  Texto a mostrar
                </label>
                <input
                  type="text"
                  placeholder="e.g. Código de Conducta"
                  value={linkTexto}
                  onChange={(e) => setLinkTexto(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                  Dirección URL
                </label>
                <input
                  type="url"
                  placeholder="https://ejemplo.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex justify-end gap-1.5 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setLinkPopoverAbierto(false)}
                  className="h-7 text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={insertarEnlace}
                  className="h-7 text-xs bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Insertar
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Botón de Limpiar */}
      <button
        type="button"
        onClick={onLimpiarTodo}
        className="flex h-7 items-center gap-1 rounded-lg border border-border/60 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
        title="Vaciar todo el mensaje"
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Vaciar</span>
      </button>
    </div>
  );
}
