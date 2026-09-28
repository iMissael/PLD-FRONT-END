import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Form } from "@/shared/components/ui/form";
import { useCrearUsuarioCompleto } from "@/features/configuraciones/administracion/usuarios/hooks/useUsuarios";
import { useRoles } from "@/features/configuraciones/administracion/roles/hooks/useRoles";
import {
  crearUsuarioSchema,
  PASO1_CAMPOS,
  PASO2_CAMPOS,
  type CrearUsuarioFormValues,
} from "@/features/configuraciones/administracion/usuarios/types/usuarioSchema";
import type {
  CrearUsuarioRequest,
  DomicilioUsuarioRequest,
  OficialRequest,
} from "@/features/configuraciones/administracion/usuarios/types/usuarios";
import { DatosGeneralesStep } from "@/features/configuraciones/administracion/usuarios/components/steps/DatosGeneralesStep";
import { DomicilioStep } from "@/features/configuraciones/administracion/usuarios/components/steps/DomicilioStep";
import { TipoUsuarioStep } from "@/features/configuraciones/administracion/usuarios/components/steps/TipoUsuarioStep";
import { esRolOficial } from "@/features/configuraciones/administracion/usuarios/utils/usuarios";

const PASOS = [
  { numero: 1, titulo: "Datos generales" },
  { numero: 2, titulo: "Domicilio" },
  { numero: 3, titulo: "Tipo" },
] as const;

function aNumeroOIndefinido(valor: string | undefined) {
  if (!valor) return undefined;
  const numero = Number(valor);
  return Number.isNaN(numero) ? undefined : numero;
}

function aTextoOIndefinido(valor: string | undefined) {
  return valor ? valor : undefined;
}

function aUsuarioPayload(values: CrearUsuarioFormValues): CrearUsuarioRequest {
  return {
    username: values.username,
    password: values.password,
    nombre: values.nombre,
    correo: values.correo,
    telefono: aTextoOIndefinido(values.telefono),
    primerApellido: aTextoOIndefinido(values.primerApellido),
    segundoApellido: aTextoOIndefinido(values.segundoApellido),
    nacionalidadId: values.nacionalidadId,
    paisNacimientoId: aTextoOIndefinido(values.paisNacimientoId),
    entidadNacimientoId: aTextoOIndefinido(values.entidadNacimientoId),
    lugarDeNacimiento: aTextoOIndefinido(values.lugarDeNacimiento),
    fechaNacimiento: aTextoOIndefinido(values.fechaNacimiento),
    genero: aTextoOIndefinido(values.genero),
    rfc: aTextoOIndefinido(values.rfc),
    curp: aTextoOIndefinido(values.curp),
    estadoCivilId: aTextoOIndefinido(values.estadoCivilId),
    numDependientes: aNumeroOIndefinido(values.numDependientes),
    nivelEstudiosId: aTextoOIndefinido(values.nivelEstudiosId),
    tipoIdentificacionId: aTextoOIndefinido(values.tipoIdentificacionId),
    folioIdentificacion: aTextoOIndefinido(values.folioIdentificacion),
    rolId: values.rolId,
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

function aOficialPayload(values: CrearUsuarioFormValues): OficialRequest {
  return {
    tipoPersona: values.tipoPersona ?? "",
    claveDelOficialDeCumplimiento: aTextoOIndefinido(
      values.claveDelOficialDeCumplimiento,
    ),
    claveDelSujetoObligado: values.claveDelSujetoObligado ?? "",
    claveOrganoSuperior: values.claveOrganoSuperior ?? "",
    monedaDeOperacionPrincipal: aTextoOIndefinido(values.monedaDeOperacionPrincipal),
    actividadEconomicaId: aTextoOIndefinido(values.actividadEconomicaId),
  };
}

export function UsuarioForm() {
  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const crearUsuarioCompleto = useCrearUsuarioCompleto();
  const { data: roles } = useRoles();

  const form = useForm<CrearUsuarioFormValues>({
    resolver: zodResolver(crearUsuarioSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmarPassword: "",
      nombre: "",
      primerApellido: "",
      segundoApellido: "",
      correo: "",
      telefono: "",
      nacionalidadId: "",
      paisNacimientoId: "",
      entidadNacimientoId: "",
      lugarDeNacimiento: "",
      fechaNacimiento: "",
      genero: "",
      rfc: "",
      curp: "",
      estadoCivilId: "",
      numDependientes: "",
      nivelEstudiosId: "",
      tipoIdentificacionId: "",
      folioIdentificacion: "",
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
      rolId: "",
      tipoPersona: "",
      claveDelOficialDeCumplimiento: "",
      claveDelSujetoObligado: "",
      claveOrganoSuperior: "",
      monedaDeOperacionPrincipal: "",
      actividadEconomicaId: "",
    },
  });

  const rolSeleccionado = useWatch({ control: form.control, name: "rolId" });
  const esOficial = useMemo(
    () => esRolOficial(roles, rolSeleccionado),
    [roles, rolSeleccionado],
  );

  async function irAPaso2() {
    if (await form.trigger(PASO1_CAMPOS)) setPaso(2);
  }

  async function irAPaso3() {
    if (await form.trigger(PASO2_CAMPOS)) setPaso(3);
  }

  function onSubmit(values: CrearUsuarioFormValues) {
    if (esOficial) {
      let valido = true;
      if (!values.tipoPersona) {
        form.setError("tipoPersona", { message: "El tipo de persona es obligatorio" });
        valido = false;
      }
      if (!values.claveDelSujetoObligado) {
        form.setError("claveDelSujetoObligado", {
          message: "La clave del sujeto obligado es obligatoria",
        });
        valido = false;
      }
      if (!values.claveOrganoSuperior) {
        form.setError("claveOrganoSuperior", {
          message: "La clave del órgano superior es obligatoria",
        });
        valido = false;
      }
      if (!valido) return;
    }

    crearUsuarioCompleto.mutate(
      {
        usuario: aUsuarioPayload(values),
        domicilio: aDomicilioPayload(values),
        oficial: esOficial ? aOficialPayload(values) : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Usuario creado correctamente");
          form.reset();
          setPaso(1);
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
        {paso === 3 && <TipoUsuarioStep form={form} />}

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPaso((p) => (p - 1) as 1 | 2 | 3)}
            disabled={paso === 1}
          >
            Atrás
          </Button>
          {paso < 3 ? (
            <Button type="button" onClick={paso === 1 ? irAPaso2 : irAPaso3}>
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
