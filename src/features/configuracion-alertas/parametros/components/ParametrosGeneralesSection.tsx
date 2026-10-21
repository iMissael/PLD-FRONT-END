import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Button } from "@/shared/components/atoms/Button";
import { Input } from "@/shared/components/atoms/Input";
import { Alert, Card } from "@/shared/components/molecules";
import { hint, label } from "@/shared/styles/tokens";

import { useGuardarParametros, useParametrosAlerta } from "../hooks/useParametrosAlerta";

export function ParametrosGeneralesSection({ puedeEditar }: { puedeEditar: boolean }) {
  const { data, isLoading, isError } = useParametrosAlerta();
  const guardar = useGuardarParametros();
  const [tolerancia, setTolerancia] = useState("");
  const [anios, setAnios] = useState("");
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setTolerancia(String(data.toleranciaPerfilPorcentaje));
      setAnios(String(data.aniosAtrasIncidencia));
    }
  }, [data]);

  const cambio =
    data !== undefined &&
    (Number(tolerancia) !== data.toleranciaPerfilPorcentaje ||
      Number(anios) !== data.aniosAtrasIncidencia);

  const handleGuardar = (e: FormEvent) => {
    e.preventDefault();
    setMensajeError(null);
    guardar.mutate(
      {
        toleranciaPerfilPorcentaje: Number(tolerancia),
        aniosAtrasIncidencia: Number(anios),
      },
      {
        onSuccess: () => toast.success("Parámetros guardados."),
        onError: (error) => {
          const msg = isAppError(error) ? error.message : "Ocurrió un error inesperado.";
          setMensajeError(msg);
          toast.error(msg);
        },
      },
    );
  };

  return (
    <Card className="gap-4 px-6">
      <div>
        <h3 className="text-foreground text-base font-semibold">Parámetros generales</h3>
        <p className={hint}>Se aplican a todas las reglas de alerta de este cliente.</p>
      </div>
      {isError ? <Alert>No se pudieron cargar los parámetros.</Alert> : null}
      {mensajeError ? <Alert>{mensajeError}</Alert> : null}
      <form onSubmit={handleGuardar} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="tolerancia-perfil" className={label}>
              Tolerancia del perfil transaccional (%)
            </label>
            <Input
              id="tolerancia-perfil"
              type="number"
              min={0}
              max={100}
              step={0.01}
              value={tolerancia}
              onChange={(e) => setTolerancia(e.target.value)}
              disabled={!puedeEditar || isLoading}
              className="rounded-xl"
            />
            <span className={hint}>
              Margen sobre el monto y el número de pagos declarados antes de alertar
              (reglas 1, 2 y 13).
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="anios-incidencia" className={label}>
              Antigüedad máxima de la fecha de incidencia (años)
            </label>
            <Input
              id="anios-incidencia"
              type="number"
              min={1}
              max={20}
              step={1}
              value={anios}
              onChange={(e) => setAnios(e.target.value)}
              disabled={!puedeEditar || isLoading}
              className="rounded-xl"
            />
            <span className={hint}>
              Límite para capturar una alerta manual con fecha pasada.
            </span>
          </div>
        </div>
        {puedeEditar ? (
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!cambio || guardar.isPending}
              className="rounded-full px-6"
            >
              {guardar.isPending ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        ) : null}
      </form>
    </Card>
  );
}
