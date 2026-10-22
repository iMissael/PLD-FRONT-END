import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useListaAlertas } from "@/features/alertas/hooks/useAlertas";
import {
  ETIQUETA_ESTATUS,
  estatusDe,
  type Alerta,
  type FiltroAlertas,
} from "@/features/alertas/types/alertas";
import { Alert } from "@/shared/components/molecules/Alert";
import { Button } from "@/shared/components/atoms/Button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/organisms/Dialog";

import { AlertasTable } from "../components/AlertasTable";
import { DetalleAlerta } from "../components/DetalleAlerta";
import { FiltrosAlertas } from "../components/FiltrosAlertas";

function escribiendo(objetivo: EventTarget | null): boolean {
  return (
    objetivo instanceof HTMLElement &&
    (objetivo.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(objetivo.tagName))
  );
}

export function RevisionAlertasPage() {
  const [filtro, setFiltro] = useState<FiltroAlertas>({});
  const [seleccionada, setSeleccionada] = useState<Alerta | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [pagina, setPagina] = useState(0);
  const [tamanio, setTamanio] = useState(20);
  const { data, isLoading } = useListaAlertas(filtro, pagina, tamanio);
  const recuadro = useRef<HTMLElement | null>(null);

  const alertas = data?.contenido ?? [];
  const indice = seleccionada ? alertas.findIndex((a) => a.id === seleccionada.id) : -1;
  const hayAnterior = indice > 0;
  const haySiguiente = indice >= 0 && indice < alertas.length - 1;

  const seleccionar = (alerta: Alerta | null) => {
    setSeleccionada(alerta);
    setAviso(null);
  };

  const irA = (desplazamiento: number) => {
    const destino = alertas[indice + desplazamiento];
    if (!destino) return;
    seleccionar(destino);
    recuadro.current?.focus();
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold">Revisión de alertas</h2>
        <p className="text-muted-foreground text-sm">
          Alertas manuales y automáticas (generadas por movimientos de cajas) para
          confirmar o rechazar.
        </p>
      </div>

      <FiltrosAlertas
        inicial={filtro}
        onAplicar={(nuevo) => {
          setFiltro(nuevo);
          setPagina(0);
          seleccionar(null);
        }}
      />

      <AlertasTable
        alertas={data?.contenido}
        isLoading={isLoading}
        seleccionadaId={seleccionada?.id ?? null}
        onSeleccionar={seleccionar}
        pagina={pagina}
        tamanio={tamanio}
        totalElementos={data?.totalElementos ?? 0}
        onCambiarPagina={setPagina}
        onCambiarTamanio={(nuevo) => {
          setTamanio(nuevo);
          setPagina(0);
        }}
      />

      <Dialog
        open={seleccionada !== null}
        onOpenChange={(abierto) => {
          if (!abierto) seleccionar(null);
        }}
      >
        {seleccionada ? (
          <DialogContent
            className="sm:max-w-6xl"
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              recuadro.current = e.target as HTMLElement;
              recuadro.current.focus();
            }}
            onKeyDown={(e) => {
              if (escribiendo(e.target)) return;
              if (e.key === "ArrowLeft" && hayAnterior) irA(-1);
              if (e.key === "ArrowRight" && haySiguiente) irA(1);
            }}
          >
            <DialogHeader>
              <DialogTitle>
                Alerta {seleccionada.folio} · {seleccionada.tipoAlertaDescripcion}
              </DialogTitle>
              <DialogDescription>
                {seleccionada.origen === "AUTOMATICA"
                  ? "Generada por cajas"
                  : "Captura manual"}{" "}
                · {ETIQUETA_ESTATUS[estatusDe(seleccionada)]}
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="flex flex-col gap-4">
              {aviso ? <Alert tono="exito">{aviso}</Alert> : null}
              <DetalleAlerta
                key={seleccionada.id}
                alerta={seleccionada}
                onCancelada={() => seleccionar(null)}
                onActualizada={(alerta) => {
                  setSeleccionada(alerta);
                  setAviso(
                    `La alerta ${alerta.folio} quedó ${ETIQUETA_ESTATUS[estatusDe(alerta)].toLowerCase()}.`,
                  );
                }}
              />
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="gap-1 rounded-full"
                disabled={!hayAnterior}
                onClick={() => irA(-1)}
              >
                <ChevronLeft className="size-4" />
                Anterior
              </Button>
              <span className="text-muted-foreground text-xs">
                {indice >= 0 ? `${indice + 1} de ${alertas.length} en esta página` : ""}
              </span>
              <Button
                type="button"
                variant="outline"
                className="gap-1 rounded-full"
                disabled={!haySiguiente}
                onClick={() => irA(1)}
              >
                Siguiente
                <ChevronRight className="size-4" />
              </Button>
            </DialogFooter>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}
