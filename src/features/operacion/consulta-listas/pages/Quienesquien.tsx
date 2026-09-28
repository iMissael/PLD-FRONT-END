import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ConsultaListasForm } from "@/features/operacion/consulta-listas/components/ConsultaListasForm";
import { ResultadosConsultaListas } from "@/features/operacion/consulta-listas/components/ResultadosConsultaListas";
import type { ConsultaLista } from "@/features/operacion/consulta-listas/types/Quienesquien";

export function ConsultaListasPage() {
  const [resultados, setResultados] = useState<ConsultaLista[] | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Consulta de Quien es quien</h1>
        <p className="text-muted-foreground">
          Verifica si una persona coincide con alguna lista peps o negra.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nueva consulta</CardTitle>
        </CardHeader>
        <CardContent>
          <ConsultaListasForm onResultados={setResultados} />
        </CardContent>
      </Card>

      {resultados && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            <ResultadosConsultaListas resultados={resultados} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
