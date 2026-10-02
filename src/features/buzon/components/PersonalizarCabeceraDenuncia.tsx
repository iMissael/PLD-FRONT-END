import { useEffect, useMemo, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { toast } from "sonner";
import {
  Code,
  Eye,
  Save,
  Info,
  Building2,
  Calendar,
  User,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
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
  const [tabActiva, setTabActiva] = useState<"editor" | "split" | "preview">("split");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cargar contenido inicial cuando la consulta al servidor finalice
  useEffect(() => {
    if (mensajeData) {
      const contenido = mensajeData.contenidoHtml ?? mensajeData.html ?? "";
      setHtmlInput(contenido);
    }
  }, [mensajeData]);

  // Cálculo de tamaño en bytes
  const bytesSize = useMemo(() => {
    return new Blob([htmlInput]).size;
  }, [htmlInput]);

  const esTamanoExcedido = bytesSize > MAX_BYTES;
  const porcentajeUso = Math.min(100, (bytesSize / MAX_BYTES) * 100);

  // Sanitización en tiempo real para previsualización (defensa en profundidad)
  const cleanHtmlPreview = useMemo(() => {
    if (!htmlInput.trim()) return "";
    return DOMPurify.sanitize(htmlInput, {
      USE_PROFILES: { html: true },
      ADD_ATTR: ["target", "rel", "style", "class"],
    });
  }, [htmlInput]);

  const insertarEtiqueta = (apertura: string, cierre: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textoSeleccionado = htmlInput.substring(start, end);
    const nuevoTexto =
      htmlInput.substring(0, start) +
      apertura +
      textoSeleccionado +
      cierre +
      htmlInput.substring(end);

    setHtmlInput(nuevoTexto);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + apertura.length,
        start + apertura.length + textoSeleccionado.length,
      );
    }, 0);
  };

  const handleGuardar = async () => {
    if (esTamanoExcedido) {
      toast.error("El contenido excede el límite permitido de 50 KB.");
      return;
    }

    try {
      await actualizarMutation.mutateAsync({
        input: { html: htmlInput },
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
      {/* Encabezado y etiqueta principal */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Code className="h-4.5 w-4.5" />
            </span>
            <div>
              <Label
                htmlFor="html-denuncia-input"
                className="text-lg font-bold text-foreground"
              >
                Personalizar cabecera de denuncia anónima
              </Label>
              <p className="text-xs text-muted-foreground">
                Configura el mensaje informativo, avisos de privacidad o instrucciones HTML
                que se renderizarán en el buzón público.
              </p>
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
              {tenantPublico?.nombreComercial && activeTenantId && (
                <span>({activeTenantId})</span>
              )}
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

      {/* Barra de herramientas y Selector de Vista */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        {/* Herramientas de inserción rápida de tags HTML */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="mr-1 font-medium text-muted-foreground">Insertar:</span>
          <button
            type="button"
            onClick={() => insertarEtiqueta("<p>", "</p>")}
            className="rounded border border-border bg-muted/60 px-2 py-1 font-mono text-[11px] hover:bg-muted transition-colors"
            title="Párrafo <p>"
          >
            &lt;p&gt;
          </button>
          <button
            type="button"
            onClick={() => insertarEtiqueta("<strong>", "</strong>")}
            className="rounded border border-border bg-muted/60 px-2 py-1 font-mono text-[11px] hover:bg-muted transition-colors"
            title="Negrita <strong>"
          >
            &lt;strong&gt;
          </button>
          <button
            type="button"
            onClick={() => insertarEtiqueta("<em>", "</em>")}
            className="rounded border border-border bg-muted/60 px-2 py-1 font-mono text-[11px] hover:bg-muted transition-colors"
            title="Cursiva <em>"
          >
            &lt;em&gt;
          </button>
          <button
            type="button"
            onClick={() => insertarEtiqueta("<h3>", "</h3>")}
            className="rounded border border-border bg-muted/60 px-2 py-1 font-mono text-[11px] hover:bg-muted transition-colors"
            title="Encabezado <h3>"
          >
            &lt;h3&gt;
          </button>
          <button
            type="button"
            onClick={() => insertarEtiqueta("<ul>\n  <li>", "</li>\n</ul>")}
            className="rounded border border-border bg-muted/60 px-2 py-1 font-mono text-[11px] hover:bg-muted transition-colors"
            title="Lista con viñetas <ul><li>"
          >
            &lt;ul&gt;&lt;li&gt;
          </button>
          <button
            type="button"
            onClick={() =>
              insertarEtiqueta(
                '<a href="https://" target="_blank" rel="noopener noreferrer">',
                "</a>",
              )
            }
            className="rounded border border-border bg-muted/60 px-2 py-1 font-mono text-[11px] hover:bg-muted transition-colors"
            title="Enlace <a>"
          >
            &lt;a&gt;
          </button>
          <button
            type="button"
            onClick={() =>
              insertarEtiqueta(
                '<div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px; padding: 12px;">\n  ',
                "\n</div>",
              )
            }
            className="rounded border border-border bg-muted/60 px-2 py-1 font-mono text-[11px] hover:bg-muted transition-colors"
            title="Caja decorada <div>"
          >
            &lt;div card&gt;
          </button>

 
        </div>

        {/* Botones de alternancia de vista */}
        <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
          <button
            type="button"
            onClick={() => setTabActiva("editor")}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              tabActiva === "editor"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            Editor
          </button>
          <button
            type="button"
            onClick={() => setTabActiva("split")}
            className={`hidden sm:flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              tabActiva === "split"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Dividida
          </button>
          <button
            type="button"
            onClick={() => setTabActiva("preview")}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              tabActiva === "preview"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Previsualizar
          </button>
        </div>
      </div>


      {/* Área del Editor y Previsualizador */}
      <div
        className={`grid gap-4 ${
          tabActiva === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {/* Editor de Código HTML */}
        {(tabActiva === "editor" || tabActiva === "split") && (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Código HTML (Crudo)
              </span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-muted rounded-full h-1.5 overflow-hidden">
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
            <textarea
              id="html-denuncia-input"
              ref={textareaRef}
              rows={14}
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              placeholder="Introduce aquí el contenido HTML personalizado (e.g. <div>...</div>)..."
              className={`w-full rounded-xl border bg-background p-3.5 font-mono text-xs leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 ${
                esTamanoExcedido
                  ? "border-destructive focus:ring-destructive"
                  : "border-border focus:ring-ring"
              }`}
            />
          </div>
        )}

        {/* Componente de Previsualización */}
        {(tabActiva === "preview" || tabActiva === "split") && (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <Eye className="h-3.5 w-3.5 text-emerald-500" />
                Previsualización en vivo (Sanitizada)
              </span>
              <span className="text-[11px] text-muted-foreground">
                Como se visualizará en el Buzón Público
              </span>
            </div>

            <div className="min-h-[280px] rounded-xl border border-dashed border-border bg-muted/20 p-5 transition-colors">
              {cleanHtmlPreview ? (
                <div
                  className="prose prose-sm max-w-none text-foreground leading-relaxed dark:prose-invert [&_a]:text-primary [&_a]:underline hover:[&_a]:text-primary-hover [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold"
                  dangerouslySetInnerHTML={{ __html: cleanHtmlPreview }}
                />
              ) : (
                <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-center text-xs text-muted-foreground">
                  <Info className="mb-2 h-7 w-7 text-muted-foreground/60" />
                  <p className="font-semibold text-foreground">Sin contenido para previsualizar</p>
                  <p className="mt-1 max-w-xs text-[11px] text-muted-foreground">
                    Escribe código HTML en el editor o selecciona una plantilla para observar el resultado en tiempo real.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pie de acciones y metadatos de actualización */}
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
            className="gap-1.5 bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            <Save className="h-3.5 w-3.5" />
            {actualizarMutation.isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </div>
    </div>
  );
}
