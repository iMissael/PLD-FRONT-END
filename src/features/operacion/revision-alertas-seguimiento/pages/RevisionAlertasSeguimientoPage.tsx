import { useState } from "react";

import { useListaAlertas } from "@/features/alertas/hooks/useAlertas";
import type { Alerta, FiltroAlertas } from "@/features/alertas/types/alertas";
import { DashboardListaTemplate } from "@/shared/components/templates";

import { AlertasSeguimientoTable } from "../components/AlertasSeguimientoTable";
import { DetalleAlertaSeguimiento } from "../components/DetalleAlertaSeguimiento";
import {
  FiltrosAlertasSeguimiento,
  type FiltroAlertasSeguimiento,
} from "../components/FiltrosAlertasSeguimiento";

const TIPO_SEGUIMIENTO = "S";

/**
 * "Operación › Revisión de alertas de seguimiento" (pantalla homónima de Sicanet): alertas que
 * solo genera el sistema (cambio de grado de riesgo, ocupación, profesión, actividad, giro del
 * negocio u objeto social de un socio). Hoy no hay nada que las genere todavía, así que la
 * consulta regresa vacío; la pantalla ya queda lista para cuando exista esa detección.
 */
export function RevisionAlertasSeguimientoPage() {
  const [filtro, setFiltro] = useState<FiltroAlertas | null>(null);
  const [seleccionada, setSeleccionada] = useState<Alerta | null>(null);
  const [pagina, setPagina] = useState(0);
  const [tamanio, setTamanio] = useState(20);
  const { data, isLoading } = useListaAlertas(
    filtro ?? { alertaAcronimo: TIPO_SEGUIMIENTO },
    pagina,
    tamanio,
    filtro !== null,
  );

  function consultar(nuevo: FiltroAlertasSeguimiento) {
    setFiltro({ alertaAcronimo: TIPO_SEGUIMIENTO, ...nuevo });
    setPagina(0);
    setSeleccionada(null);
  }

  function limpiar() {
    setFiltro(null);
    setSeleccionada(null);
  }

  return (
    <DashboardListaTemplate
      titulo="Revisión de alertas de seguimiento"
      descripcion="Alertas generadas por el sistema cuando cambia el perfil de riesgo de un socio."
    >
      <FiltrosAlertasSeguimiento onConsultar={consultar} onLimpiar={limpiar} />

      <AlertasSeguimientoTable
        consultado={filtro !== null}
        alertas={data?.contenido}
        isLoading={isLoading}
        seleccionadaId={seleccionada?.id ?? null}
        onSeleccionar={setSeleccionada}
        pagina={pagina}
        tamanio={tamanio}
        totalElementos={data?.totalElementos ?? 0}
        onCambiarPagina={setPagina}
        onCambiarTamanio={(nuevo) => {
          setTamanio(nuevo);
          setPagina(0);
        }}
      />

      {seleccionada ? <DetalleAlertaSeguimiento alerta={seleccionada} /> : null}
    </DashboardListaTemplate>
  );
}
