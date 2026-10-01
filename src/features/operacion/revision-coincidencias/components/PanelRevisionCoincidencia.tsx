import { useState } from "react";
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
import { Label } from "@/shared/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";

import { useResolverCoincidencia } from "../hooks/useCoincidencias";
import type { CoincidenciaSocio } from "../types/coincidencias";
import { listasCoincidentes } from "../utils/comparar";
import { ComparacionPersona } from "./ComparacionPersona";

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

interface PanelRevisionCoincidenciaProps {
  coincidencia: CoincidenciaSocio | null;
  onClose: () => void;
}

export function PanelRevisionCoincidencia({
  coincidencia,
  onClose,
}: PanelRevisionCoincidenciaProps) {
  const esOficial = useAuthStore((estado) =>
    estado.permisos.some(
      (p) => p.recurso === PERMISO_CONFIRMAR.recurso && p.accion === PERMISO_CONFIRMAR.accion,
    ),
  );
  const resolver = useResolverCoincidencia();
  const [comentario, setComentario] = useState("");
  const [decision, setDecision] = useState<Decision | null>(null);

  function cerrar() {
    setComentario("");
    setDecision(null);
    onClose();
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

  const personas = coincidencia?.personas_en_lista ?? [];
  const nombreExterno =
    coincidencia?.lista_negra?.coincide && coincidencia.lista_negra.nombre_encontrado;

  return (
    <Sheet open={coincidencia !== null} onOpenChange={(abierto) => !abierto && cerrar()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {coincidencia && (
          <>
            <SheetHeader>
              <SheetTitle>
                {coincidencia.socio?.nombre ?? coincidencia.socio_ref}
              </SheetTitle>
              <SheetDescription>
                Socio {coincidencia.socio_ref}
                {coincidencia.sucursal ? ` · ${coincidencia.sucursal}` : ""}. Compara sus
                datos con los de la lista y decide si es la misma persona.
              </SheetDescription>
              <div className="flex flex-wrap gap-1 pt-1">
                {listasCoincidentes(coincidencia).map((lista) => (
                  <Badge key={lista} variant="destructive">
                    {lista}
                  </Badge>
                ))}
              </div>
            </SheetHeader>

            <div className="space-y-4 px-4">
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
                  <p className="text-muted-foreground">
                    Nombre encontrado: {nombreExterno}
                  </p>
                </div>
              ) : null}

              {!personas.length && !nombreExterno ? (
                <p className="text-sm text-muted-foreground">
                  No hay detalle de la persona en la lista para esta coincidencia.
                </p>
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
                  Solo el oficial de cumplimiento puede confirmar o descartar
                  coincidencias.
                </p>
              )}
            </div>

            {esOficial && (
              <SheetFooter className="flex-row justify-end gap-2">
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
              </SheetFooter>
            )}

            <AlertDialog
              open={decision !== null}
              onOpenChange={(abierto) =>
                !abierto && !resolver.isPending && setDecision(null)
              }
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
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
