import { useEffect, useMemo, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { toast } from "sonner";
import {
  Save,
  Building2,
  Calendar,
  User,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
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
  Layers,
  Trash2,
  Pilcrow,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  useActualizarMensajeDenunciaAdmin,
  useMensajeDenunciaAdmin,
  useNombreTenantPublico,
} from "@/features/buzon/hooks/useMensajeDenuncia";
import { useRutaTenant } from "@/shared/tenant/useRutaTenant";
import { getCurrentTenantId } from "@/shared/tenant/tenantStore";

const MAX_BYTES = 50 * 1024; // 50 KB

export interface PlantillaOption {
  id: string;
  nombre: string;
  descripcion: string;
  html: string;
}

const PLANTILLAS_PREDEFINIDAS: PlantillaOption[] = [
  {
    id: "confidencial-completa",
    nombre: "Canal Seguro y Confidencial (Recomendada)",
    descripcion: "Incluye aviso de privacidad, anonimato garantizado y lista de recomendaciones.",
    html: `<div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
  <strong style="color: #059669; font-size: 1.05rem; display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
    🔒 Canal de Denuncia 100% Anónimo y Seguro
  </strong>
  <p style="margin: 0; color: #334155; font-size: 0.92rem; line-height: 1.5;">
    Este espacio ha sido diseñado para reportar cualquier irregularidad o sospecha de fraude con total confidencialidad y sin temor a represalias.
  </p>
</div>
<h3 style="font-size: 1.05rem; font-weight: 700; color: #1e293b; margin: 16px 0 8px 0;">Recomendaciones para tu reporte:</h3>
<ul style="margin: 8px 0 16px 0; padding-left: 20px; color: #334155;">
  <li style="margin-bottom: 6px;">Describe los hechos con la mayor claridad y detalle posible.</li>
  <li style="margin-bottom: 6px;">Menciona fechas aproximadas, áreas y cargos o personas involucradas.</li>
  <li style="margin-bottom: 6px;">Guarda tu folio generado al finalizar para dar seguimiento anónimo.</li>
</ul>
<div style="background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 10px; padding: 12px 16px;">
  <strong style="color: #2563eb; font-size: 0.9rem;">ℹ️ Importante:</strong>
  <p style="margin: 4px 0 0 0; font-size: 0.88rem; color: #475569;">No proporciones contraseñas ni información bancaria personal.</p>
</div>`,
  },
  {
    id: "guia-paso-a-paso",
    nombre: "Guía de Denuncia",
    descripcion: "Estructura ordenada con instrucciones claras.",
    html: `<h2 style="font-size: 1.2rem; font-weight: 700; color: #0f172a; margin-bottom: 8px;">Instrucciones para presentar tu denuncia</h2>
<p style="color: #475569; margin-bottom: 12px; line-height: 1.5;">Tu participación es fundamental para mantener un ambiente íntegro y transparente.</p>
<ul style="margin: 12px 0 16px 0; padding-left: 20px; color: #334155;">
  <li style="margin-bottom: 8px;"><strong>Selecciona el tipo de denuncia:</strong> Elige la categoría que mejor corresponda al incidente.</li>
  <li style="margin-bottom: 8px;"><strong>Detalla la situación:</strong> Explica qué ocurrió de forma objetiva y concisa.</li>
  <li style="margin-bottom: 8px;"><strong>Adjunta evidencia:</strong> Si cuentas con documentos o fotos, puedes incluirlos de forma opcional.</li>
  <li style="margin-bottom: 8px;"><strong>Conserva tu código de seguimiento:</strong> Te permitirá consultar el avance de tu caso.</li>
</ul>`,
  },
  {
    id: "institucional-minima",
    nombre: "Aviso Institucional Breve",
    descripcion: "Mensaje conciso para cabeceras limpias.",
    html: `<div style="background: rgba(16, 185, 129, 0.08); border-left: 4px solid #059669; border-radius: 4px 8px 8px 4px; padding: 12px 16px; margin-bottom: 12px;">
  <strong style="color: #059669; font-size: 0.95rem;">Buzón Ético Institucional</strong>
  <p style="margin: 4px 0 0 0; font-size: 0.88rem; color: #334155; line-height: 1.5;">
    Toda información proporcionada es confidencial y atendida de forma imparcial y protegida.
  </p>
</div>`,
  },
];

export function PersonalizarCabeceraDenuncia() {
  const {
    data: mensajeData,
    isLoading: cargandoMensaje,
    isError: errorMensaje,
  } = useMensajeDenunciaAdmin();
  const { data: tenantPublico } = useNombreTenantPublico();
  const activeTenantId = getCurrentTenantId();
  const actualizarMutation = useActualizarMensajeDenunciaAdmin();
  const rutaTenant = useRutaTenant();

  const [htmlInput, setHtmlInput] = useState<string>("");

  const [colorPopoverAbierto, setColorPopoverAbierto] = useState(false);
  const [cuadroPopoverAbierto, setCuadroPopoverAbierto] = useState(false);
  const [encabezadoPopoverAbierto, setEncabezadoPopoverAbierto] = useState(false);
  const [plantillasPopoverAbierto, setPlantillasPopoverAbierto] = useState(false);
  const [linkPopoverAbierto, setLinkPopoverAbierto] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkTexto, setLinkTexto] = useState("");

  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingFromEditor = useRef(false);

  // Cargar contenido inicial cuando la consulta al servidor finalice
  useEffect(() => {
    if (mensajeData) {
      const contenido = mensajeData.contenidoHtml ?? mensajeData.html ?? "";
      setHtmlInput(contenido);
      if (editorRef.current && !isUpdatingFromEditor.current) {
        editorRef.current.innerHTML = contenido;
      }
    }
  }, [mensajeData]);

  // Cálculo de tamaño en bytes
  const bytesSize = useMemo(() => {
    return new Blob([htmlInput]).size;
  }, [htmlInput]);

  const esTamanoExcedido = bytesSize > MAX_BYTES;
  const porcentajeUso = Math.min(100, (bytesSize / MAX_BYTES) * 100);

  const syncEditorToState = () => {
    if (!editorRef.current) return;
    isUpdatingFromEditor.current = true;
    const nuevoContenido = editorRef.current.innerHTML;
    setHtmlInput(nuevoContenido);
    setTimeout(() => {
      isUpdatingFromEditor.current = false;
    }, 0);
  };

  // Comandos de formateo simplificados
  const ejecutarComando = (comando: string, valor: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(comando, false, valor);
    syncEditorToState();
  };

  const insertarElementoHtml = (htmlString: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const seleccion = window.getSelection();
    if (seleccion && seleccion.rangeCount > 0) {
      const range = seleccion.getRangeAt(0);
      range.deleteContents();
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = htmlString;
      const frag = document.createDocumentFragment();
      let node;
      let lastNode;
      while ((node = tempDiv.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);
      if (lastNode) {
        range.setStartAfter(lastNode);
        range.collapse(true);
        seleccion.removeAllRanges();
        seleccion.addRange(range);
      }
    } else if (editorRef.current) {
      editorRef.current.innerHTML += htmlString;
    }
    syncEditorToState();
  };

  const aplicarColorTexto = (colorHex: string) => {
    ejecutarComando("foreColor", colorHex);
    setColorPopoverAbierto(false);
  };

  const aplicarResaltado = (bgHex: string, textHex: string) => {
    const seleccion = window.getSelection();
    if (seleccion && seleccion.toString().trim()) {
      const texto = seleccion.toString();
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
    if (!linkUrl.trim() || linkUrl === "https://") {
      toast.error("Por favor ingresa una URL válida para el enlace.");
      return;
    }
    const texto = linkTexto.trim() || linkUrl;
    const enlaceHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="color: #059669; text-decoration: underline; font-weight: 500;">${texto}</a>&nbsp;`;
    insertarElementoHtml(enlaceHtml);
    setLinkPopoverAbierto(false);
    setLinkUrl("https://");
    setLinkTexto("");
  };

  const cargarPlantilla = (plantilla: PlantillaOption) => {
    setHtmlInput(plantilla.html);
    if (editorRef.current) {
      editorRef.current.innerHTML = plantilla.html;
    }
    setPlantillasPopoverAbierto(false);
    toast.success(`Plantilla "${plantilla.nombre}" cargada correctamente.`);
  };

  const limpiarTodoElContenido = () => {
    if (window.confirm("¿Deseas vaciar todo el contenido del mensaje?")) {
      setHtmlInput("");
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
      toast.info("Contenido vaciado.");
    }
  };

  const handleGuardar = async () => {
    if (esTamanoExcedido) {
      toast.error("El contenido excede el límite permitido de 50 KB.");
      return;
    }

    const limpio = DOMPurify.sanitize(htmlInput, {
      USE_PROFILES: { html: true },
      ADD_ATTR: ["target", "rel", "style", "class"],
    });

    try {
      await actualizarMutation.mutateAsync({
        input: { html: limpio },
      });
      toast.success("Cabecera de denuncia anónima actualizada correctamente.");
    } catch {
      toast.error("No se pudo guardar la cabecera. Intente nuevamente.");
    }
  };

  if (cargandoMensaje) {
    return (
      <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xs transition-colors">
      {/* Encabezado Principal */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div>
              <Label className="text-lg font-bold text-foreground">
                Personalizar cabecera de denuncia anónima
              </Label>
            </div>
          </div>
        </div>

        {/* Metadatos del tenant y enlace directo al buzón público */}
        <div className="flex flex-wrap items-center gap-2">
          {(activeTenantId || tenantPublico?.nombreComercial) && (
            <div className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
              <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="font-semibold text-foreground">
                {tenantPublico?.nombreComercial || activeTenantId}
              </span>
            </div>
          )}

          <a
            href={rutaTenant("buzon/denuncias")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
            title="Abrir buzón anónimo en una pestaña nueva"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Ver buzón público
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </a>
        </div>
      </div>

      {errorMensaje && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>No se pudo cargar la configuración actual de la cabecera.</span>
        </div>
      )}

      {/* Editor Visual Directo */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        {/* Barra de Herramientas Simplificada */}
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

            {/* Plantillas Rápidas */}
            <Popover open={plantillasPopoverAbierto} onOpenChange={setPlantillasPopoverAbierto}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex h-7 items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                  title="Cargar plantilla prediseñada"
                >
                  <Layers className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Plantillas</span>
                  <ChevronDown className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-76 p-2" align="start">
                <div className="space-y-1.5">
                  <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Plantillas Recomendadas
                  </p>
                  {PLANTILLAS_PREDEFINIDAS.map((plantilla) => (
                    <button
                      key={plantilla.id}
                      type="button"
                      onClick={() => cargarPlantilla(plantilla)}
                      className="flex w-full flex-col gap-0.5 rounded-lg border border-border/80 bg-muted/30 p-2 text-left hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-foreground">{plantilla.nombre}</div>
                      <div className="text-[11px] text-muted-foreground leading-tight">
                        {plantilla.descripcion}
                      </div>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Botón de Limpiar */}
          <button
            type="button"
            onClick={limpiarTodoElContenido}
            className="flex h-7 items-center gap-1 rounded-lg border border-border/60 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            title="Vaciar todo el mensaje"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Vaciar</span>
          </button>
        </div>

        {/* Lienzo de Edición Visual a Ancho Completo */}
        <div className="p-5 sm:p-6 bg-background min-h-[320px]">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={syncEditorToState}
            onBlur={syncEditorToState}
            data-placeholder="Haz clic aquí y escribe el mensaje que verán los usuarios..."
            className="min-h-[260px] outline-none text-foreground leading-relaxed font-sans text-sm empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60 empty:before:pointer-events-none prose prose-sm max-w-none dark:prose-invert [&_a]:text-emerald-600 [&_a]:underline hover:[&_a]:text-emerald-700 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
          />
        </div>

        {/* Barra de Estado inferior */}
        <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-2 text-xs">

          <div className="flex items-center gap-2">
            <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full ${
                  esTamanoExcedido
                    ? "bg-destructive"
                    : porcentajeUso > 80
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${porcentajeUso}%` }}
              />
            </div>
            <span
              className={`text-[11px] font-mono ${
                esTamanoExcedido
                  ? "font-bold text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {(bytesSize / 1024).toFixed(2)} KB / 50.00 KB
            </span>
          </div>
        </div>
      </div>

      {/* Pie de Acciones y Guardado */}
      <div className="flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {mensajeData?.actualizadoPor && (
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              Actualizado por: <strong className="text-foreground">{mensajeData.actualizadoPor}</strong>
            </span>
          )}
          {mensajeData?.actualizadoEn && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {new Date(mensajeData.actualizadoEn).toLocaleString("es-MX")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={handleGuardar}
            disabled={actualizarMutation.isPending || esTamanoExcedido}
            className="gap-1.5 bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            {actualizarMutation.isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </div>
    </div>
  );
}
