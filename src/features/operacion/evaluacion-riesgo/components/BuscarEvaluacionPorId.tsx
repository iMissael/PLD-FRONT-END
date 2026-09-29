import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useEvaluacionPorId } from "@/features/operacion/evaluacion-riesgo/hooks/useEvaluacionRiesgo";
import { ResultadoEvaluacion } from "@/features/operacion/evaluacion-riesgo/components/ResultadoEvaluacion";

export function BuscarEvaluacionPorId() {
  const [texto, setTexto] = useState("");
  const [idBuscado, setIdBuscado] = useState<number | null>(null);
  const { data: resultado, isFetching, isError } = useEvaluacionPorId(idBuscado);

  function buscar() {
    const numero = Number(texto);
    setIdBuscado(Number.isNaN(numero) || texto.trim() === "" ? null : numero);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <div className="w-48 space-y-1">
          <span className="text-sm font-medium">ID de evaluación</span>
          <Input
            type="number"
            placeholder="1052"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
        </div>
        <Button onClick={buscar} disabled={isFetching}>
          {isFetching ? "Buscando…" : "Buscar"}
        </Button>
      </div>

      {isError && (
        <p className="text-destructive text-sm">
          No se encontró una evaluación con ese ID.
        </p>
      )}
      {resultado && <ResultadoEvaluacion resultado={resultado} />}
    </div>
  );
}
