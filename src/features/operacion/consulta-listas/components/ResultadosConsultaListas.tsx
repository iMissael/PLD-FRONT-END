import { AlertTriangle } from "lucide-react";
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
import type { ConsultaLista } from "@/features/operacion/consulta-listas/types/Quienesquien";

function formatearFecha(fecha: string | undefined) {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleString("es-MX");
}

export function ResultadosConsultaListas({
  resultados,
  proveedorExternoNoDisponible,
}: {
  resultados: ConsultaLista[];
  /** El proveedor externo (PEP/OFAC/DEA/PGR) no respondió: lo que se ve aquí no es una
   * verificación completa, solo lo que alcanzó a revisarse. */
  proveedorExternoNoDisponible?: boolean;
}) {
  const { data: listas } = useListasRestrictivas();

  function nombreDeLista(idLista: string | undefined) {
    return listas?.find((l) => l.id === idLista)?.nombreOficial ?? idLista ?? "—";
  }

  const hayCoincidencia = resultados.some((r) => r.estatus === "COINCIDENCIA");

  return (
    <div className="space-y-3">
      {proveedorExternoNoDisponible && (
        <div className="border-warning-soft bg-warning-soft text-warning-hover flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            No se pudo consultar el proveedor externo de listas (PEP/OFAC/DEA/PGR): el
            servicio no respondió. El resultado de abajo no es una verificación completa;
            vuelve a intentar la consulta antes de tomar una decisión.
          </p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Resultado general:</span>
        {proveedorExternoNoDisponible && !hayCoincidencia ? (
          <Badge variant="outline">No se pudo verificar</Badge>
        ) : (
          <Badge variant={hayCoincidencia ? "destructive" : "secondary"}>
            {hayCoincidencia ? "Coincidencia encontrada" : "Sin coincidencias"}
          </Badge>
        )}
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
