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
import { SocioBuscadorEvaluacion } from "@/features/operacion/evaluacion-riesgo/components/SocioBuscadorEvaluacion";
import type { EvaluacionRiesgoFormValues } from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgoSchema";
import type {
  CatActividadEconomicaResponse,
  PaisResponse,
  PepResponse,
  TipoPersonaResponse,
} from "@/features/catalogos/types/catalogos";

interface FormSeccionIdentificacionProps {
  form: UseFormReturn<EvaluacionRiesgoFormValues>;
  socioInicial?: { id: string; nombre: string };
  tiposPersona?: TipoPersonaResponse[];
  paises?: PaisResponse[];
  peps?: PepResponse[];
  actividadesEconomicas?: CatActividadEconomicaResponse[];
}

export function FormSeccionIdentificacion({
  form,
  socioInicial,
  tiposPersona,
  paises,
  peps,
  actividadesEconomicas,
}: FormSeccionIdentificacionProps) {
  const { control } = form;

  return (
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
                    <SelectItem key={tipo.id} value={String(tipo.id)}>
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
                    <SelectItem key={pep.id} value={String(pep.id)}>
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
  );
}
