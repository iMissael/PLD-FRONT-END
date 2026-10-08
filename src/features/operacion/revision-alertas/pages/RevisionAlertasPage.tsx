import { useState } from "react";

import { useListaAlertas } from "@/features/alertas/hooks/useAlertas";
import type { Alerta, FiltroAlertas } from "@/features/alertas/types/alertas";
import { Alert } from "@/shared/components/ui/Alert";

import { AlertasTable } from "../components/AlertasTable";
import { DetalleAlerta } from "../components/DetalleAlerta";
import { FiltrosAlertas } from "../components/FiltrosAlertas";
import { rangoPorDefecto } from "../utils/formato";

/**
 * "Operación › Revisión de alertas" (manual Sicanet 4.3.5): manuales y las que
 * generan los movimientos de cajas. Arranca con todos los estatus del último mes:
 * las manuales nacen CONFIRMADAS y con un filtro de pendientes no se verían. Solo
 * las PENDIENTES se dictaminan.
 */
export function RevisionAlertasPage() {
  const [filtro, setFiltro] = useState<FiltroAlertas>(rangoPorDefecto);
  const [seleccionada, setSeleccionada] = useState<Alerta | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [pagina, setPagina] = useState(0);
  const [tamanio, setTamanio] = useState(20);
  const { data, isLoading } = useListaAlertas(filtro, pagina, tamanio);

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
          setSeleccionada(null);
          setAviso(null);
        }}
      />

      {aviso ? <Alert tono="exito">{aviso}</Alert> : null}

      <div className="flex flex-col gap-6">
        <AlertasTable
          alertas={data?.contenido}
          isLoading={isLoading}
          seleccionadaId={seleccionada?.id ?? null}
          onSeleccionar={(alerta) => {
            setSeleccionada(alerta);
            setAviso(null);
          }}
          pagina={pagina}
          tamanio={tamanio}
          totalElementos={data?.totalElementos ?? 0}
          onCambiarPagina={setPagina}
          onCambiarTamanio={(nuevo) => {
            setTamanio(nuevo);
            setPagina(0);
          }}
        />
        {seleccionada ? (
          <DetalleAlerta
            alerta={seleccionada}
            onDictaminada={(alerta) => {
              setSeleccionada(alerta);
              setAviso(
                `La alerta ${alerta.folio} quedó ${alerta.estatus.toLowerCase()}.`,
              );
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
