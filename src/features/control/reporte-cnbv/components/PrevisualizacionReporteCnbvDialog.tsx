import { Download } from "lucide-react";
import { toast } from "sonner";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Button } from "@/shared/components/atoms/Button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/organisms/Dialog";
import { emptyState } from "@/shared/styles/tokens";

import { descargarArchivoReporteCnbv } from "../api/reporteCnbvApi";
import { usePrevisualizacionReporteCnbv } from "../hooks/useReporteCnbv";

interface PrevisualizacionReporteCnbvDialogProps {
  alertaId: number | null;
  onOpenChange: (abierto: boolean) => void;
}

/** Descarga el blob con el nombre que mandó el backend, sin abrir pestaña nueva. */
function descargarBlob(nombreArchivo: string, contenido: Blob) {
  const url = URL.createObjectURL(contenido);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/**
 * "Previsualización de información de reporte CNBV" (pantalla homónima de Sicanet): las 36 columnas
 * del layout oficial (Resolución DOF 30/05/2016) de una alerta Inusual o Interna Preocupante, en una
 * sola tabla que se desplaza horizontalmente, con el botón para generar y descargar el archivo.
 */
export function PrevisualizacionReporteCnbvDialog({
  alertaId,
  onOpenChange,
}: PrevisualizacionReporteCnbvDialogProps) {
  const { data: columnas, isLoading, isError } = usePrevisualizacionReporteCnbv(alertaId);

  async function handleDescargar() {
    if (alertaId === null) return;
    try {
      const { nombreArchivo, contenido } = await descargarArchivoReporteCnbv(alertaId);
      descargarBlob(nombreArchivo, contenido);
      toast.success(`Archivo ${nombreArchivo} generado.`);
    } catch (error) {
      toast.error(isAppError(error) ? error.message : "No se pudo generar el archivo del reporte.");
    }
  }

  return (
    <Dialog open={alertaId !== null} onOpenChange={onOpenChange}>
      <DialogContent className="w-[80vw] max-w-[80vw] sm:max-w-[80vw]">
        <DialogHeader>
          <DialogTitle>Previsualización de información de reporte CNBV</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          {isLoading ? (
            <p className={emptyState}>Cargando…</p>
          ) : isError ? (
            <p className={emptyState}>No se pudo cargar la previsualización.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    {(columnas ?? []).map((c) => (
                      <th
                        key={c.numero}
                        className="bg-primary text-primary-foreground border-border/60 min-w-[120px] border-r px-3 py-2 text-left text-xs font-semibold whitespace-nowrap last:border-r-0"
                      >
                        {c.etiqueta.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {(columnas ?? []).map((c) => (
                      <td
                        key={c.numero}
                        className="border-border/60 max-w-[420px] min-w-[140px] truncate border-r px-3 py-2 text-xs whitespace-nowrap last:border-r-0"
                        title={c.valor}
                      >
                        {c.valor || "—"}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          <div className="flex justify-center">
            <Button
              type="button"
              aria-label="Generar y descargar archivo"
              title="Generar y descargar archivo"
              disabled={isLoading || isError}
              onClick={handleDescargar}
              className="size-11 rounded-full p-0"
            >
              <Download className="size-5" />
            </Button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
