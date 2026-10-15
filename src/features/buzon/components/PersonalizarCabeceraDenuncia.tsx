import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { sanitizeRichHtml } from "@/shared/utils/sanitizeHtml";
import { isAppError } from "@/api/interceptors/errorInterceptor";
import {
  Save,
  Calendar,
  User,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/shared/components/atoms/Button";
import { Label } from "@/shared/components/atoms/Label";
import { Skeleton } from "@/shared/components/atoms/Skeleton";
import {
  useActualizarMensajeDenunciaAdmin,
  useMensajeDenunciaAdmin,
} from "@/features/buzon/hooks/useMensajeDenuncia";
import { useRutaTenant } from "@/shared/tenant/useRutaTenant";
import { CabeceraToolbar } from "./CabeceraToolbar";

const MAX_BYTES = 50 * 1024; // 50 KB

export interface PlantillaOption {
  id: string;
  nombre: string;
  descripcion: string;
  html: string;
}

export function PersonalizarCabeceraDenuncia() {
  const {
    data: mensajeData,
    isLoading: cargandoMensaje,
    isError: errorMensaje,
  } = useMensajeDenunciaAdmin();

  const actualizarMutation = useActualizarMensajeDenunciaAdmin();
  const rutaTenant = useRutaTenant();

  const [htmlInput, setHtmlInput] = useState<string>("");
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingFromEditor = useRef(false);

  // Cargar contenido inicial cuando la consulta al servidor finalice
  useEffect(() => {
    if (mensajeData) {
      // Nunca confiar en el HTML persistido: se sanitiza antes de tocar el DOM.
      const contenido = sanitizeRichHtml(mensajeData.contenidoHtml ?? mensajeData.html ?? "");
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
    try {
      document.execCommand("styleWithCSS", false, "true");
    } catch {
      // Ignorar si el navegador no lo soporta
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

    const limpio = sanitizeRichHtml(htmlInput);

    try {
      await actualizarMutation.mutateAsync({
        input: { html: limpio },
      });
      toast.success("Cabecera de denuncia anónima actualizada correctamente.");
    } catch (error: unknown) {
      const msg = isAppError(error)
        ? error.message
        : "No se pudo guardar la cabecera. Intente nuevamente.";
      toast.error(msg);
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
        <CabeceraToolbar
          ejecutarComando={ejecutarComando}
          insertarElementoHtml={insertarElementoHtml}
          onLimpiarTodo={limpiarTodoElContenido}
        />

        {/* Lienzo de Edición Visual a Ancho Completo */}
        <div className="p-5 sm:p-6 bg-background min-h-[320px]">
          <div
            ref={editorRef}
            contentEditable
            role="textbox"
            aria-label="Editor de cabecera de denuncia"
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
