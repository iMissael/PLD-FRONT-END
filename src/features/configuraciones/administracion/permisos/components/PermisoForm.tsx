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
import { mayusculas } from "@/shared/utils/entradas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  useCrearPermiso,
  useRecursosPermiso,
} from "@/features/configuraciones/administracion/permisos/hooks/usePermisos";
import {
  ACCIONES_PERMISO,
  crearPermisoSchema,
  ETIQUETAS_ACCION,
  type CrearPermisoFormValues,
} from "@/features/configuraciones/administracion/permisos/types/permisoSchema";

export function PermisoForm() {
  const crearPermiso = useCrearPermiso();
  const { data: recursos, isLoading: cargandoRecursos } = useRecursosPermiso();

  const form = useForm<CrearPermisoFormValues>({
    resolver: zodResolver(crearPermisoSchema),
    defaultValues: {
      recurso: "",
      accion: undefined as unknown as CrearPermisoFormValues["accion"],
      descripcion: "",
    },
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={cargandoRecursos ? "Cargando…" : "Selecciona un recurso"}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {recursos?.map((recurso) => (
                    <SelectItem key={recurso} value={recurso}>
                      {recurso}
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
          name="accion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Acción</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona una acción" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ACCIONES_PERMISO.map((accion) => (
                    <SelectItem key={accion} value={accion}>
                      {ETIQUETAS_ACCION[accion]}
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
