import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/molecules/Form";
import { Input } from "@/shared/components/atoms/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/molecules/Select";
import type { EvaluacionRiesgoFormValues } from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgoSchema";
import type {
  CatalogoIdentidadResponse,
  EntidadGeograficaResponse,
  LocalidadResponse,
  MunicipioResponse,
  PaisResponse,
} from "@/features/catalogos/types/catalogos";

interface FormSeccionDomicilioProps {
  form: UseFormReturn<EvaluacionRiesgoFormValues>;
  paises?: PaisResponse[];
  entidadesDelPais: EntidadGeograficaResponse[];
  municipios?: MunicipioResponse[];
  localidades?: LocalidadResponse[];
  tiposAsentamiento?: CatalogoIdentidadResponse[];
}

export function FormSeccionDomicilio({
  form,
  paises,
  entidadesDelPais,
  municipios,
  localidades,
  tiposAsentamiento,
}: FormSeccionDomicilioProps) {
  const { control } = form;

  return (
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
                    <SelectItem key={pais.idPais} value={String(pais.idPais)}>
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
  );
}
