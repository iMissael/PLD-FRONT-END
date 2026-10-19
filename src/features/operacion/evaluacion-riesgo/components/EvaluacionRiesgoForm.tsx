import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Button } from "@/shared/components/atoms/Button";
import { Form } from "@/shared/components/molecules/Form";
import {
  useActividadesEconomicas,
  useCanalesPago,
  useDestinosRecurso,
  useEntidades,
  useLocalidades,
  useMunicipios,
  useOrigenesRecurso,
  usePaises,
  usePeps,
  useTiposAsentamiento,
  useTiposCredito,
  useTiposPago,
  useTiposPersona,
} from "@/features/catalogos/hooks/useCatalogos";
import { useEvaluarRiesgo } from "@/features/operacion/evaluacion-riesgo/hooks/useEvaluacionRiesgo";
import type { ClienteMatrizRiesgo } from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgo";
import {
  evaluacionRiesgoSchema,
  type EvaluacionRiesgoFormValues,
} from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgoSchema";
import type { EvaluacionRiesgoResultado } from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgo";
import {
  construirDetalles,
  type DetallesSubfactor,
} from "@/features/operacion/evaluacion-riesgo/utils/detalleSubfactor";
import {
  aNumeroOIndefinido,
  construirCliente,
  construirSolicitud,
  MONEDA_POR_DEFECTO,
} from "@/features/operacion/evaluacion-riesgo/utils/solicitud";
import { useAuthStore } from "@/shared/auth/authStore";
import { FormSeccionIdentificacion } from "./form/FormSeccionIdentificacion";
import { FormSeccionDomicilio } from "./form/FormSeccionDomicilio";
import { FormSeccionCredito } from "./form/FormSeccionCredito";
import { FormSeccionHistorial } from "./form/FormSeccionHistorial";

const valoresPorDefecto: EvaluacionRiesgoFormValues = {
  acreditadoReferencia: "",
  acreditadoNombre: "",
  acreditadoNombres: "",
  acreditadoApellidoP: "",
  acreditadoApellidoM: "",
  rfc: "",
  curp: "",
  tipoPersonaId: "",
  nacionalidadId: "",
  fechaNacimiento: "",
  antiguedadGiroAnios: "",
  pepNacionalId: "",
  actividadEconomicaId: "",
  paisId: "",
  entidadId: "",
  municipioId: "",
  localidadId: "",
  calle: "",
  tipoCalle: "",
  noExterior: "",
  noInterior: "",
  codigoPostal: "",
  asentamientoTipo: "",
  asentamientoNombre: "",
  creditoReferencia: "",
  creditoTipo: "",
  monto: "",
  moneda: MONEDA_POR_DEFECTO,
  origenRecursos: "",
  destinoRecursos: "",
  canalPagoId: "",
  tipoPagoId: "",
  ebrSoluciones: "",
  creditosAnteriores: [],
};

export function EvaluacionRiesgoForm({
  onResultado,
  acreditadoInicial,
}: {
  onResultado: (
    resultado: EvaluacionRiesgoResultado,
    cliente: ClienteMatrizRiesgo,
    detalles: DetallesSubfactor,
  ) => void;
  acreditadoInicial?: { id: string; nombre: string };
}) {
  const [enviando, setEnviando] = useState(false);
  const evaluarRiesgo = useEvaluarRiesgo();

  const { data: tiposPersona } = useTiposPersona();
  const { data: peps } = usePeps();
  const { data: actividadesEconomicas } = useActividadesEconomicas();
  const { data: paises } = usePaises();
  const { data: entidades } = useEntidades();
  const { data: tiposAsentamiento } = useTiposAsentamiento();
  const { data: tiposCredito } = useTiposCredito();
  const { data: origenesRecurso } = useOrigenesRecurso();
  const { data: destinosRecurso } = useDestinosRecurso();
  const { data: canalesPago } = useCanalesPago();
  const { data: tiposPago } = useTiposPago();

  const form = useForm<EvaluacionRiesgoFormValues>({
    resolver: zodResolver(evaluacionRiesgoSchema),
    defaultValues: valoresPorDefecto,
  });
  const { control } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "creditosAnteriores",
  });

  const paisSeleccionado = useWatch({ control, name: "paisId" });
  const entidadSeleccionada = useWatch({ control, name: "entidadId" });
  const municipioSeleccionado = useWatch({ control, name: "municipioId" });
  const canalPagoSeleccionado = useWatch({ control, name: "canalPagoId" });

  const entidadesDelPais = useMemo(() => {
    if (!entidades) return [];
    if (!paisSeleccionado) return entidades;
    return entidades.filter((entidad) => String(entidad.idPais) === paisSeleccionado);
  }, [entidades, paisSeleccionado]);

  const { data: municipios } = useMunicipios(aNumeroOIndefinido(entidadSeleccionada));
  const { data: localidades } = useLocalidades(aNumeroOIndefinido(municipioSeleccionado));

  const tiposPagoDelCanal = useMemo(() => {
    if (!tiposPago) return [];
    if (!canalPagoSeleccionado) return tiposPago;
    return tiposPago.filter(
      (tipo) => String(tipo.catCanalPagoId ?? "") === canalPagoSeleccionado,
    );
  }, [tiposPago, canalPagoSeleccionado]);

  function onSubmit(values: EvaluacionRiesgoFormValues) {
    const verificadoPor = useAuthStore.getState().usuario?.id;

    if (!verificadoPor) {
      toast.error("No se pudo determinar el usuario.");
      return;
    }

    const payload = construirSolicitud(values, { verificadoPor: String(verificadoPor) });

    const tipoPersonaSeleccionado = tiposPersona?.find(
      (t) => String(t.id) === values.tipoPersonaId,
    );
    const cliente = construirCliente(values, tipoPersonaSeleccionado?.nombre, undefined);

    const detalles = construirDetalles(values, {
      tiposPersona,
      paises,
      peps,
      actividades: actividadesEconomicas,
      tiposCredito,
      origenes: origenesRecurso,
      destinos: destinosRecurso,
      canales: canalesPago,
      nombreLocalidad: localidades?.find(
        (localidad) => String(localidad.idLocalidad) === values.localidadId,
      )?.nombre,
    });

    setEnviando(true);
    evaluarRiesgo.mutate(payload, {
      onSuccess: (resultado) => {
        onResultado(resultado, cliente, detalles);
        toast.success("Evaluación de riesgo generada correctamente");
      },
      onError: (error) =>
        toast.error(
          isAppError(error)
            ? error.message
            : "No se pudo completar la evaluación de riesgo",
        ),
      onSettled: () => setEnviando(false),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormSeccionIdentificacion
          form={form}
          acreditadoInicial={acreditadoInicial}
          tiposPersona={tiposPersona}
          paises={paises}
          peps={peps}
          actividadesEconomicas={actividadesEconomicas}
        />

        <FormSeccionDomicilio
          form={form}
          paises={paises}
          entidadesDelPais={entidadesDelPais}
          municipios={municipios}
          localidades={localidades}
          tiposAsentamiento={tiposAsentamiento}
        />

        <FormSeccionCredito
          form={form}
          tiposCredito={tiposCredito}
          origenesRecurso={origenesRecurso}
          destinosRecurso={destinosRecurso}
          canalesPago={canalesPago}
          tiposPagoDelCanal={tiposPagoDelCanal}
        />

        <FormSeccionHistorial
          form={form}
          fields={fields}
          append={append}
          remove={remove}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={enviando}>
            {enviando ? "Evaluando…" : "Evaluar riesgo"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
