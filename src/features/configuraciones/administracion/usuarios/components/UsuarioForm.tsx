import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Button } from "@/shared/components/ui/button";
import { Form } from "@/shared/components/ui/form";
import {
  useActualizarUsuarioCompleto,
  useCrearUsuarioCompleto,
} from "@/features/configuraciones/administracion/usuarios/hooks/useUsuarios";
import { useRoles } from "@/features/configuraciones/administracion/roles/hooks/useRoles";
import { esRolOficial } from "@/features/configuraciones/administracion/usuarios/utils/usuarios";
import {
  crearUsuarioSchema,
  editarUsuarioSchema,
  PASO1_CAMPOS,
  PASO2_CAMPOS,
  type CrearUsuarioFormValues,
} from "@/features/configuraciones/administracion/usuarios/types/usuarioSchema";
import type {
  ActualizarUsuarioRequest,
  CrearUsuarioRequest,
  DomicilioUsuarioRequest,
  OficialRequest,
  UsuarioResponse,
} from "@/features/configuraciones/administracion/usuarios/types/usuarios";
import { DatosGeneralesStep } from "@/features/configuraciones/administracion/usuarios/components/steps/DatosGeneralesStep";
import { DomicilioStep } from "@/features/configuraciones/administracion/usuarios/components/steps/DomicilioStep";
import { TipoUsuarioStep } from "@/features/configuraciones/administracion/usuarios/components/steps/TipoUsuarioStep";

const CAMPOS_OFICIAL_REQUERIDOS = [
  { campo: "tipoPersona", mensaje: "El tipo de persona es obligatorio" },
  { campo: "claveDelSujetoObligado", mensaje: "La clave del sujeto obligado es obligatoria" },
  { campo: "claveOrganoSuperior", mensaje: "La clave del órgano supervisor es obligatoria" },
] as const;

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
    rolId: Number(values.rolId),
    nombre: values.nombre,
    primerApellido: aTextoOIndefinido(values.primerApellido),
    segundoApellido: aTextoOIndefinido(values.segundoApellido),
    nacionalidad: aTextoOIndefinido(values.nacionalidad) as CrearUsuarioRequest["nacionalidad"],
    paisNacimientoId: aTextoOIndefinido(values.paisNacimientoId),
    entidadNacimientoId: aTextoOIndefinido(values.entidadNacimientoId),
    lugarDeNacimiento: aTextoOIndefinido(values.lugarDeNacimiento),
    fechaNacimiento: aTextoOIndefinido(values.fechaNacimiento),
    genero: aTextoOIndefinido(values.genero),
    rfc: aTextoOIndefinido(values.rfc),
    curp: aTextoOIndefinido(values.curp),
    estadoCivil: aTextoOIndefinido(values.estadoCivil) as CrearUsuarioRequest["estadoCivil"],
    numDependientes: aNumeroOIndefinido(values.numDependientes),
    nivelEstudios: aTextoOIndefinido(values.nivelEstudios) as CrearUsuarioRequest["nivelEstudios"],
    tipoIdentificacion: aTextoOIndefinido(
      values.tipoIdentificacion,
    ) as CrearUsuarioRequest["tipoIdentificacion"],
    folioIdentificacion: aTextoOIndefinido(values.folioIdentificacion),
    telefono: aTextoOIndefinido(values.telefono),
    correo: aTextoOIndefinido(values.correo),
  };
}

/** Datos personales para el PUT: sin username, contraseña ni rol (tienen su propia operación). */
function aActualizarPayload(values: CrearUsuarioFormValues): ActualizarUsuarioRequest {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { username, password, rolId, ...datosPersonales } = aUsuarioPayload(values);
  return datosPersonales;
}

function aOficialPayload(values: CrearUsuarioFormValues): OficialRequest {
  return {
    tipoPersona: values.tipoPersona ?? "",
    claveDelOficialDeCumplimiento: aTextoOIndefinido(values.claveDelOficialDeCumplimiento),
    claveDelSujetoObligado: values.claveDelSujetoObligado ?? "",
    claveOrganoSuperior: values.claveOrganoSuperior ?? "",
    monedaDeOperacionPrincipal: aTextoOIndefinido(values.monedaDeOperacionPrincipal),
    actividadEconomicaId: aTextoOIndefinido(values.actividadEconomicaId),
  };
}

function aDomicilioPayload(values: CrearUsuarioFormValues): DomicilioUsuarioRequest {
  return {
    tipoComprobante: aTextoOIndefinido(
      values.tipoComprobante,
    ) as DomicilioUsuarioRequest["tipoComprobante"],
    tipoVialidad: aTextoOIndefinido(
      values.tipoVialidad,
    ) as DomicilioUsuarioRequest["tipoVialidad"],
    calle: aTextoOIndefinido(values.calle),
    numExterior: aTextoOIndefinido(values.numExterior),
    numInterior: aTextoOIndefinido(values.numInterior),
    nombreCalleIzquierda: aTextoOIndefinido(values.nombreCalleIzquierda),
    nombreCalleDerecha: aTextoOIndefinido(values.nombreCalleDerecha),
    referencia: aTextoOIndefinido(values.referencia),
    posesionVivienda: aTextoOIndefinido(
      values.posesionVivienda,
    ) as DomicilioUsuarioRequest["posesionVivienda"],
    antiguedadDomicilio: aTextoOIndefinido(values.antiguedadDomicilio),
    codigoPostal: aTextoOIndefinido(values.codigoPostal),
    tipoAsentamiento: aTextoOIndefinido(values.tipoAsentamiento),
    colonia: aTextoOIndefinido(values.colonia),
    paisId: values.domicilioPaisId,
    entidadId: values.domicilioEntidadId,
    municipioId: values.municipioId,
    localidadId: values.localidadId,
  };
}

export function UsuarioForm({
  onCreado,
  edicion,
}: {
  onCreado?: () => void;
  /** Usuario a editar con sus valores ya cargados; sin esto el formulario da de alta. */
  edicion?: { usuario: UsuarioResponse; valores: CrearUsuarioFormValues };
}) {
  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const crearUsuarioCompleto = useCrearUsuarioCompleto();
  const actualizarUsuarioCompleto = useActualizarUsuarioCompleto();
  const guardando = crearUsuarioCompleto.isPending || actualizarUsuarioCompleto.isPending;
  const { data: roles } = useRoles();

  const form = useForm<CrearUsuarioFormValues>({
    // En edición la contraseña no se valida: el esquema de edición la deja opcional.
    resolver: edicion
      ? (zodResolver(editarUsuarioSchema) as unknown as Resolver<CrearUsuarioFormValues>)
      : zodResolver(crearUsuarioSchema),
    defaultValues: edicion?.valores ?? {
      username: "",
      password: "",
      confirmarPassword: "",
      correo: "",
      telefono: "",
      nombre: "",
      primerApellido: "",
      segundoApellido: "",
      nacionalidad: "",
      paisNacimientoId: "",
      entidadNacimientoId: "",
      lugarDeNacimiento: "",
      fechaNacimiento: "",
      genero: "",
      rfc: "",
      curp: "",
      estadoCivil: "",
      numDependientes: "",
      nivelEstudios: "",
      tipoIdentificacion: "",
      folioIdentificacion: "",
      tipoComprobante: "",
      tipoVialidad: "",
      calle: "",
      numExterior: "",
      numInterior: "",
      nombreCalleIzquierda: "",
      nombreCalleDerecha: "",
      referencia: "",
      posesionVivienda: "",
      antiguedadDomicilio: "",
      codigoPostal: "",
      tipoAsentamiento: "",
      colonia: "",
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

  async function irAPaso2() {
    if (await form.trigger(PASO1_CAMPOS)) setPaso(2);
  }

  async function irAPaso3() {
    if (await form.trigger(PASO2_CAMPOS)) setPaso(3);
  }

  function onSubmit(values: CrearUsuarioFormValues) {
    const esOficial = esRolOficial(roles, values.rolId);
    if (esOficial) {
      let faltaAlgo = false;
      for (const { campo, mensaje } of CAMPOS_OFICIAL_REQUERIDOS) {
        if (!values[campo]) {
          form.setError(campo, { message: mensaje });
          faltaAlgo = true;
        }
      }
      if (faltaAlgo) {
        toast.error("Revisa los parámetros del oficial de cumplimiento");
        return;
      }
    }

    const avisarError = (error: Error) => {
      // AppError trae el detail del backend; en un 400 de validación, los campos rechazados.
      const campos =
        isAppError(error) && error.invalidParams
          ? Object.entries(error.invalidParams).map(([campo, mensaje]) => `${campo}: ${mensaje}`)
          : [];
      toast.error(edicion ? "No se pudieron guardar los cambios" : "No se pudo crear el usuario", {
        description: campos.length > 0 ? campos.join(" · ") : error.message,
      });
    };

    if (edicion) {
      const id = edicion.usuario.idUsuario!;
      const rolNuevo = Number(values.rolId);
      actualizarUsuarioCompleto.mutate(
        {
          id,
          usuario: aActualizarPayload(values),
          rolId: rolNuevo !== edicion.usuario.rolId ? rolNuevo : undefined,
          domicilio: aDomicilioPayload(values),
          oficial: esOficial ? aOficialPayload(values) : undefined,
        },
        {
          onSuccess: () => {
            toast.success("Usuario actualizado correctamente");
            onCreado?.();
          },
          onError: avisarError,
        },
      );
      return;
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
          onCreado?.();
        },
        onError: avisarError,
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
        {paso === 1 && <DatosGeneralesStep form={form} edicion={Boolean(edicion)} />}
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
            <Button type="submit" disabled={guardando}>
              {guardando ? "Guardando…" : edicion ? "Guardar cambios" : "Guardar"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
