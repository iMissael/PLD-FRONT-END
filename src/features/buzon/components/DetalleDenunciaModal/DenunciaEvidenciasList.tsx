import { useState } from "react";
import { EyeIcon, PaperclipIcon } from "@/shared/components/atoms/icons";
import { verEvidenciaPorId } from "../../hooks/useDenuncias";
import type { EvidenciaDenuncia } from "../../types/buzon";

interface DenunciaEvidenciasListProps {
  evidencias: EvidenciaDenuncia[];
  onError: (msg: string) => void;
}

export function DenunciaEvidenciasList({ evidencias, onError }: DenunciaEvidenciasListProps) {
  const [openingEvidenciaId, setOpeningEvidenciaId] = useState<number | null>(null);

  const handleVerEvidencia = async (evidenciaId: number, nombre?: string) => {
    setOpeningEvidenciaId(evidenciaId);
    try {
      const blob = await verEvidenciaPorId(evidenciaId);
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch {
      onError(
        `No se pudo abrir la evidencia ${nombre || `#${evidenciaId}`}. Verifica que el archivo exista en el servidor.`,
      );
    } finally {
      setOpeningEvidenciaId(null);
    }
  };

  return (
    <div>
      <span className="text-muted-foreground font-semibold block mb-1.5 text-xs">
        Evidencias Adjuntas
      </span>
      {evidencias && evidencias.length > 0 ? (
        <ul className="space-y-1.5">
          {evidencias.map((ev) => (
            <li
              key={ev.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-2.5 transition-colors hover:border-primary/50 hover:bg-muted/40"
            >
              <div className="flex items-center gap-2 truncate mr-2">
                <PaperclipIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="font-medium truncate text-foreground text-xs" title={ev.nombre}>
                  {ev.nombre || `Evidencia #${ev.id}`}
                </span>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  ({ev.tipoArchivo || "Archivo"})
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleVerEvidencia(ev.id, ev.nombre)}
                disabled={openingEvidenciaId === ev.id}
                className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground hover:bg-secondary-hover disabled:opacity-50 shrink-0 focus-visible:outline-none cursor-pointer"
                title="Ver evidencia en nueva pestaña"
              >
                {openingEvidenciaId === ev.id ? (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <EyeIcon className="h-3.5 w-3.5" />
                )}
                <span>{openingEvidenciaId === ev.id ? "Cargando..." : "Ver archivo"}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground italic text-xs">
          Sin evidencias adjuntas en el expediente.
        </p>
      )}
    </div>
  );
}
