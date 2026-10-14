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

/** Riesgo-pais es informativo (nunca bloquea): solo se muestra si nacimiento y/o nacionalidad coinciden. */
function estatusPais(coincidencia: CoincidenciaSocio) {
  const partes: string[] = [];
  if (coincidencia.pais_nacimiento?.coincide) partes.push("Nacimiento");
  if (coincidencia.nacionalidad?.coincide) partes.push("Nacionalidad");
  return partes;
}

type EstatusCombinado = "PENDIENTE" | "CONFIRMADO" | "RECHAZADO";

/**
 * Estatus unico de la fila, combinando los 5 tipos de coincidencia que puede tener un socio (lista
 * negra/bloqueadas, riesgo-pais de nacimiento, riesgo-pais de nacionalidad, nombre similar entre
 * socios, persona relacionada): si CUALQUIERA sigue pendiente, la fila es "Pendiente"; si no hay
 * nada pendiente pero algo se confirmo, "Confirmado"; si todo lo que hubo se descarto o se
 * minimizo, "Rechazado". La fila nunca desaparece de la tabla al resolverse, solo cambia este
 * estatus (es una bitacora, no una cola de pendientes).
 */
function estatusCombinado(coincidencia: CoincidenciaSocio): EstatusCombinado {
  const duplicados = coincidencia.duplicados ?? [];
  const personasRelacionadas = coincidencia.personas_relacionadas ?? [];
  const confirmacionPais = coincidencia.pais_nacimiento?.confirmacion;
  const confirmacionNacionalidad = coincidencia.nacionalidad?.confirmacion;

  const hayPendiente =
    coincidencia.estado === "PENDIENTE_REVISION" ||
    duplicados.some((d) => d.estado === "PENDIENTE") ||
    personasRelacionadas.some((p) => p.estado === "PENDIENTE") ||
    confirmacionPais === "PENDIENTE" ||
    confirmacionNacionalidad === "PENDIENTE";
  if (hayPendiente) return "PENDIENTE";

  const hayConfirmado =
    coincidencia.estado === "BLOQUEADO" ||
    duplicados.some((d) => d.estado === "CONFIRMADA") ||
    personasRelacionadas.some((p) => p.estado === "CONFIRMADA") ||
    confirmacionPais === "CONFIRMADO" ||
    confirmacionNacionalidad === "CONFIRMADO";
  if (hayConfirmado) return "CONFIRMADO";

  return "RECHAZADO";
}

function estatusLista(coincidencia: CoincidenciaSocio): string {
  switch (estatusCombinado(coincidencia)) {
    case "PENDIENTE":
      return "Pendiente";
    case "CONFIRMADO":
      return "Confirmado";
    case "RECHAZADO":
      return "Rechazado";
  }
}

function varianteEstatusLista(coincidencia: CoincidenciaSocio): "outline" | "destructive" | "secondary" {
  switch (estatusCombinado(coincidencia)) {
    case "CONFIRMADO":
      return "destructive";
    case "RECHAZADO":
      return "secondary";
    case "PENDIENTE":
      return "outline";
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

/** Hay un socio con nombre igual o parecido registrado (informativo, nunca bloquea). */
function tieneDuplicado(coincidencia: CoincidenciaSocio) {
  return (coincidencia.duplicados?.length ?? 0) > 0;
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
            <TableCell>
              <div className="flex flex-wrap gap-1">
                <Badge variant={varianteEstatusLista(coincidencia)}>
                  {estatusLista(coincidencia)}
                </Badge>
                {tieneDuplicado(coincidencia) ? (
                  <Badge variant="outline">Nombre similar</Badge>
                ) : null}
              </div>
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
