import { useRef, useState } from "react";
import { toast } from "sonner";
import { escapeHtml, urlSegura } from "@/shared/utils/sanitizeHtml";
import {
  Bold,
  Italic,
  List,
  Palette,
  Square,
  Link2,
  ChevronDown,
  Shield,
  HelpCircle,
  AlertTriangle, 
  Trash2,
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
  const [colorPopoverAbierto, setColorPopoverAbierto] = useState(false);
  const [cuadroPopoverAbierto, setCuadroPopoverAbierto] = useState(false);
  const [linkPopoverAbierto, setLinkPopoverAbierto] = useState(false);
  const [linkTexto, setLinkTexto] = useState("");
  const [linkUrl, setLinkUrl] = useState("https://");

  // Almacenar selección activa para cuando se abran popovers
  const savedSelectionRange = useRef<Range | null>(null);

  const guardarSeleccionActual = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRange.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restaurarSeleccion = () => {
    if (savedSelectionRange.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRange.current);
      }
    }
  };

  const aplicarColorTexto = (hexColor: string) => {
    restaurarSeleccion();
    ejecutarComando("foreColor", hexColor);
    setColorPopoverAbierto(false);
  };

  const aplicarResaltado = (bgHex: string, textHex: string) => {
    restaurarSeleccion();
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
    restaurarSeleccion();
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
    <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-border bg-muted/30 px-3 py-1.5">
      <div className="flex flex-wrap items-center gap-1">
        

        {/* Formato de texto: Negrita, Cursiva, Subrayado */}
        <div className="flex items-center rounded-md border border-border/60 bg-background/80 p-0.5">
          <button
            type="button"
            onClick={() => ejecutarComando("bold")}
            className="flex h-6 w-6 items-center justify-center rounded font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Negrita"
          >
            <Bold className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => ejecutarComando("italic")}
            className="flex h-6 w-6 items-center justify-center rounded italic text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Cursiva"
          >
            <Italic className="h-3 w-3" />
          </button>
    
        </div>

        {/* Encabezados Rápidos */}
 

        {/* Viñetas */}
        <div className="flex items-center rounded-md border border-border/60 bg-background/80 p-0.5">
          <button
            type="button"
            onClick={() => ejecutarComando("insertUnorderedList")}
            className="flex h-6 w-6 items-center justify-center rounded text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Lista con viñetas"
          >
            <List className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          </button>
        </div>

        {/* Colores y Resaltado */}
        <Popover
          open={colorPopoverAbierto}
          onOpenChange={(abierto) => {
            if (abierto) guardarSeleccionActual();
            setColorPopoverAbierto(abierto);
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-6 items-center gap-1 rounded-md border border-border/60 bg-background/80 px-2 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Color de texto o resaltado"
            >
              <Palette className="h-3 w-3 text-amber-500" />
              <span className="text-[11px]">Color</span>
              <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2.5 shadow-md" align="start">
            <div className="space-y-2">
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Color de Texto
                </p>
                <div className="grid grid-cols-4 gap-1">
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
                      className="flex h-6 items-center justify-center rounded border border-border/80 hover:scale-105 transition-all cursor-pointer"
                      title={item.nombre}
                    >
                      <span className={`h-3 w-3 rounded-full ${item.bg}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-border/40 pt-1.5">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Resaltado
                </p>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => aplicarResaltado("#fef08a", "#1e293b")}
                    className="rounded bg-yellow-100 px-2 py-1 text-[11px] font-medium text-yellow-900 text-center hover:brightness-95 transition-all cursor-pointer"
                  >
                    Amarillo
                  </button>
                  <button
                    type="button"
                    onClick={() => aplicarResaltado("#d1fae5", "#065f46")}
                    className="rounded bg-emerald-100 px-2 py-1 text-[11px] font-medium text-emerald-900 text-center hover:brightness-95 transition-all cursor-pointer"
                  >
                    Verde
                  </button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Cuadros Informativos */}
        <Popover
          open={cuadroPopoverAbierto}
          onOpenChange={(abierto) => {
            if (abierto) guardarSeleccionActual();
            setCuadroPopoverAbierto(abierto);
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-6 items-center gap-1 rounded-md border border-border/60 bg-background/80 px-2 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Insertar tarjeta de información"
            >
              <Square className="h-3 w-3 text-emerald-500" />
              <span className="text-[11px]">Tarjeta</span>
              <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-1.5 shadow-md" align="start">
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  restaurarSeleccion();
                  insertarElementoHtml(
                    `<div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 8px; padding: 12px 14px; margin: 10px 0;">
  <strong style="color: #059669; display: flex; align-items: center; gap: 6px; font-size: 0.9rem;">🔒 Canal Seguro y Confidencial</strong>
  <p style="margin: 4px 0 0 0; font-size: 0.85rem; line-height: 1.4; color: #334155;">Tus denuncias son tratadas con estricta confidencialidad y sin represalias.</p>
</div><p></p>`,
                  );
                  setCuadroPopoverAbierto(false);
                }}
                className="flex w-full items-center gap-2 rounded-md p-1.5 text-left hover:bg-muted transition-colors cursor-pointer"
              >
                <Shield className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="text-xs font-medium text-foreground">Canal Confidencial</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  restaurarSeleccion();
                  insertarElementoHtml(
                    `<div style="background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.35); border-radius: 8px; padding: 12px 14px; margin: 10px 0;">
  <strong style="color: #2563eb; display: flex; align-items: center; gap: 6px; font-size: 0.9rem;">ℹ️ Guía Importante</strong>
  <p style="margin: 4px 0 0 0; font-size: 0.85rem; line-height: 1.4; color: #334155;">Incluye detalles precisos: fechas, lugares y circunstancias observables.</p>
</div><p></p>`,
                  );
                  setCuadroPopoverAbierto(false);
                }}
                className="flex w-full items-center gap-2 rounded-md p-1.5 text-left hover:bg-muted transition-colors cursor-pointer"
              >
                <HelpCircle className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span className="text-xs font-medium text-foreground">Guía Informativa</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  restaurarSeleccion();
                  insertarElementoHtml(
                    `<div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 8px; padding: 12px 14px; margin: 10px 0;">
  <strong style="color: #d97706; display: flex; align-items: center; gap: 6px; font-size: 0.9rem;">⚠️ Advertencia</strong>
  <p style="margin: 4px 0 0 0; font-size: 0.85rem; line-height: 1.4; color: #334155;">No compartas contraseñas ni datos bancarios personales.</p>
</div><p></p>`,
                  );
                  setCuadroPopoverAbierto(false);
                }}
                className="flex w-full items-center gap-2 rounded-md p-1.5 text-left hover:bg-muted transition-colors cursor-pointer"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span className="text-xs font-medium text-foreground">Advertencia</span>
              </button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Enlace */}
        <Popover
          open={linkPopoverAbierto}
          onOpenChange={(abierto) => {
            if (abierto) guardarSeleccionActual();
            setLinkPopoverAbierto(abierto);
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-6 items-center gap-1 rounded-md border border-border/60 bg-background/80 px-2 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Insertar enlace web"
            >
              <Link2 className="h-3 w-3 text-primary" />
              <span className="text-[11px] hidden sm:inline">Enlace</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2.5 shadow-md" align="start">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">Insertar Enlace</p>
              <input
                type="text"
                placeholder="Texto a mostrar (opcional)"
                value={linkTexto}
                onChange={(e) => setLinkTexto(e.target.value)}
                className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                type="url"
                placeholder="https://ejemplo.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="flex justify-end gap-1 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setLinkPopoverAbierto(false)}
                  className="h-6 px-2 text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={insertarEnlace}
                  className="h-6 px-2 text-xs bg-emerald-600 text-white hover:bg-emerald-700"
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
        className="flex h-6 items-center gap-1 rounded border border-border/50 px-1.5 text-[11px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
        title="Vaciar contenido"
      >
        <Trash2 className="h-3 w-3" />
        <span className="hidden sm:inline">Vaciar</span>
      </button>
    </div>
  );
}
