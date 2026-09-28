import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
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
import { SocioBuscadorEvaluacion } from "@/features/operacion/evaluacion-riesgo/components/SocioBuscadorEvaluacion";
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
import { useSucursalActivaStore } from "@/shared/auth/sucursalActivaStore";

const EBR_OPCIONES = [
  { value: "BAJO", label: "Bajo" },
  { value: "MEDIO_BAJO", label: "Medio bajo" },
  { value: "MEDIO", label: "Medio" },
  { value: "MEDIO_ALTO", label: "Medio alto" },
  { value: "ALTO", label: "Alto" },
];

const valoresPorDefecto: EvaluacionRiesgoFormValues = {
  socioReferencia: "",
  socioNombre: "",
  socioNombres: "",
  socioApellidoP: "",
  socioApellidoM: "",
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
  latitud: "",
  longitud: "",
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
  socioInicial,
}: {
  onResultado: (
    resultado: EvaluacionRiesgoResultado,
    cliente: ClienteMatrizRiesgo,
    detalles: DetallesSubfactor,
  ) => void;
  socioInicial?: { id: string; nombre: string };
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
    return entidades.filter((entidad) => entidad.idPais === paisSeleccionado);
  }, [entidades, paisSeleccionado]);

  const { data: municipios } = useMunicipios(aNumeroOIndefinido(entidadSeleccionada));
  const { data: localidades } = useLocalidades(aNumeroOIndefinido(municipioSeleccionado));

  const tiposPagoDelCanal = useMemo(() => {
    if (!tiposPago) return [];
    if (!canalPagoSeleccionado) return tiposPago;
    return tiposPago.filter(
      (tipo) => String(tipo.cat_canal_pago_id ?? "") === canalPagoSeleccionado,
    );
  }, [tiposPago, canalPagoSeleccionado]);

  function onSubmit(values: EvaluacionRiesgoFormValues) {
    const sucursalId = useSucursalActivaStore.getState().sucursalActiva?.id;
    const verificadoPor = useAuthStore.getState().usuario?.id;

    if (!sucursalId || !verificadoPor) {
      toast.error("No se pudo determinar el usuario o la sucursal activa.");
      return;
    }

    const payload = construirSolicitud(values, { sucursalId, verificadoPor });

    const tipoPersonaSeleccionado = tiposPersona?.find(
      (t) => t.id === values.tipoPersonaId,
    );
    const cliente = construirCliente(
      values,
      tipoPersonaSeleccionado?.nombre,
      useSucursalActivaStore.getState().sucursalActiva?.nombre,
    );

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
      onError: () => toast.error("No se pudo completar la evaluación de riesgo"),
      onSettled: () => setEnviando(false),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold">Socio</legend>
          <div className="space-y-2">
            <FormLabel>Socio</FormLabel>
            <SocioBuscadorEvaluacion form={form} socioInicial={socioInicial} />
            <p className="text-muted-foreground text-xs">
              Busca al socio para traer sus datos automáticamente: identidad, actividad
              económica, domicilio, antigüedad en el giro y su crédito solicitado con su
              historial. Captura solo lo que falte.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={control}
              name="rfc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RFC</FormLabel>
                  <FormControl>
                    <Input placeholder="PEGJ800101ABC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="curp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CURP</FormLabel>
                  <FormControl>
                    <Input placeholder="PEGJ800101HDFRZN01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="tipoPersonaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de persona</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tiposPersona?.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id ?? ""}>
                          {tipo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="nacionalidadId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nacionalidad</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un país" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paises?.map((pais) => (
                        <SelectItem key={pais.idPais} value={pais.idPais ?? ""}>
                          {pais.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="fechaNacimiento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de nacimiento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="antiguedadGiroAnios"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Antigüedad en el giro (años)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} placeholder="5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="pepNacionalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>¿Es PEP?</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona una opción" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {peps?.map((pep) => (
                        <SelectItem key={pep.id} value={pep.id ?? ""}>
                          {pep.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="actividadEconomicaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Actividad económica</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona una actividad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {actividadesEconomicas?.map((actividad) => (
                        <SelectItem key={actividad.id} value={String(actividad.id ?? "")}>
                          {actividad.descripcion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold">Domicilio operativo</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={control}
              name="paisId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>País</FormLabel>
                  <Select
                    onValueChange={(valor) => {
                      field.onChange(valor);
                      form.setValue("entidadId", "");
                      form.setValue("municipioId", "");
                      form.setValue("localidadId", "");
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un país" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paises?.map((pais) => (
                        <SelectItem key={pais.idPais} value={pais.idPais ?? ""}>
                          {pais.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="entidadId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entidad</FormLabel>
                  <Select
                    onValueChange={(valor) => {
                      field.onChange(valor);
                      form.setValue("municipioId", "");
                      form.setValue("localidadId", "");
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona una entidad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {entidadesDelPais.map((entidad) => (
                        <SelectItem
                          key={entidad.idEntidad}
                          value={String(entidad.idEntidad)}
                        >
                          {entidad.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="municipioId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Municipio</FormLabel>
                  <Select
                    onValueChange={(valor) => {
                      field.onChange(valor);
                      form.setValue("localidadId", "");
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un municipio" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {municipios?.map((municipio) => (
                        <SelectItem key={municipio.id} value={String(municipio.id)}>
                          {municipio.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="localidadId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Localidad</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona una localidad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {localidades?.map((localidad) => (
                        <SelectItem
                          key={localidad.idLocalidad}
                          value={String(localidad.idLocalidad)}
                        >
                          {localidad.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="tipoCalle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de calle</FormLabel>
                  <FormControl>
                    <Input placeholder="Avenida" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="calle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calle</FormLabel>
                  <FormControl>
                    <Input placeholder="Reforma" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="noExterior"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número exterior</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="noInterior"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número interior</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="4" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="codigoPostal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código postal</FormLabel>
                  <FormControl>
                    <Input placeholder="06600" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="asentamientoTipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de asentamiento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tiposAsentamiento?.map((item) => (
                        <SelectItem key={item.id} value={item.descripcion ?? ""}>
                          {item.descripcion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="asentamientoNombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del asentamiento</FormLabel>
                  <FormControl>
                    <Input placeholder="Juárez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold">Crédito solicitado</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={control}
              name="creditoReferencia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referencia del crédito</FormLabel>
                  <FormControl>
                    <Input placeholder="CRD-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="creditoTipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de crédito</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tiposCredito?.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id ?? ""}>
                          {tipo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="monto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="50000"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="moneda"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moneda</FormLabel>
                  <FormControl>
                    <Input placeholder="MXN" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="origenRecursos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origen de los recursos</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un origen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {origenesRecurso?.map((origen) => (
                        <SelectItem key={origen.id} value={origen.id ?? ""}>
                          {origen.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="destinoRecursos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destino de los recursos</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un destino" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {destinosRecurso?.map((destino) => (
                        <SelectItem key={destino.id} value={destino.id ?? ""}>
                          {destino.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="canalPagoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Canal de pago</FormLabel>
                  <Select
                    onValueChange={(valor) => {
                      field.onChange(valor);
                      form.setValue("tipoPagoId", "");
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un canal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {canalesPago?.map((canal) => (
                        <SelectItem key={canal.id} value={String(canal.id ?? "")}>
                          {canal.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="tipoPagoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de pago</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tiposPagoDelCanal.map((tipo) => (
                        <SelectItem key={tipo.id} value={String(tipo.id ?? "")}>
                          {tipo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="ebrSoluciones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enfoque basado en riesgo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un nivel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EBR_OPCIONES.map((opcion) => (
                        <SelectItem key={opcion.value} value={opcion.value}>
                          {opcion.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <div className="flex items-center justify-between">
            <legend className="text-sm font-semibold">
              Historial crediticio (opcional)
            </legend>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  referencia: "",
                  tipo: "",
                  monto: "",
                  moneda: "MXN",
                  fechaOtorgamiento: "",
                  estatus: "",
                })
              }
            >
              Agregar crédito anterior
            </Button>
          </div>

          {fields.length === 0 && (
            <p className="text-muted-foreground text-sm">
              Sin créditos anteriores registrados.
            </p>
          )}

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-4 rounded-md border p-3 sm:grid-cols-3"
            >
              <FormField
                control={control}
                name={`creditosAnteriores.${index}.referencia`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel>Referencia</FormLabel>
                    <FormControl>
                      <Input placeholder="CRD-2020-01" {...f} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`creditosAnteriores.${index}.tipo`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                      <Input placeholder="PERSONAL" {...f} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`creditosAnteriores.${index}.monto`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="10000"
                        {...f}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`creditosAnteriores.${index}.moneda`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel>Moneda</FormLabel>
                    <FormControl>
                      <Input placeholder="MXN" {...f} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`creditosAnteriores.${index}.fechaOtorgamiento`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel>Fecha de otorgamiento</FormLabel>
                    <FormControl>
                      <Input type="date" {...f} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`creditosAnteriores.${index}.estatus`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel>Estatus</FormLabel>
                    <FormControl>
                      <Input placeholder="PAGADO" {...f} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex items-end sm:col-span-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  Quitar
                </Button>
              </div>
            </div>
          ))}
        </fieldset>

        <div className="flex justify-end">
          <Button type="submit" disabled={enviando}>
            {enviando ? "Evaluando…" : "Evaluar riesgo"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
