import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, Clock, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Form } from "@/shared/components/ui/form";
import { useGuardarOficialCumplimiento } from "@/features/configuraciones/oficial-cumplimiento/hooks/useOficialCumplimiento";
import {
  AvisoCumplimiento,
  EncabezadoOficial,
  EstadoOficial,
  type TonoEstado,
} from "@/features/configuraciones/oficial-cumplimiento/components/EncabezadoOficial";
import { SeccionDatosGenerales } from "@/features/configuraciones/oficial-cumplimiento/components/SeccionDatosGenerales";
import { SeccionDomicilio } from "@/features/configuraciones/oficial-cumplimiento/components/SeccionDomicilio";
import { SeccionParametrosPld } from "@/features/configuraciones/oficial-cumplimiento/components/SeccionParametrosPld";
import {
  oficialCumplimientoSchema,
  type OficialCumplimientoFormValues,
} from "@/features/configuraciones/oficial-cumplimiento/types/oficialCumplimientoSchema";
import {
  aDomicilioPayload,
  aOficialPayload,
  aUsuarioPayload,
  ultimaActualizacion,
  valoresIniciales,
} from "@/features/configuraciones/oficial-cumplimiento/utils/oficialCumplimiento";
import type {
  DomicilioUsuarioResponse,
  OficialResponse,
  UsuarioResponse,
} from "@/features/configuraciones/administracion/usuarios/types/usuarios";

// El pie con "Guardar" queda abajo a la derecha, donde Sonner muestra los toasts por defecto.
const OPCIONES_TOAST = { position: "top-center" } as const;

const ESTADO_OFICIAL: Record<
  NonNullable<OficialResponse["estatus"]>,
  { etiqueta: string; tono: TonoEstado }
> = {
  ACTIVO: { etiqueta: "Vigente", tono: "ok" },
  INACTIVO: { etiqueta: "Inactivo", tono: "neutro" },
  BLOQUEADO: { etiqueta: "Bloqueado", tono: "error" },
};

export function OficialCumplimientoForm({
  usuario,
  domicilio,
  oficial,
  selector,
}: {
  usuario: UsuarioResponse;
  domicilio: DomicilioUsuarioResponse | null;
  oficial: OficialResponse | null;
  selector?: ReactNode;
}) {
  const guardar = useGuardarOficialCumplimiento(usuario.idUsuario ?? 0);
  const form = useForm<OficialCumplimientoFormValues>({
    resolver: zodResolver(oficialCumplimientoSchema),
    defaultValues: valoresIniciales(usuario, domicilio, oficial),
  });
  const { isDirty } = form.formState;

  const actualizado = ultimaActualizacion([
    usuario.updatedAt,
    domicilio?.updatedAt,
    oficial?.updatedAt,
  ]);
  const estado = oficial?.estatus
    ? ESTADO_OFICIAL[oficial.estatus]
    : { etiqueta: "Sin parámetros PLD", tono: "aviso" as const };

  function onSubmit(values: OficialCumplimientoFormValues) {
    guardar.mutate(
      {
        usuario: aUsuarioPayload(values, usuario.sucursalId),
        domicilio: aDomicilioPayload(values),
        oficial: aOficialPayload(values),
      },
      {
        onSuccess: () => {
          toast.success("Datos del oficial guardados correctamente", OPCIONES_TOAST);
          form.reset(values);
        },
        onError: () => {
          toast.error("No se pudieron guardar los datos del oficial", OPCIONES_TOAST);
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <EncabezadoOficial
        estado={
          <EstadoOficial
            etiqueta={isDirty ? `${estado.etiqueta} / En edición` : estado.etiqueta}
            tono={estado.tono}
          />
        }
      />
      {selector}
      <AvisoCumplimiento />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, () =>
            toast.error("Revisa los campos marcados en rojo", OPCIONES_TOAST),
          )}
          className="space-y-6"
        >
          <SeccionDatosGenerales
            form={form}
            idRegistro={usuario.idUsuario !== undefined ? String(usuario.idUsuario) : undefined}
          />
          <SeccionDomicilio form={form} />
          <SeccionParametrosPld form={form} />

          <div className="sticky bottom-0 z-10 -mx-6 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card/95 px-6 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur">
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="size-4 text-muted-foreground/70" />
              {actualizado ? (
                <span>
                  Última actualización:{" "}
                  <strong className="text-foreground">
                    {new Date(actualizado).toLocaleString("es-MX")}
                  </strong>
                </span>
              ) : (
                "Aún no hay información guardada"
              )}
            </p>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="border-border text-xs font-semibold text-foreground"
                disabled={!isDirty || guardar.isPending}
                onClick={() => form.reset()}
              >
                <RotateCcw />
                Descartar cambios
              </Button>
              <Button
                type="submit"
                disabled={!isDirty || guardar.isPending}
                className="min-w-[150px] font-semibold shadow-md"
              >
                <CircleCheck />
                {guardar.isPending ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
