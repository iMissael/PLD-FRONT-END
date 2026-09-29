import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch, type Control } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
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
    factores: (base.pesosFactores ?? []).map((f) => ({
      id: f.id ?? 0,
      descripcion: f.descripcion ?? "",
      peso: String(f.peso ?? 0),
      estatus: estatusFormValue(f.estatus),
      subfactores: (f.subfactores ?? []).map((s) => ({
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

function BadgeSuma({ suma }: { suma: number }) {
  const enCien = Math.abs(suma - 100) < 0.01;
  return (
    <Badge variant={enCien ? "default" : "destructive"}>Suma: {suma.toFixed(2)}%</Badge>
  );
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
    <div className="space-y-3 rounded-md border p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-medium">{descripcion}</span>
        <div className="flex items-center gap-3">
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
                    className="w-24"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`factores.${factorIndex}.estatus`}
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="A">Activo</SelectItem>
                    <SelectItem value="INA">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
      </div>

      {estatusFactor === "A" && fields.length > 0 && (
        <div className="space-y-2 pl-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subfactor</TableHead>
                <TableHead>Ponderación</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, subIndex) => (
                <TableRow key={field.fieldKey}>
                  <TableCell>{field.descripcion}</TableCell>
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
                              className="w-24"
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
                        <FormItem>
                          <Select
                            onValueChange={estatusField.onChange}
                            value={estatusField.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="A">Activo</SelectItem>
                              <SelectItem value="INA">Inactivo</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end">
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
        onError: () => toast.error("No se pudo publicar la nueva versión de la matriz"),
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

        <div className="flex items-center justify-end gap-3">
          {!puedeEnviar && (
            <p className="text-destructive text-sm">
              Los pesos activos deben sumar 100% en cada nivel.
            </p>
          )}
          <Button type="submit" disabled={!puedeEnviar || crearNuevaVersion.isPending}>
            {crearNuevaVersion.isPending ? "Publicando…" : "Publicar nueva versión"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
