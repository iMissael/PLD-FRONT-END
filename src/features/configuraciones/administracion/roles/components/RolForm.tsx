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
import { mayusculas, nombreRol } from "@/shared/utils/entradas";
import { useCrearRol } from "@/features/configuraciones/administracion/roles/hooks/useRoles";
import {
  crearRolSchema,
  type CrearRolFormValues,
} from "@/features/configuraciones/administracion/roles/types/rolSchema";

export function RolForm() {
  const crearRol = useCrearRol();

  const form = useForm<CrearRolFormValues>({
    resolver: zodResolver(crearRolSchema),
    defaultValues: { nombre: "", categoria: "", descripcion: "" },
  });

  function onSubmit(values: CrearRolFormValues) {
    crearRol.mutate(values, {
      onSuccess: () => {
        toast.success("Rol creado correctamente");
        form.reset();
      },
      onError: () => {
        toast.error("No se pudo crear el rol");
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
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <InputFormateado
                  placeholder="ROLE_AUDITOR"
                  {...field}
                  formato={nombreRol}
                  maxLength={50}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categoria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <FormControl>
                <InputFormateado
                  placeholder="ESTANDAR"
                  {...field}
                  formato={nombreRol}
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
                  placeholder="AUDITOR DE CUMPLIMIENTO"
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
          <Button type="submit" disabled={crearRol.isPending}>
            {crearRol.isPending ? "Creando…" : "Crear rol"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
