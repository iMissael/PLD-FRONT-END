import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  Clock,
  MapPin,
  RotateCcw,
  ShieldCheck,
  UserRound,
} from "lucide-react";
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

type PestanaId = "generales" | "domicilio" | "pld";

const CAMPOS_GENERALES = [
  "nombre",
  "apellidoPaterno",
  "apellidoMaterno",
  "curp",
  "rfc",
  "fechaNacimiento",
  "genero",
  "telefonoPrincipal",
  "telefonoMovil",
  "correoElectronico",
  "nacionalidad",
];

const CAMPOS_DOMICILIO = [
  "tipoComprobante",
  "tipoVialidad",
  "calle",
  "numExterior",
  "numInterior",
  "nombreCalleIzquierda",
  "nombreCalleDerecha",
  "referencia",
  "posesionVivienda",
  "antiguedadDomicilio",
  "codigoPostal",
  "tipoAsentamiento",
  "colonia",
  "domicilioPaisId",
  "domicilioEntidadId",
  "municipioId",
  "localidadId",
  "latitud",
  "longitud",
];

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
  const [pestanaActiva, setPestanaActiva] = useState<PestanaId>("generales");
  const guardar = useGuardarOficialCumplimiento(usuario.idUsuario ?? 0);
  const form = useForm<OficialCumplimientoFormValues>({
    resolver: zodResolver(oficialCumplimientoSchema),
    defaultValues: valoresIniciales(usuario, domicilio, oficial),
  });
  const { isDirty, errors } = form.formState;

  const actualizado = ultimaActualizacion([
    usuario.updatedAt,
    domicilio?.updatedAt,
    oficial?.updatedAt,
  ]);
  const estado = oficial?.estatus
    ? ESTADO_OFICIAL[oficial.estatus]
    : { etiqueta: "Sin parámetros PLD", tono: "aviso" as const };

  const tieneErrorGenerales = Object.keys(errors).some((campo) =>
    CAMPOS_GENERALES.includes(campo),
  );
  const tieneErrorDomicilio = Object.keys(errors).some((campo) =>
    CAMPOS_DOMICILIO.includes(campo),
  );
  const tieneErrorPld = Object.keys(errors).some(
    (campo) => !CAMPOS_GENERALES.includes(campo) && !CAMPOS_DOMICILIO.includes(campo),
  );

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

      {/* Selector de pestañas para dividir el formulario largo (UI-002) */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setPestanaActiva("generales")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            pestanaActiva === "generales"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <UserRound className="size-4" />
          <span>1. Datos Generales</span>
          {tieneErrorGenerales && (
            <AlertCircle className="size-3.5 text-destructive animate-pulse" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setPestanaActiva("domicilio")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            pestanaActiva === "domicilio"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <MapPin className="size-4" />
          <span>2. Domicilio y Ubicación</span>
          {tieneErrorDomicilio && (
            <AlertCircle className="size-3.5 text-destructive animate-pulse" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setPestanaActiva("pld")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            pestanaActiva === "pld"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <ShieldCheck className="size-4" />
          <span>3. Parámetros PLD</span>
          {tieneErrorPld && (
            <AlertCircle className="size-3.5 text-destructive animate-pulse" />
          )}
        </button>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (err) => {
            const errKeys = Object.keys(err);
            if (errKeys.some((k) => CAMPOS_GENERALES.includes(k))) {
              setPestanaActiva("generales");
            } else if (errKeys.some((k) => CAMPOS_DOMICILIO.includes(k))) {
              setPestanaActiva("domicilio");
            } else {
              setPestanaActiva("pld");
            }
            toast.error("Revisa los campos marcados en rojo", OPCIONES_TOAST);
          })}
          className="space-y-6"
        >
          {pestanaActiva === "generales" && (
            <div className="space-y-4">
              <SeccionDatosGenerales
                form={form}
                idRegistro={usuario.idUsuario !== undefined ? String(usuario.idUsuario) : undefined}
              />
              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPestanaActiva("domicilio")}
                  className="flex items-center gap-1.5"
                >
                  Siguiente: Domicilio
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {pestanaActiva === "domicilio" && (
            <div className="space-y-4">
              <SeccionDomicilio form={form} />
              <div className="flex justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPestanaActiva("generales")}
                  className="flex items-center gap-1.5"
                >
                  <ArrowLeft className="size-4" />
                  Anterior: Datos Generales
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPestanaActiva("pld")}
                  className="flex items-center gap-1.5"
                >
                  Siguiente: Parámetros PLD
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {pestanaActiva === "pld" && (
            <div className="space-y-4">
              <SeccionParametrosPld form={form} />
              <div className="flex justify-start pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPestanaActiva("domicilio")}
                  className="flex items-center gap-1.5"
                >
                  <ArrowLeft className="size-4" />
                  Anterior: Domicilio
                </Button>
              </div>
            </div>
          )}

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
