import { useMemo } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { InputFormateado } from "@/shared/components/InputFormateado";
import {
  alfanumerico,
  correo,
  mayusculas,
  nombrePropio,
  nombreUsuario,
  rfc,
  soloDigitos,
} from "@/shared/utils/entradas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  useEntidades,
  useEstadosCiviles,
  useNacionalidades,
  useNivelesEstudios,
  usePaises,
  useTiposIdentificacion,
} from "@/features/catalogos/hooks/useCatalogos";
import type { CrearUsuarioFormValues } from "@/features/configuraciones/administracion/usuarios/types/usuarioSchema";

export function DatosGeneralesStep({
  form,
}: {
  form: UseFormReturn<CrearUsuarioFormValues>;
}) {
  const { data: nacionalidades } = useNacionalidades();
  const { data: estadosCiviles } = useEstadosCiviles();
  const { data: nivelesEstudios } = useNivelesEstudios();
  const { data: tiposIdentificacion } = useTiposIdentificacion();
  const { data: paises } = usePaises();
  const { data: entidades } = useEntidades();

  const paisSeleccionado = useWatch({ control: form.control, name: "paisNacimientoId" });
  const entidadesDelPais = useMemo(() => {
    if (!entidades) return [];
    if (!paisSeleccionado) return entidades;
    return entidades.filter((entidad) => entidad.idPais === paisSeleccionado);
  }, [entidades, paisSeleccionado]);

  return (
    <div className="space-y-8">
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold">Datos de acceso</legend>
        <div className="grid items-start gap-4 sm:grid-cols-3">
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
          <FormField
            control={form.control}
            name="correo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo</FormLabel>
                <FormControl>
                  <InputFormateado
                    placeholder="jdoe@example.com"
                    {...field}
                    formato={correo}
                    maxLength={150}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <InputFormateado
                    placeholder="5512345678"
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
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold">Datos personales</legend>
        <div className="grid items-start gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <InputFormateado
                    placeholder="JUAN"
                    {...field}
                    formato={nombrePropio}
                    maxLength={150}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="primerApellido"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primer apellido</FormLabel>
                <FormControl>
                  <InputFormateado
                    placeholder="PÉREZ"
                    {...field}
                    formato={nombrePropio}
                    maxLength={100}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="segundoApellido"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Segundo apellido</FormLabel>
                <FormControl>
                  <InputFormateado
                    placeholder="GÓMEZ"
                    {...field}
                    formato={nombrePropio}
                    maxLength={100}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nacionalidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nacionalidad</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona una nacionalidad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {nacionalidades?.map((item) => (
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
          <FormField
            control={form.control}
            name="paisNacimientoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>País de nacimiento</FormLabel>
                <Select
                  onValueChange={(valor) => {
                    field.onChange(valor);
                    form.setValue("entidadNacimientoId", "");
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un país" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {paises?.map((pais) => (
                      <SelectItem key={pais.idPais} value={pais.idPais ?? ""}>
                        {pais.nombre}
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
            name="entidadNacimientoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entidad de nacimiento</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona una entidad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {entidadesDelPais.map((entidad) => (
                      <SelectItem
                        key={entidad.idEntidad}
                        value={String(entidad.idEntidad)}
                      >
                        {entidad.nombre}
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
            name="lugarDeNacimiento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lugar de nacimiento</FormLabel>
                <FormControl>
                  <InputFormateado
                    placeholder="CIUDAD DE MÉXICO"
                    {...field}
                    formato={mayusculas}
                    maxLength={100}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fechaNacimiento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de nacimiento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="genero"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Género</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un género" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MASCULINO">Masculino</SelectItem>
                    <SelectItem value="FEMENINO">Femenino</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rfc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RFC</FormLabel>
                <FormControl>
                  <InputFormateado
                    placeholder="PEGJ800101ABC"
                    {...field}
                    formato={rfc}
                    maxLength={13}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="curp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CURP</FormLabel>
                <FormControl>
                  <InputFormateado
                    placeholder="PEGJ800101HDFRZN01"
                    {...field}
                    formato={alfanumerico}
                    maxLength={18}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="estadoCivil"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado civil</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un estado civil" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {estadosCiviles?.map((item) => (
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
          <FormField
            control={form.control}
            name="nivelEstudios"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nivel de estudios</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un nivel" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {nivelesEstudios?.map((item) => (
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
          <FormField
            control={form.control}
            name="numDependientes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de dependientes</FormLabel>
                <FormControl>
                  <InputFormateado
                    inputMode="numeric"
                    placeholder="0"
                    {...field}
                    formato={soloDigitos}
                    maxLength={2}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold">Identificación</legend>
        <div className="grid items-start gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="tipoIdentificacion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de identificación</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tiposIdentificacion?.map((item) => (
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
          <FormField
            control={form.control}
            name="folioIdentificacion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Folio</FormLabel>
                <FormControl>
                  <InputFormateado
                    placeholder="0123456789012"
                    {...field}
                    formato={alfanumerico}
                    maxLength={50}
                  />
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
