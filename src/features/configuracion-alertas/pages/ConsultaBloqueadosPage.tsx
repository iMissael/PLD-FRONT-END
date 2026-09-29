import { useState } from "react";

import { BusquedaBloqueadosForm } from "../components/BusquedaBloqueadosForm";
import { ResultadosBloqueadosTable } from "../components/ResultadosBloqueadosTable";
import { useConsultaBloqueados } from "../hooks/useConsultaBloqueados";
import type { ConsultaBloqueadosParams } from "../types/personaBloqueada";

export function ConsultaBloqueadosPage() {
  // Los filtros solo se actualizan al enviar el formulario, no en cada
  // tecla: así el query de TanStack Query solo se dispara al buscar.
  const [filtros, setFiltros] = useState<ConsultaBloqueadosParams | null>(null);

  const { data, isLoading, isError, error, isFetching } = useConsultaBloqueados(
    filtros ?? {},
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold">Consulta de bloqueados</h2>
        <p className="text-muted-foreground text-sm">
          Busca coincidencias exactas o difusas por nombre, RFC, CURP o fecha de
          nacimiento.
        </p>
      </div>

      <BusquedaBloqueadosForm onBuscar={setFiltros} isPending={isFetching} />

      <ResultadosBloqueadosTable
        resultados={data}
        isLoading={isLoading}
        isError={isError}
        error={error}
        sinBusqueda={filtros === null}
      />
    </div>
  );
}
