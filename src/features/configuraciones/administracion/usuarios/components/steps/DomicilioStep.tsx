import { useMemo } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { InputFormateado } from "@/shared/components/InputFormateado";
import { mayusculas, numeroDomicilio, soloDigitos } from "@/shared/utils/entradas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  useEntidades,
  useLocalidades,
  useMunicipios,
  usePaises,
  usePosesionesVivienda,
  useTiposAsentamiento,
  useTiposComprobante,
  useTiposVialidad,
} from "@/features/catalogos/hooks/useCatalogos";
import type { CrearUsuarioFormValues } from "@/features/configuraciones/administracion/usuarios/types/usuarioSchema";

function aNumeroOIndefinido(valor: string | undefined) {
  if (!valor) return undefined;
  const numero = Number(valor);
  return Number.isNaN(numero) ? undefined : numero;
}

export function DomicilioStep({ form }: { form: UseFormReturn<CrearUsuarioFormValues> }) {
  const { data: tiposComprobante } = useTiposComprobante();
  const { data: tiposVialidad } = useTiposVialidad();
  const { data: posesionesVivienda } = usePosesionesVivienda();
  const { data: tiposAsentamiento } = useTiposAsentamiento();
  const { data: paises } = usePaises();
  const { data: entidades } = useEntidades();

  const paisSeleccionado = useWatch({ control: form.control, name: "domicilioPaisId" });
  const entidadSeleccionada = useWatch({
    control: form.control,
    name: "domicilioEntidadId",
  });
  const municipioSeleccionado = useWatch({ control: form.control, name: "municipioId" });

  const entidadesDelPais = useMemo(() => {
    if (!entidades) return [];
    if (!paisSeleccionado) return entidades;
    return entidades.filter((entidad) => entidad.idPais === paisSeleccionado);
  }, [entidades, paisSeleccionado]);

  const { data: municipios } = useMunicipios(aNumeroOIndefinido(entidadSeleccionada));
  const { data: localidades } = useLocalidades(aNumeroOIndefinido(municipioSeleccionado));

  return (
    <div className="space-y-8">
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold">Ubicación</legend>
        <div className="grid items-start gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="domicilioPaisId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>País</FormLabel>
                <Select
                  onValueChange={(valor) => {
                    field.onChange(valor);
                    form.setValue("domicilioEntidadId", "");
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
            control={form.control}
            name="domicilioEntidadId"
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
            control={form.control}
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
            control={form.control}
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
            control={form.control}
            name="codigoPostal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código postal</FormLabel>
                <FormControl>
                  <InputFormateado
                    placeholder="06600"
                    inputMode="numeric"
                    {...field}
                    formato={soloDigitos}
                    maxLength={5}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="colonia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Colonia</FormLabel>
                <FormControl>
                  <InputFormateado
                    placeholder="JUÁREZ"
                    {...field}
                    formato={mayusculas}
                    maxLength={100}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tipoAsentamiento"
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
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold">Calle y número</legend>
        <div className="grid items-start gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="tipoVialidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de vialidad</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tiposVialidad?.map((item) => (
                      <SelectItem key={item.id} value={item.id ?? ""}>
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
            control={form.control}
            name="calle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calle</FormLabel>
                <FormControl>
                  <InputFormateado
                    placeholder="AV. REFORMA"
                    {...field}
                    formato={mayusculas}
                    maxLength={100}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="numExterior"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número exterior</FormLabel>
                <FormControl>
                  <InputFormateado
                    placeholder="100"
                    {...field}
                    formato={numeroDomicilio}
                    maxLength={10}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="numInterior"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número interior</FormLabel>
                <FormControl>
                  <InputFormateado
                    placeholder="4B"
                    {...field}
                    formato={numeroDomicilio}
                    maxLength={10}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nombreCalleIzquierda"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calle izquierda</FormLabel>
                <FormControl>
                  <InputFormateado
                    placeholder="INSURGENTES"
                    {...field}
                    formato={mayusculas}
                    maxLength={50}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nombreCalleDerecha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calle derecha</FormLabel>
                <FormControl>
                  <InputFormateado
                    placeholder="CHAPULTEPEC"
                    {...field}
                    formato={mayusculas}
                    maxLength={50}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="referencia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referencia</FormLabel>
                <FormControl>
                  <InputFormateado
                    placeholder="FRENTE AL PARQUE"
                    {...field}
                    formato={mayusculas}
                    maxLength={100}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold">Vivienda y comprobante</legend>
        <div className="grid items-start gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="posesionVivienda"
            render={({ field }) => (
              <FormItem>
                <FormLabel>La casa es</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona una opción" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {posesionesVivienda?.map((item) => (
                      <SelectItem key={item.id} value={item.id ?? ""}>
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
            control={form.control}
            name="antiguedadDomicilio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Antigüedad en el domicilio (desde)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tipoComprobante"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de comprobante</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tiposComprobante?.map((item) => (
                      <SelectItem key={item.id} value={item.id ?? ""}>
                        {item.descripcion}
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
    </div>
  );
}
