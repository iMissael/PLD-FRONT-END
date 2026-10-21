import { useState } from "react";
import { Search } from "lucide-react";

import { BuscadorAcreditados } from "@/features/operacion/evaluacion-riesgo/components/BuscadorAcreditados";
import type { AcreditadoExterno } from "@/features/acreditados/types/acreditados";
import { Button } from "@/shared/components/atoms/Button";
import { Input } from "@/shared/components/atoms/Input";
import { FormFieldGroup } from "@/shared/components/molecules/FormFieldGroup";

export interface FiltroAlertasSeguimiento {
  persona?: string;
  desde?: string;
  hasta?: string;
}

interface FiltrosAlertasSeguimientoProps {
  onConsultar: (filtro: FiltroAlertasSeguimiento) => void;
  onLimpiar: () => void;
}

/** "Operación › Revisión de alertas de seguimiento": cliente + rango de fechas. */
export function FiltrosAlertasSeguimiento({
  onConsultar,
  onLimpiar,
}: FiltrosAlertasSeguimientoProps) {
  const [cliente, setCliente] = useState<AcreditadoExterno | null>(null);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  function limpiar() {
    setCliente(null);
    setDesde("");
    setHasta("");
    onLimpiar();
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onConsultar({ persona: cliente?.nombre || undefined, desde: desde || undefined, hasta: hasta || undefined });
      }}
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm"
    >
      <FormFieldGroup label="Cliente" htmlFor="cliente-seguimiento">
        <BuscadorAcreditados
          variante="panel"
          valor={cliente ? `${cliente.id ?? ""} ${cliente.nombre ?? ""}`.trim() : ""}
          placeholder="Referencia, número de cliente o nombre"
          onSeleccionar={setCliente}
        />
      </FormFieldGroup>

      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[160px] flex-1">
          <FormFieldGroup label="Fecha inicial" htmlFor="desde-seguimiento">
            <Input
              id="desde-seguimiento"
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
            />
          </FormFieldGroup>
        </div>
        <div className="min-w-[160px] flex-1">
          <FormFieldGroup label="Fecha final" htmlFor="hasta-seguimiento">
            <Input
              id="hasta-seguimiento"
              type="date"
              min={desde || undefined}
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
            />
          </FormFieldGroup>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button type="submit" variant="default" className="gap-2">
            <Search className="h-4 w-4" />
            Consultar
          </Button>
          <Button type="button" variant="outline" onClick={limpiar}>
            Limpiar
          </Button>
        </div>
      </div>
    </form>
  );
}
