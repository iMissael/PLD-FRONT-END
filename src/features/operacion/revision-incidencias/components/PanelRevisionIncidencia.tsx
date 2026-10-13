import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { useAuthStore } from "@/shared/auth/authStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";

import { useResolverIncidencia } from "../hooks/useIncidencias";
import type { CoincidenciaSocio, DecisionRiesgoPais } from "../types/incidencias";
import { listasCoincidentes } from "../utils/comparar";
import { ComparacionPersona } from "./ComparacionPersona";

type ListaPaisDto = NonNullable<CoincidenciaSocio["pais_nacimiento"]>;

/** Un bucket de riesgo-pais (pais de nacimiento o nacionalidad): es informativo, nunca bloquea. */
function RiesgoPaisBucket({
  titulo,
  lista,
  valor,
  onChange,
  disabled,
}: {
  titulo: string;
  lista: ListaPaisDto;
  valor: DecisionRiesgoPais | undefined;
  onChange: (valor: DecisionRiesgoPais) => void;
  disabled: boolean;
}) {
  const nombre = `riesgo-pais-${titulo}`;
  return (
    <div className="space-y-2 rounded-md border p-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{titulo}</p>
      <p className="text-sm">{lista.nombre_encontrado ?? "—"}</p>
      <div className="flex items-center gap-4 text-sm">
        <label className="flex items-center gap-1.5">
          <input
            type="radio"
            name={nombre}
            disabled={disabled}
            checked={valor === "CONFIRMADO"}
            onChange={() => onChange("CONFIRMADO")}
          />
          Confirmar
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="radio"
            name={nombre}
            disabled={disabled}
            checked={valor === "MINIMIZADO"}
            onChange={() => onChange("MINIMIZADO")}
          />
          Minimizar
        </label>
      </div>
    </div>
  );
}

// Solo quien tiene el permiso asignado en su rol resuelve (el backend no aplica aquí el acceso
// total del administrador: separación de funciones).
const PERMISO_CONFIRMAR = { recurso: "coincidencias", accion: "confirmar" } as const;
const MAX_COMENTARIO = 500;

type Decision = "confirmar" | "descartar";

const TEXTOS: Record<Decision, { titulo: string; descripcion: string; accion: string }> =
  {
    confirmar: {
      titulo: "¿Confirmar que el socio es la persona de la lista?",
      descripcion:
        "El socio quedará bloqueado: la matriz de riesgo ya no lo evaluará y cualquier nueva evaluación responderá “socio bloqueado”.",
      accion: "Sí, bloquear socio",
    },
    descartar: {
      titulo: "¿Descartar la coincidencia?",
      descripcion:
        "Indicas que el socio no es la persona de la lista. Su evaluación de riesgo podrá ejecutarse normalmente al volver a enviarla.",
      accion: "Sí, descartar",
    },
  };

interface PanelRevisionIncidenciaProps {
  coincidencia: CoincidenciaSocio | null;
  onClose: () => void;
}

export function PanelRevisionIncidencia({
  coincidencia,
  onClose,
}: PanelRevisionIncidenciaProps) {
  const esOficial = useAuthStore((estado) =>
    estado.permisos.some(
      (p) => p.recurso === PERMISO_CONFIRMAR.recurso && p.accion === PERMISO_CONFIRMAR.accion,
    ),
  );
  const resolver = useResolverIncidencia();
  const [comentario, setComentario] = useState("");
  const [decision, setDecision] = useState<Decision | null>(null);
  const [decisionPaisNacimiento, setDecisionPaisNacimiento] = useState<DecisionRiesgoPais>();
  const [decisionNacionalidad, setDecisionNacionalidad] = useState<DecisionRiesgoPais>();

  // Cambiar de coincidencia (otra fila de la tabla) resetea las decisiones de pais sin guardar:
  // son de la fila actual, no deben arrastrarse a la siguiente.
  useEffect(() => {
    setDecisionPaisNacimiento(undefined);
    setDecisionNacionalidad(undefined);
  }, [coincidencia?.socio_ref]);

  function cerrar() {
    setComentario("");
    setDecision(null);
    onClose();
  }

  function guardarDecisionPais() {
    if (!coincidencia?.socio_ref || (!decisionPaisNacimiento && !decisionNacionalidad)) return;
    resolver.mutate(
      {
        socioRef: coincidencia.socio_ref,
        payload: {
          pais_nacimiento_decision: decisionPaisNacimiento,
          nacionalidad_decision: decisionNacionalidad,
        },
      },
      {
        onSuccess: () => toast.success("Riesgo de país actualizado."),
        onError: (error) => {
          toast.error(isAppError(error) ? error.message : "No se pudo guardar la decisión.");
        },
      },
    );
  }

  function aplicarDecision() {
    if (!coincidencia?.socio_ref || !decision) return;
    const esLaPersona = decision === "confirmar";
    resolver.mutate(
      {
        socioRef: coincidencia.socio_ref,
        payload: {
          es_la_persona: esLaPersona,
          comentario: comentario.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            esLaPersona
              ? `El socio ${coincidencia.socio_ref} quedó bloqueado.`
              : `Coincidencia descartada: ${coincidencia.socio_ref} puede evaluarse.`,
          );
          cerrar();
        },
        onError: (error) => {
          setDecision(null);
          toast.error(
            isAppError(error) ? error.message : "No se pudo guardar la decisión.",
          );
        },
      },
    );
  }

  if (!coincidencia) return null;

  const personas = coincidencia.personas_en_lista ?? [];
  const nombreExterno =
    coincidencia.lista_negra?.coincide && coincidencia.lista_negra.nombre_encontrado;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1.5">
          <h2 className="text-lg leading-none font-semibold">
            {coincidencia.socio?.nombre ?? coincidencia.socio_ref}
          </h2>
          <p className="text-sm text-muted-foreground">
            Socio {coincidencia.socio_ref}
            {coincidencia.sucursal ? ` · ${coincidencia.sucursal}` : ""}. Compara sus
            datos con los de la lista y decide si es la misma persona.
          </p>
          <div className="flex flex-wrap gap-1 pt-1">
            {listasCoincidentes(coincidencia).map((lista) => (
              <Badge key={lista} variant="destructive">
                {lista}
              </Badge>
            ))}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          aria-label="Cerrar"
          onClick={cerrar}
        >
          <X />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {personas.map((persona) => (
          <ComparacionPersona
            key={`${persona.rfc}-${persona.curp}-${persona.nombre}`}
            socio={coincidencia.socio}
            persona={persona}
          />
        ))}

        {nombreExterno ? (
          <div className="rounded-lg border p-4 text-sm">
            <p className="font-medium">Lista negra (proveedor externo)</p>
            <p className="text-muted-foreground">Nombre encontrado: {nombreExterno}</p>
          </div>
        ) : null}

        {!personas.length && !nombreExterno ? (
          <p className="text-sm text-muted-foreground">
            No hay detalle de la persona en la lista para esta coincidencia.
          </p>
        ) : null}

        {coincidencia.pais_nacimiento?.coincide || coincidencia.nacionalidad?.coincide ? (
          <div className="space-y-3 rounded-lg border p-4">
            <p className="text-sm font-medium">Confirmación de países</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {coincidencia.pais_nacimiento?.coincide ? (
                <RiesgoPaisBucket
                  titulo="País de nacimiento"
                  lista={coincidencia.pais_nacimiento}
                  valor={decisionPaisNacimiento}
                  onChange={setDecisionPaisNacimiento}
                  disabled={!esOficial || resolver.isPending}
                />
              ) : null}
              {coincidencia.nacionalidad?.coincide ? (
                <RiesgoPaisBucket
                  titulo="Nacionalidad"
                  lista={coincidencia.nacionalidad}
                  valor={decisionNacionalidad}
                  onChange={setDecisionNacionalidad}
                  disabled={!esOficial || resolver.isPending}
                />
              ) : null}
            </div>
            {esOficial ? (
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={resolver.isPending || (!decisionPaisNacimiento && !decisionNacionalidad)}
                  onClick={guardarDecisionPais}
                >
                  Guardar decisión de país
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}

        {esOficial ? (
          <div className="space-y-2">
            <Label htmlFor="comentario-revision">Comentario (opcional)</Label>
            <textarea
              id="comentario-revision"
              value={comentario}
              maxLength={MAX_COMENTARIO}
              onChange={(evento) => setComentario(evento.target.value)}
              rows={3}
              placeholder="Sustento de la decisión, p. ej. “RFC y CURP idénticos”."
              className="w-full rounded-md border bg-card px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            <p className="text-right text-xs text-muted-foreground">
              {comentario.length}/{MAX_COMENTARIO}
            </p>
          </div>
        ) : (
          <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
            Solo el oficial de cumplimiento puede confirmar o descartar coincidencias.
          </p>
        )}

        {esOficial && (
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              variant="outline"
              disabled={resolver.isPending}
              onClick={() => setDecision("descartar")}
            >
              No es la persona
            </Button>
            <Button
              variant="destructive"
              disabled={resolver.isPending}
              onClick={() => setDecision("confirmar")}
            >
              Es la persona
            </Button>
          </div>
        )}
      </CardContent>

      <AlertDialog
        open={decision !== null}
        onOpenChange={(abierto) => !abierto && !resolver.isPending && setDecision(null)}
      >
        <AlertDialogContent>
          {decision && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>{TEXTOS[decision].titulo}</AlertDialogTitle>
                <AlertDialogDescription>
                  {TEXTOS[decision].descripcion}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={resolver.isPending}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={resolver.isPending}
                  className={
                    decision === "confirmar"
                      ? "bg-destructive text-white hover:bg-destructive-hover"
                      : undefined
                  }
                  onClick={(evento) => {
                    evento.preventDefault();
                    aplicarDecision();
                  }}
                >
                  {resolver.isPending ? "Guardando…" : TEXTOS[decision].accion}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
