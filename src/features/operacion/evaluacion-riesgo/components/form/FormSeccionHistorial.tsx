import type { FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove, UseFormReturn } from "react-hook-form";
import { Button } from "@/shared/components/atoms/Button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/shared/components/molecules/Form";
import { Input } from "@/shared/components/atoms/Input";
import type { EvaluacionRiesgoFormValues } from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgoSchema";

interface FormSeccionHistorialProps {
  form: UseFormReturn<EvaluacionRiesgoFormValues>;
  fields: FieldArrayWithId<EvaluacionRiesgoFormValues, "creditosAnteriores", "id">[];
  append: UseFieldArrayAppend<EvaluacionRiesgoFormValues, "creditosAnteriores">;
  remove: UseFieldArrayRemove;
}

export function FormSeccionHistorial({
  form,
  fields,
  append,
  remove,
}: FormSeccionHistorialProps) {
  const { control } = form;

  return (
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
  );
}
