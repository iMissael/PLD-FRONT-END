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

import type { CoincidenciaSocio } from "../types/incidencias";
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

/** Riesgo-pais es informativo (nunca bloquea): solo se muestra si nacimiento y/o nacionalidad coinciden. */
function estatusPais(coincidencia: CoincidenciaSocio) {
  const partes: string[] = [];
  if (coincidencia.pais_nacimiento?.coincide) partes.push("Nacimiento");
  if (coincidencia.nacionalidad?.coincide) partes.push("Nacionalidad");
  return partes;
}

// Pendiente de Feature 2 (persona relacionada): hoy toda coincidencia es del socio directo.
function tipoRelacion(_coincidencia: CoincidenciaSocio) {
  return "—";
}

interface TablaIncidenciasPendientesProps {
  coincidencias: CoincidenciaSocio[] | undefined;
  isLoading: boolean;
  socioRefSeleccionado?: string;
  onRevisar: (coincidencia: CoincidenciaSocio) => void;
}

export function TablaIncidenciasPendientes({
  coincidencias,
  isLoading,
  socioRefSeleccionado,
  onRevisar,
}: TablaIncidenciasPendientesProps) {
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
          <TableHead className="w-12">#</TableHead>
          <TableHead>Fecha Incidencia</TableHead>
          <TableHead>Socio</TableHead>
          <TableHead>Lista</TableHead>
          <TableHead>Estatus País</TableHead>
          <TableHead>Nombre en la lista</TableHead>
          <TableHead>Tipo de Relación</TableHead>
          <TableHead className="text-right">Acción</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {coincidencias.map((coincidencia, indice) => (
          <TableRow
            key={coincidencia.socio_ref}
            className={
              coincidencia.socio_ref === socioRefSeleccionado
                ? "bg-muted hover:bg-muted"
                : undefined
            }
          >
            <TableCell className="text-muted-foreground">{indice + 1}</TableCell>
            <TableCell className="text-muted-foreground">
              {formatearFecha(
                coincidencia.fecha_modificacion ?? coincidencia.fecha_registro,
              )}
            </TableCell>
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
                {coincidencia.lista_peps?.coincide ? (
                  <Badge variant="outline">PEP</Badge>
                ) : null}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {estatusPais(coincidencia).length > 0 ? (
                  estatusPais(coincidencia).map((parte) => (
                    <Badge key={parte} variant="outline">
                      {parte}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
            </TableCell>
            <TableCell>{nombreEncontrado(coincidencia)}</TableCell>
            <TableCell className="text-muted-foreground">
              {tipoRelacion(coincidencia)}
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
