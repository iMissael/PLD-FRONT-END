import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { InputFormateado } from "@/shared/components/InputFormateado";
import { nombreUsuario, soloDigitos } from "@/shared/utils/entradas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useRoles } from "@/features/configuraciones/administracion/roles/hooks/useRoles";
import type { CrearUsuarioFormValues } from "@/features/configuraciones/administracion/usuarios/types/usuarioSchema";

export function DatosGeneralesStep({
  form,
}: {
  form: UseFormReturn<CrearUsuarioFormValues>;
}) {
  const { data: roles } = useRoles();

  return (
    <div className="space-y-8">
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold">Empleado y acceso</legend>
        <p className="text-muted-foreground text-sm">
          El usuario se vincula a un empleado ya existente; su identidad (nombre, RFC, domicilio,
          etc.) se administra en el sistema de empleados, no aquí.
        </p>
        <div className="grid items-start gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="empleadoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Id de empleado</FormLabel>
                <FormControl>
                  <InputFormateado
                    placeholder="1024"
                    inputMode="numeric"
                    {...field}
                    formato={soloDigitos}
                    maxLength={10}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <InputFormateado
                    placeholder="jdoe"
                    {...field}
                    formato={nombreUsuario}
                    maxLength={50}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rolId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles?.map((rol) => (
                      <SelectItem key={rol.idRol} value={String(rol.idRol ?? "")}>
                        {rol.nombre}
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmarPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar contraseña</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </fieldset>
    </div>
  );
}
