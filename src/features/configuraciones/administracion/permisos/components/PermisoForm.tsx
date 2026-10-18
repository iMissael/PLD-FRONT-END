import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/shared/components/atoms/Button";
import { Checkbox } from "@/shared/components/atoms/Checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/molecules/Form";
import { InputFormateado } from "@/shared/components/atoms/InputFormateado";
import { mayusculas } from "@/shared/utils/entradas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/molecules/Select";
import {
  useCrearPermisosEnLote,
  useTodosPermisos,
} from "@/features/configuraciones/administracion/permisos/hooks/usePermisos";
import {
  ACCIONES_PERMISO,
  crearPermisosPorMenuSchema,
  ETIQUETAS_ACCION,
  MENUS_PERMISO,
  type CrearPermisosPorMenuFormValues,
} from "@/features/configuraciones/administracion/permisos/types/permisoSchema";

export function PermisoForm() {
  const { data: permisos } = useTodosPermisos();
  const crearPermisosEnLote = useCrearPermisosEnLote();

  const existentes = useMemo(() => {
    return new Set((permisos ?? []).map((p) => `${p.recurso}:${p.accion}`));
  }, [permisos]);

  const form = useForm<CrearPermisosPorMenuFormValues>({
    resolver: zodResolver(crearPermisosPorMenuSchema),
    defaultValues: { menu: "", acciones: [], descripcion: "" },
  });

  function onSubmit(values: CrearPermisosPorMenuFormValues) {
    const menu = MENUS_PERMISO.find((m) => m.valor === values.menu);
    if (!menu) return;

    const pares = menu.recursos.flatMap((recurso) =>
      values.acciones.map((accion) => ({ recurso, accion })),
    );
    const nuevos = pares.filter((par) => !existentes.has(`${par.recurso}:${par.accion}`));

    if (nuevos.length === 0) {
      toast.info("Esos permisos ya existen para ese menú.");
      return;
    }

    crearPermisosEnLote.mutate(
      nuevos.map((par) => ({ ...par, descripcion: values.descripcion || undefined })),
      {
        onSuccess: ({ creados, fallidos }) => {
          const yaExistian = pares.length - nuevos.length;
          const partes = [`Se crearon ${creados} permisos.`];
          if (yaExistian > 0) partes.push(`${yaExistian} ya existían.`);
          if (fallidos > 0) partes.push(`${fallidos} no se pudieron crear.`);
          if (fallidos > 0) {
            toast.warning(partes.join(" "));
          } else {
            toast.success(partes.join(" "));
          }
          form.reset();
        },
        onError: () => toast.error("No se pudieron crear los permisos"),
      },
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid items-start gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="menu"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Menú</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un menú" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MENUS_PERMISO.map((menu) => (
                      <SelectItem key={menu.valor} value={menu.valor}>
                        {menu.etiqueta}
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
              <FormItem>
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
        </div>

        <FormField
          control={form.control}
          name="acciones"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Acciones</FormLabel>
              <div className="flex flex-wrap gap-4 pt-1">
                {ACCIONES_PERMISO.map((accion) => (
                  <label
                    key={accion}
                    className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground select-none"
                  >
                    <Checkbox
                      checked={field.value?.includes(accion)}
                      onCheckedChange={(marcado) => {
                        const actuales = field.value ?? [];
                        field.onChange(
                          marcado
                            ? [...actuales, accion]
                            : actuales.filter((a) => a !== accion),
                        );
                      }}
                    />
                    {ETIQUETAS_ACCION[accion]}
                  </label>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-end">
          <Button type="submit" disabled={crearPermisosEnLote.isPending}>
            {crearPermisosEnLote.isPending ? "Creando…" : "Crear permisos"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
