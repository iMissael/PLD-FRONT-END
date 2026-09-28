import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { useListasRestrictivas } from "@/features/operacion/consulta-listas/hooks/useConsultaListas";
import type { ConsultaLista } from "@/features/operacion/consulta-listas/types/consultaListas";

function formatearFecha(fecha: string | undefined) {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleString("es-MX");
}

export function ResultadosConsultaListas({
  resultados,
}: {
  resultados: ConsultaLista[];
}) {
  const { data: listas } = useListasRestrictivas();

  function nombreDeLista(idLista: string | undefined) {
    return listas?.find((l) => l.id === idLista)?.nombreOficial ?? idLista ?? "—";
  }

  const hayCoincidencia = resultados.some((r) => r.estatus === "COINCIDENCIA");

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Resultado general:</span>
        <Badge variant={hayCoincidencia ? "destructive" : "secondary"}>
          {hayCoincidencia ? "Coincidencia encontrada" : "Sin coincidencias"}
        </Badge>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lista</TableHead>
            <TableHead>Coincidencia</TableHead>
            <TableHead>% de coincidencia</TableHead>
            <TableHead>Fecha de verificación</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resultados.map((resultado) => (
            <TableRow key={resultado.id}>
              <TableCell className="font-medium">
                {nombreDeLista(resultado.idLista)}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    resultado.estatus === "COINCIDENCIA" ? "destructive" : "secondary"
                  }
                >
                  {resultado.estatus === "COINCIDENCIA" ? "Sí" : "No"}
                </Badge>
              </TableCell>
              <TableCell>
                {resultado.porcentajeCoincidencia != null
                  ? `${resultado.porcentajeCoincidencia}%`
                  : "—"}
              </TableCell>
              <TableCell>{formatearFecha(resultado.fechaVerificacion)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
