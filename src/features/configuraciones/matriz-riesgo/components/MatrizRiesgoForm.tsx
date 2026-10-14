import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch, type Control } from "react-hook-form";
import { toast } from "sonner";
import { isAppError } from "@/api/interceptors/errorInterceptor";
import { Button } from "@/shared/components/atoms/Button";
import { Input } from "@/shared/components/atoms/Input";
import { StatusBadge } from "@/shared/components/atoms/StatusBadge";
import { BadgeSuma } from "@/shared/components/molecules/BadgeSuma";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/components/molecules/Form";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/atoms/Table";
import { useCrearNuevaVersion } from "@/features/configuraciones/matriz-riesgo/hooks/useMatrizRiesgo";
import {
  matrizRiesgoFormSchema,
  type MatrizRiesgoFormValues,
} from "@/features/configuraciones/matriz-riesgo/types/matrizRiesgoSchema";
import type { ConfiguracionMatrizRiesgo } from "@/features/configuraciones/matriz-riesgo/types/matrizRiesgo";
import { useAuthStore } from "@/shared/auth/authStore";

function estatusFormValue(estatus: string | undefined): "A" | "INA" {
  return estatus === "A" ? "A" : "INA";
}

function valoresIniciales(base: ConfiguracionMatrizRiesgo): MatrizRiesgoFormValues {
  return {
    factores: (base.factores ?? []).map((f) => ({
      id: f.id ?? 0,
      descripcion: f.descripcion ?? "",
      peso: String(f.peso ?? 0),
      estatus: estatusFormValue(f.estatus),
      subfactores: (f.subfactoresRef ?? []).map((s) => ({
        id: s.id ?? 0,
        descripcion: s.descripcion ?? "",
        ponderacion: String(s.ponderacion ?? 0),
        estatus: estatusFormValue(s.estatus),
      })),
    })),
  };
}

function sumaActivos(items: { estatus: "A" | "INA"; valor: string }[]) {
  return items
    .filter((i) => i.estatus === "A")
    .reduce((acc, i) => acc + (Number(i.valor) || 0), 0);
}

function FactorCard({
  control,
  factorIndex,
  descripcion,
}: {
  control: Control<MatrizRiesgoFormValues>;
  factorIndex: number;
  descripcion: string;
}) {
  const [abierto, setAbierto] = useState(true);
  const { fields } = useFieldArray({
    control,
    name: `factores.${factorIndex}.subfactores`,
    keyName: "fieldKey",
  });
  const estatusFactor = useWatch({ control, name: `factores.${factorIndex}.estatus` });
  const subfactoresWatch = useWatch({
    control,
    name: `factores.${factorIndex}.subfactores`,
  });

  const sumaSubfactores = sumaActivos(
    (subfactoresWatch ?? []).map((s) => ({ estatus: s.estatus, valor: s.ponderacion })),
  );

  return (
    <div className="rounded-xl border border-border bg-card shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setAbierto((prev) => !prev)}
            className="flex items-center gap-2 text-left font-semibold text-foreground text-sm sm:text-base hover:text-primary transition-colors cursor-pointer"
          >
            <span>{descripcion}</span>
            {abierto ? (
              <ChevronUp className="size-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-4 text-muted-foreground" />
            )}
          </button>
          <FormField
            control={control}
            name={`factores.${factorIndex}.estatus`}
            render={({ field }) => (
              <FormItem className="flex items-center">
                <StatusBadge tono={field.value === "A" ? "activo" : "inactivo"}>
                  {field.value === "A" ? "Activo" : "Inactivo"}
                </StatusBadge>
              </FormItem>
            )}
          />
          {fields.length > 0 && (
            <span className="text-xs text-muted-foreground">
              ({fields.length} subfactor{fields.length > 1 ? "es" : ""})
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">Peso (%):</span>
          <FormField
            control={control}
            name={`factores.${factorIndex}.peso`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    max={100}
                    className="w-24 font-mono font-semibold"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {abierto && estatusFactor === "A" && fields.length > 0 && (
        <div className="border-t border-border p-3.5 sm:p-4 space-y-3">
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/2">Subfactor</TableHead>
                  <TableHead className="w-1/4">Ponderación (%)</TableHead>
                  <TableHead className="w-1/4">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, subIndex) => (
                  <TableRow key={field.fieldKey}>
                    <TableCell className="font-medium text-foreground">
                      {field.descripcion}
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={control}
                        name={`factores.${factorIndex}.subfactores.${subIndex}.ponderacion`}
                        render={({ field: ponderacionField }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min={0}
                                max={100}
                                className="w-24 font-mono"
                                {...ponderacionField}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={control}
                        name={`factores.${factorIndex}.subfactores.${subIndex}.estatus`}
                        render={({ field: estatusField }) => (
                          <FormItem className="flex items-center">
                            <StatusBadge
                              tono={estatusField.value === "A" ? "activo" : "inactivo"}
                            >
                              {estatusField.value === "A" ? "Activo" : "Inactivo"}
                            </StatusBadge>
                          </FormItem>
                        )}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <span>Suma de ponderaciones de subfactores activos:</span>
            <BadgeSuma suma={sumaSubfactores} />
          </div>
        </div>
      )}
    </div>
  );
}

export function MatrizRiesgoForm({
  base,
  onSuccess,
}: {
  base: ConfiguracionMatrizRiesgo;
  onSuccess: () => void;
}) {
  const crearNuevaVersion = useCrearNuevaVersion();
  const form = useForm<MatrizRiesgoFormValues>({
    resolver: zodResolver(matrizRiesgoFormSchema),
    defaultValues: valoresIniciales(base),
  });
  const { control, handleSubmit } = form;
  const { fields } = useFieldArray({ control, name: "factores", keyName: "fieldKey" });
  const factoresWatch = useWatch({ control, name: "factores" });

  const sumaFactores = sumaActivos(
    (factoresWatch ?? []).map((f) => ({ estatus: f.estatus, valor: f.peso })),
  );
  const sumasSubfactoresValidas = (factoresWatch ?? []).every((f) => {
    if (f.estatus !== "A") return true;
    const suma = sumaActivos(
      (f.subfactores ?? []).map((s) => ({ estatus: s.estatus, valor: s.ponderacion })),
    );
    return Math.abs(suma - 100) < 0.01;
  });
  const puedeEnviar = Math.abs(sumaFactores - 100) < 0.01 && sumasSubfactoresValidas;

  function onSubmit(values: MatrizRiesgoFormValues) {
    const creadoPor = useAuthStore.getState().usuario?.username;
    if (!creadoPor) {
      toast.error("No se pudo determinar el usuario actual.");
      return;
    }

    crearNuevaVersion.mutate(
      {
        creadoPor,
        pesosFactores: values.factores.map((f) => ({
          id: f.id,
          descripcion: f.descripcion,
          peso: Number(f.peso),
          estatus: f.estatus,
          subfactores: f.subfactores.map((s) => ({
            id: s.id,
            descripcion: s.descripcion,
            ponderacion: Number(s.ponderacion),
            estatus: s.estatus,
          })),
        })),
      },
      {
        onSuccess: () => {
          toast.success("Nueva versión de la matriz publicada correctamente");
          onSuccess();
        },
        onError: (error) =>
          toast.error(
            isAppError(error)
              ? error.message
              : "No se pudo publicar la nueva versión de la matriz",
          ),
      },
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Peso de factores</span>
          <BadgeSuma suma={sumaFactores} />
        </div>

        {fields.map((field, index) => (
          <FactorCard
            key={field.fieldKey}
            control={control}
            factorIndex={index}
            descripcion={field.descripcion}
          />
        ))}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div>
            {!puedeEnviar && (
              <p className="text-destructive text-sm font-medium">
                Los pesos activos deben sumar 100% en cada nivel.
              </p>
            )}
          </div>
          <Button type="submit" disabled={!puedeEnviar || crearNuevaVersion.isPending}>
            {crearNuevaVersion.isPending ? "Publicando…" : "Publicar nueva versión"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
