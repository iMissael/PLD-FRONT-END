import { useMemo } from "react";
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
  CanalPagoResponse,
  DestinoRecursoResponse,
  OrigenRecursoResponse,
  TipoCreditoResponse,
  TipoPagoResponse,
} from "@/features/catalogos/types/catalogos";
import type { TipoPrestamoResponse } from "@/features/configuraciones/tipos-prestamo/types/tipoPrestamo";

const EBR_OPCIONES = [
  { value: "BAJO", label: "Bajo" },
  { value: "MEDIO_BAJO", label: "Medio bajo" },
  { value: "MEDIO", label: "Medio" },
  { value: "MEDIO_ALTO", label: "Medio alto" },
  { value: "ALTO", label: "Alto" },
];

interface FormSeccionCreditoProps {
  form: UseFormReturn<EvaluacionRiesgoFormValues>;
  tiposCredito?: TipoCreditoResponse[];
  /** `cat_tipo_credito` ya no tiene nombre: el texto del select sale de aquí. */
  tiposPrestamo?: TipoPrestamoResponse[];
  origenesRecurso?: OrigenRecursoResponse[];
  destinosRecurso?: DestinoRecursoResponse[];
  canalesPago?: CanalPagoResponse[];
  tiposPagoDelCanal: TipoPagoResponse[];
}

export function FormSeccionCredito({
  form,
  tiposCredito,
  tiposPrestamo,
  origenesRecurso,
  destinosRecurso,
  canalesPago,
  tiposPagoDelCanal,
}: FormSeccionCreditoProps) {
  const { control } = form;

  const nombrePrestamo = useMemo(() => {
    const mapa = new Map<string, string>();
    tiposPrestamo?.forEach((tp) => mapa.set(String(tp.id), tp.nombre));
    return (tipo: TipoCreditoResponse) =>
      mapa.get(String(tipo.catTipoPrestamoId ?? "")) ?? `Tipo ${tipo.id}`;
  }, [tiposPrestamo]);

  return (
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
                    <SelectItem key={tipo.id} value={String(tipo.id)}>
                      {nombrePrestamo(tipo)}
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
                    <SelectItem key={origen.id} value={String(origen.id)}>
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
                    <SelectItem key={destino.id} value={String(destino.id)}>
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
  );
}
