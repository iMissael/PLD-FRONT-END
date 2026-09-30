import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Form } from "@/shared/components/ui/form";
import { useCrearUsuarioCompleto } from "@/features/configuraciones/administracion/usuarios/hooks/useUsuarios";
import {
  crearUsuarioSchema,
  PASO1_CAMPOS,
  type CrearUsuarioFormValues,
} from "@/features/configuraciones/administracion/usuarios/types/usuarioSchema";
import type {
  CrearUsuarioRequest,
  DomicilioUsuarioRequest,
} from "@/features/configuraciones/administracion/usuarios/types/usuarios";
import { DatosGeneralesStep } from "@/features/configuraciones/administracion/usuarios/components/steps/DatosGeneralesStep";
import { DomicilioStep } from "@/features/configuraciones/administracion/usuarios/components/steps/DomicilioStep";

const PASOS = [
  { numero: 1, titulo: "Datos de acceso" },
  { numero: 2, titulo: "Domicilio" },
] as const;

function aTextoOIndefinido(valor: string | undefined) {
  return valor ? valor : undefined;
}

function aUsuarioPayload(values: CrearUsuarioFormValues): CrearUsuarioRequest {
  return {
    empleadoId: Number(values.empleadoId),
    username: values.username,
    password: values.password,
    rolId: Number(values.rolId),
  };
}

function aDomicilioPayload(values: CrearUsuarioFormValues): DomicilioUsuarioRequest {
  return {
    tipoComprobanteId: aTextoOIndefinido(values.tipoComprobanteId),
    tipoVialidadId: aTextoOIndefinido(values.tipoVialidadId),
    calle: aTextoOIndefinido(values.calle),
    numExterior: aTextoOIndefinido(values.numExterior),
    numInterior: aTextoOIndefinido(values.numInterior),
    nombreCalleIzquierda: aTextoOIndefinido(values.nombreCalleIzquierda),
    nombreCalleDerecha: aTextoOIndefinido(values.nombreCalleDerecha),
    referencia: aTextoOIndefinido(values.referencia),
    laCasaEsId: aTextoOIndefinido(values.laCasaEsId),
    antiguedadDomicilio: aTextoOIndefinido(values.antiguedadDomicilio),
    codigoPostal: aTextoOIndefinido(values.codigoPostal),
    tipoAsentamiento: aTextoOIndefinido(values.tipoAsentamiento),
    colonia: aTextoOIndefinido(values.colonia),
    latitud: aTextoOIndefinido(values.latitud),
    longitud: aTextoOIndefinido(values.longitud),
    paisId: values.domicilioPaisId,
    entidadId: values.domicilioEntidadId,
    municipioId: values.municipioId,
    localidadId: values.localidadId,
  };
}

export function UsuarioForm({ onCreado }: { onCreado?: () => void }) {
  const [paso, setPaso] = useState<1 | 2>(1);
  const crearUsuarioCompleto = useCrearUsuarioCompleto();

  const form = useForm<CrearUsuarioFormValues>({
    resolver: zodResolver(crearUsuarioSchema),
    defaultValues: {
      empleadoId: "",
      username: "",
      password: "",
      confirmarPassword: "",
      rolId: "",
      tipoComprobanteId: "",
      tipoVialidadId: "",
      calle: "",
      numExterior: "",
      numInterior: "",
      nombreCalleIzquierda: "",
      nombreCalleDerecha: "",
      referencia: "",
      laCasaEsId: "",
      antiguedadDomicilio: "",
      codigoPostal: "",
      tipoAsentamiento: "",
      colonia: "",
      latitud: "",
      longitud: "",
      domicilioPaisId: "",
      domicilioEntidadId: "",
      municipioId: "",
      localidadId: "",
    },
  });

  async function irAPaso2() {
    if (await form.trigger(PASO1_CAMPOS)) setPaso(2);
  }

  function onSubmit(values: CrearUsuarioFormValues) {
    crearUsuarioCompleto.mutate(
      {
        usuario: aUsuarioPayload(values),
        domicilio: aDomicilioPayload(values),
      },
      {
        onSuccess: () => {
          toast.success("Usuario creado correctamente");
          form.reset();
          setPaso(1);
          onCreado?.();
        },
        onError: () => {
          toast.error("No se pudo crear el usuario");
        },
      },
    );
  }

  return (
    <Form {...form}>
      <nav aria-label="Progreso del alta" className="mb-6 flex items-center gap-3">
        {PASOS.map((item, index) => (
          <div key={item.numero} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium " +
                  (paso === item.numero
                    ? "bg-primary text-primary-foreground"
                    : paso > item.numero
                      ? "bg-success text-white"
                      : "bg-muted text-muted-foreground")
                }
              >
                {item.numero}
              </span>
              <span
                className={
                  paso === item.numero
                    ? "text-sm font-medium"
                    : "text-muted-foreground text-sm"
                }
              >
                {item.titulo}
              </span>
            </div>
            {index < PASOS.length - 1 && <div className="bg-border h-px w-8" />}
          </div>
        ))}
      </nav>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {paso === 1 && <DatosGeneralesStep form={form} />}
        {paso === 2 && <DomicilioStep form={form} />}

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPaso(1)}
            disabled={paso === 1}
          >
            Atrás
          </Button>
          {paso < 2 ? (
            <Button type="button" onClick={irAPaso2}>
              Siguiente
            </Button>
          ) : (
            <Button type="submit" disabled={crearUsuarioCompleto.isPending}>
              {crearUsuarioCompleto.isPending ? "Creando…" : "Guardar"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
