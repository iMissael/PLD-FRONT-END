import { Eye } from "lucide-react";

import { Badge } from "@/shared/components/atoms/Badge";
import { Button } from "@/shared/components/atoms/Button";
import { Skeleton } from "@/shared/components/atoms/Skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/atoms/Table";

import type { CoincidenciaSocio } from "../types/incidencias";

function formatearFecha(valor: string | undefined) {
  if (!valor) return "—";
  return new Date(valor).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

type EstatusCombinado = "PENDIENTE" | "CONFIRMADO" | "RECHAZADO";

function textoEstatus(estado: EstatusCombinado): string {
  switch (estado) {
    case "PENDIENTE":
      return "Pendiente";
    case "CONFIRMADO":
      return "Confirmado";
    case "RECHAZADO":
      return "Rechazado";
  }
}

function varianteEstatus(estado: EstatusCombinado): "outline" | "destructive" | "secondary" {
  switch (estado) {
    case "CONFIRMADO":
      return "destructive";
    case "RECHAZADO":
      return "secondary";
    case "PENDIENTE":
      return "outline";
  }
}

/**
 * Estatus combinado de los 2 buckets de riesgo-pais (nacimiento y nacionalidad); null si ninguno
 * coincide con una lista. Es informativo (nunca bloquea al socio), pero la columna muestra su
 * estatus de revision igual que las demas: Pendiente/Confirmado/Rechazado, no de que tipo es.
 */
function estatusPais(coincidencia: CoincidenciaSocio): EstatusCombinado | null {
  const coincide = coincidencia.pais_nacimiento?.coincide || coincidencia.nacionalidad?.coincide;
  if (!coincide) return null;

  const confirmacionPais = coincidencia.pais_nacimiento?.confirmacion;
  const confirmacionNacionalidad = coincidencia.nacionalidad?.confirmacion;
  if (confirmacionPais === "PENDIENTE" || confirmacionNacionalidad === "PENDIENTE") return "PENDIENTE";
  if (confirmacionPais === "CONFIRMADO" || confirmacionNacionalidad === "CONFIRMADO") return "CONFIRMADO";
  return "RECHAZADO";
}

/**
 * Estatus de la coincidencia en lista negra/bloqueadas (coincidencia.estado, ver
 * CoincidenciaListaResponse del backend): null si no hay coincidencia en esas listas (solo PEP o
 * ninguna), igual que estatusPais null cuando no hay coincidencia de pais. No mezcla aqui el
 * estatus de duplicados ni de personas relacionadas: esos ya tienen su propia columna/seccion.
 */
function estatusLista(coincidencia: CoincidenciaSocio): EstatusCombinado | null {
  switch (coincidencia.estado) {
    case "PENDIENTE_REVISION":
      return "PENDIENTE";
    case "BLOQUEADO":
      return "CONFIRMADO";
    case "DESCARTADA":
      return "RECHAZADO";
    default:
      return null;
  }
}

/** La primera persona relacionada con coincidencia (preferimos una pendiente sobre una ya resuelta). */
function primeraPersonaRelacionada(coincidencia: CoincidenciaSocio) {
  const personas = coincidencia.personas_relacionadas ?? [];
  return personas.find((p) => p.estado === "PENDIENTE") ?? personas[0];
}

function nombrePersonaRelacionada(coincidencia: CoincidenciaSocio) {
  return primeraPersonaRelacionada(coincidencia)?.nombre ?? "—";
}

function tipoRelacion(coincidencia: CoincidenciaSocio) {
  return primeraPersonaRelacionada(coincidencia)?.relacion ?? "—";
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
        No hay incidencias registradas.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Fecha Incidencia</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Estatus Pais</TableHead>
          <TableHead>Estatus lista</TableHead>
          <TableHead>Persona Relacionada</TableHead>
          <TableHead>Tipo de Relación</TableHead>
          <TableHead className="text-right">Acción</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {coincidencias.map((coincidencia, indice) => (
          <TableRow
            key={coincidencia.socio_ref}
            onDoubleClick={() => onRevisar(coincidencia)}
            className={
              coincidencia.socio_ref === socioRefSeleccionado
                ? "cursor-pointer bg-muted hover:bg-muted"
                : "cursor-pointer"
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
              {(() => {
                const estado = estatusPais(coincidencia);
                return estado ? (
                  <Badge variant={varianteEstatus(estado)}>{textoEstatus(estado)}</Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                );
              })()}
            </TableCell>
            <TableCell>
              {(() => {
                const estado = estatusLista(coincidencia);
                return estado ? (
                  <Badge variant={varianteEstatus(estado)}>{textoEstatus(estado)}</Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                );
              })()}
            </TableCell>
            <TableCell>{nombrePersonaRelacionada(coincidencia)}</TableCell>
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
