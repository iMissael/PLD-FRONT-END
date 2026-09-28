import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { InputFormateado } from "@/shared/components/InputFormateado";
import { clavePermiso, mayusculas } from "@/shared/utils/entradas";
import { useCrearPermiso } from "@/features/configuraciones/administracion/permisos/hooks/usePermisos";
import {
  crearPermisoSchema,
  type CrearPermisoFormValues,
} from "@/features/configuraciones/administracion/permisos/types/permisoSchema";

export function PermisoForm() {
  const crearPermiso = useCrearPermiso();

  const form = useForm<CrearPermisoFormValues>({
    resolver: zodResolver(crearPermisoSchema),
    defaultValues: { recurso: "", accion: "", descripcion: "" },
  });

  function onSubmit(values: CrearPermisoFormValues) {
    crearPermiso.mutate(values, {
      onSuccess: () => {
        toast.success("Permiso creado correctamente");
        form.reset();
      },
      onError: () => {
        toast.error("No se pudo crear el permiso");
      },
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid items-start gap-4 sm:grid-cols-2"
      >
        <FormField
          control={form.control}
          name="recurso"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recurso</FormLabel>
              <FormControl>
                <InputFormateado
                  placeholder="USUARIOS"
                  {...field}
                  formato={clavePermiso}
                  maxLength={50}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="accion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Acción</FormLabel>
              <FormControl>
                <InputFormateado
                  placeholder="CREAR"
                  {...field}
                  formato={clavePermiso}
                  maxLength={50}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <InputFormateado
                  placeholder="PERMITE CREAR USUARIOS"
                  {...field}
                  formato={mayusculas}
                  maxLength={255}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-end">
          <Button type="submit" disabled={crearPermiso.isPending}>
            {crearPermiso.isPending ? "Creando…" : "Crear permiso"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
