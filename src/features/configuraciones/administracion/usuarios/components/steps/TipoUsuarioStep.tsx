import { useMemo } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { InputFormateado } from "@/shared/components/InputFormateado";
import { clave, soloLetras } from "@/shared/utils/entradas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useActividadesEconomicas } from "@/features/catalogos/hooks/useCatalogos";
import { useRoles } from "@/features/configuraciones/administracion/roles/hooks/useRoles";
import type { CrearUsuarioFormValues } from "@/features/configuraciones/administracion/usuarios/types/usuarioSchema";
import { esRolOficial } from "@/features/configuraciones/administracion/usuarios/utils/usuarios";

export function TipoUsuarioStep({
  form,
}: {
  form: UseFormReturn<CrearUsuarioFormValues>;
}) {
  const { data: roles } = useRoles();
  const { data: actividadesEconomicas } = useActividadesEconomicas();

  const rolSeleccionado = useWatch({ control: form.control, name: "rolId" });
  const esOficial = useMemo(
    () => esRolOficial(roles, rolSeleccionado),
    [roles, rolSeleccionado],
  );

  return (
    <div className="space-y-8">
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold">Tipo de usuario</legend>
        <div className="grid items-start gap-4 sm:grid-cols-3">
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
                      <SelectItem key={rol.idRol} value={rol.idRol ?? ""}>
                        {rol.nombre}
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

      {esOficial && (
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold">
            Datos de Oficial de Cumplimiento
          </legend>
          <div className="grid items-start gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="tipoPersona"
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
                      <SelectItem value="FISICA">Persona física</SelectItem>
                      <SelectItem value="MORAL">Persona moral</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="claveDelOficialDeCumplimiento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clave del oficial de cumplimiento</FormLabel>
                  <FormControl>
                    <InputFormateado
                      placeholder="OC-001"
                      {...field}
                      formato={clave}
                      maxLength={12}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="claveDelSujetoObligado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clave del sujeto obligado</FormLabel>
                  <FormControl>
                    <InputFormateado
                      placeholder="SO-001"
                      {...field}
                      formato={clave}
                      maxLength={50}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="claveOrganoSuperior"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clave del órgano superior</FormLabel>
                  <FormControl>
                    <InputFormateado
                      placeholder="OS-001"
                      {...field}
                      formato={clave}
                      maxLength={50}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="monedaDeOperacionPrincipal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moneda de operación principal</FormLabel>
                  <FormControl>
                    <InputFormateado
                      placeholder="MXN"
                      {...field}
                      formato={soloLetras}
                      maxLength={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
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
                      {actividadesEconomicas
                        ?.filter((item) => item.estatus === "A")
                        .map((item) => (
                          <SelectItem key={item.id} value={item.id ?? ""}>
                            {item.descripcion}
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
      )}
    </div>
  );
}
