import { Eye } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

import type { CoincidenciaSocio } from "../types/coincidencias";
import { listasCoincidentes } from "../utils/comparar";

function formatearFecha(valor: string | undefined) {
  if (!valor) return "—";
  return new Date(valor).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function nombreEncontrado(coincidencia: CoincidenciaSocio) {
  return (
    coincidencia.lista_bloqueadas?.nombre_encontrado ??
    coincidencia.lista_negra?.nombre_encontrado ??
    "—"
  );
}

interface TablaCoincidenciasPendientesProps {
  coincidencias: CoincidenciaSocio[] | undefined;
  isLoading: boolean;
  onRevisar: (coincidencia: CoincidenciaSocio) => void;
}

export function TablaCoincidenciasPendientes({
  coincidencias,
  isLoading,
  onRevisar,
}: TablaCoincidenciasPendientesProps) {
  if (isLoading) {
    return (
      <div className="space-y-2" aria-label="Cargando coincidencias">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!coincidencias?.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No hay coincidencias pendientes de revisión.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Socio</TableHead>
          <TableHead>Lista</TableHead>
          <TableHead>Nombre en la lista</TableHead>
          <TableHead>Detectada</TableHead>
          <TableHead className="text-right">Acción</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {coincidencias.map((coincidencia) => (
          <TableRow key={coincidencia.socio_ref}>
            <TableCell>
              <div className="font-medium">{coincidencia.socio?.nombre ?? "—"}</div>
              <div className="text-xs text-muted-foreground">
                {coincidencia.socio_ref}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {listasCoincidentes(coincidencia).map((lista) => (
                  <Badge key={lista} variant="destructive">
                    {lista}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>{nombreEncontrado(coincidencia)}</TableCell>
            <TableCell className="text-muted-foreground">
              {formatearFecha(
                coincidencia.fecha_modificacion ?? coincidencia.fecha_registro,
              )}
            </TableCell>
            <TableCell className="text-right">
              <Button size="sm" onClick={() => onRevisar(coincidencia)}>
                <Eye />
                Revisar
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
