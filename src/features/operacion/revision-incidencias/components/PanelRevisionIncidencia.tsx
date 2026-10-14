import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { useAuthStore } from "@/shared/auth/authStore";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";

import { useResolverIncidencia } from "../hooks/useIncidencias";
import type { CoincidenciaSocio, DecisionRiesgoPais } from "../types/incidencias";
import { listasCoincidentes } from "../utils/comparar";

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

/** Fila etiqueta/valor del recuadro de confirmación, estilo tabla (como la pantalla legada). */
function FilaCampo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] border-b last:border-b-0">
      <div className="border-r bg-muted/50 px-3 py-2 text-xs font-semibold text-muted-foreground">
        {label}
      </div>
      <div className="px-3 py-2 text-sm">{children}</div>
    </div>
  );
}

type Riesgo = "CONFIRMAR" | "RECHAZAR";
const MAX_JUSTIFICACION = 500;

// Solo quien tiene el permiso asignado en su rol resuelve (el backend no aplica aquí el acceso
// total del administrador: separación de funciones).
const PERMISO_CONFIRMAR = { recurso: "coincidencias", accion: "confirmar" } as const;

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
  const [riesgo, setRiesgo] = useState<Riesgo>();
  const [justificacion, setJustificacion] = useState("");
  const [decisionPaisNacimiento, setDecisionPaisNacimiento] = useState<DecisionRiesgoPais>();
  const [decisionNacionalidad, setDecisionNacionalidad] = useState<DecisionRiesgoPais>();

  // Cambiar de coincidencia (otra fila de la tabla) resetea las decisiones sin guardar: son de la
  // fila actual, no deben arrastrarse a la siguiente.
  useEffect(() => {
    setRiesgo(undefined);
    setJustificacion("");
    setDecisionPaisNacimiento(undefined);
    setDecisionNacionalidad(undefined);
  }, [coincidencia?.socio_ref]);

  function cerrar() {
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

  function guardarDecisionLista() {
    if (!coincidencia?.socio_ref || !riesgo) return;
    const esLaPersona = riesgo === "CONFIRMAR";
    resolver.mutate(
      {
        socioRef: coincidencia.socio_ref,
        payload: {
          es_la_persona: esLaPersona,
          comentario: justificacion.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            esLaPersona
              ? `El socio ${coincidencia.socio_ref} quedó bloqueado.`
              : `Coincidencia rechazada: ${coincidencia.socio_ref} puede evaluarse.`,
          );
          cerrar();
        },
        onError: (error) => {
          toast.error(isAppError(error) ? error.message : "No se pudo guardar la decisión.");
        },
      },
    );
  }

  if (!coincidencia) return null;

  const listaTexto = listasCoincidentes(coincidencia).join(", ") || "—";
  const nombreExterno =
    coincidencia.lista_negra?.coincide ? coincidencia.lista_negra.nombre_encontrado : undefined;
  const personas = coincidencia.personas_en_lista ?? [];
  const hayCoincidenciaBloqueante =
    coincidencia.lista_negra?.coincide || coincidencia.lista_bloqueadas?.coincide;

  const entradas = personas.length
    ? personas.map((p) => ({ nombreReal: p.nombre || "—", lista: p.lista || listaTexto }))
    : hayCoincidenciaBloqueante
      ? [{ nombreReal: nombreExterno ?? coincidencia.socio?.nombre ?? "—", lista: listaTexto }]
      : [];

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
        {entradas.length ? (
          <div className="overflow-hidden rounded-lg border">
            <div className="border-b bg-muted px-4 py-2 text-sm font-semibold">
              Confirmación de listas bloqueadas (coincidencias: {entradas.length})
            </div>
            <div className="divide-y">
              {entradas.map((entrada, indice) => (
                <div key={`${entrada.nombreReal}-${indice}`}>
                  <div className="bg-muted/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                    Coincidencia {indice + 1}
                  </div>
                  <div className="border-t">
                    <FilaCampo label="Nombre">{coincidencia.socio?.nombre ?? "—"}</FilaCampo>
                    <FilaCampo label="Nombre Real">{entrada.nombreReal}</FilaCampo>
                    <FilaCampo label="Lista">{entrada.lista}</FilaCampo>
                  </div>
                </div>
              ))}
            </div>

            {esOficial ? (
              <div className="border-t">
                <FilaCampo label="Riesgo">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="riesgo-lista"
                        disabled={resolver.isPending}
                        checked={riesgo === "CONFIRMAR"}
                        onChange={() => setRiesgo("CONFIRMAR")}
                      />
                      Confirmar
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="riesgo-lista"
                        disabled={resolver.isPending}
                        checked={riesgo === "RECHAZAR"}
                        onChange={() => setRiesgo("RECHAZAR")}
                      />
                      Rechazar
                    </label>
                  </div>
                </FilaCampo>
                <FilaCampo label="Justificación">
                  <textarea
                    value={justificacion}
                    maxLength={MAX_JUSTIFICACION}
                    disabled={resolver.isPending}
                    onChange={(evento) => setJustificacion(evento.target.value)}
                    rows={2}
                    placeholder="Sustento de la decisión, p. ej. “RFC y CURP idénticos”."
                    className="w-full resize-none rounded-md border bg-card px-2 py-1.5 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  />
                  <p className="pt-1 text-right text-xs text-muted-foreground">
                    {justificacion.length}/{MAX_JUSTIFICACION}
                  </p>
                </FilaCampo>
                <div className="flex justify-end px-3 py-2">
                  <Button
                    size="sm"
                    disabled={resolver.isPending || !riesgo}
                    onClick={guardarDecisionLista}
                  >
                    {resolver.isPending ? "Guardando…" : "Guardar decisión"}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="border-t bg-muted p-3 text-sm text-muted-foreground">
                Solo el oficial de cumplimiento puede confirmar o rechazar coincidencias.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay detalle de la persona en la lista para esta coincidencia.
          </p>
        )}

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
      </CardContent>
    </Card>
  );
}
