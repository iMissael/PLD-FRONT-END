import { IdCard, Mail, Phone, UserRound } from "lucide-react";
import { useMemo } from "react";
import { useWatch } from "react-hook-form";
import { Label } from "@/shared/components/ui/label";
import {
  useEntidades,
  useEstadosCiviles,
  useNacionalidades,
  useNivelesEstudios,
  usePaises,
  useTiposIdentificacion,
} from "@/features/catalogos/hooks/useCatalogos";
import {
  CampoGenero,
  CampoSelect,
  CampoTexto,
  InsigniaSeccion,
  SeccionFicha,
  type FichaForm,
  type OpcionCatalogo,
} from "@/features/configuraciones/oficial-cumplimiento/components/campos";
import { CLASE_ETIQUETA } from "@/features/configuraciones/oficial-cumplimiento/components/estilos";
import {
  alfanumerico,
  correo,
  mayusculas,
  nombrePropio,
  rfc,
  soloDigitos,
} from "@/shared/utils/entradas";
import { calcularEdad, hoyIso } from "@/shared/utils/fechas";

function opcionesDe(items: { id?: string; descripcion?: string }[] | undefined) {
  return (items ?? [])
    .filter((item) => item.id)
    .map((item) => ({ valor: item.id ?? "", etiqueta: item.descripcion ?? "" }));
}

export function SeccionDatosGenerales({
  form,
  idRegistro,
}: {
  form: FichaForm;
  idRegistro?: string;
}) {
  const { data: nacionalidades } = useNacionalidades();
  const { data: estadosCiviles } = useEstadosCiviles();
  const { data: nivelesEstudios } = useNivelesEstudios();
  const { data: tiposIdentificacion } = useTiposIdentificacion();
  const { data: paises } = usePaises();
  const { data: entidades } = useEntidades();

  const paisNacimiento = useWatch({ control: form.control, name: "paisNacimientoId" });
  const fechaNacimiento = useWatch({ control: form.control, name: "fechaNacimiento" });
  const edad = calcularEdad(fechaNacimiento);

  const opcionesPaises = useMemo<OpcionCatalogo[]>(
    () =>
      (paises ?? [])
        .filter((pais) => pais.idPais)
        .map((pais) => ({ valor: pais.idPais ?? "", etiqueta: pais.nombre ?? "" })),
    [paises],
  );
  const opcionesEntidades = useMemo<OpcionCatalogo[]>(
    () =>
      (entidades ?? [])
        .filter((entidad) => !paisNacimiento || entidad.idPais === paisNacimiento)
        .map((entidad) => ({
          valor: String(entidad.idEntidad),
          etiqueta: entidad.nombre ?? "",
        })),
    [entidades, paisNacimiento],
  );

  return (
    <SeccionFicha
      icono={UserRound}
      titulo="Datos generales"
      descripcion="Información básica del titular y validación de su identidad oficial."
      insignia={
        idRegistro ? <InsigniaSeccion>ID registro: #{idRegistro}</InsigniaSeccion> : null
      }
    >
      <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-3">
        <CampoTexto
          form={form}
          name="nombre"
          label="Nombre(s)"
          requerido
          formato={nombrePropio}
          maxLength={150}
        />
        <CampoTexto
          form={form}
          name="primerApellido"
          label="Primer apellido"
          formato={nombrePropio}
          maxLength={100}
        />
        <CampoTexto
          form={form}
          name="segundoApellido"
          label="Segundo apellido"
          formato={nombrePropio}
          maxLength={100}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-3">
        <CampoSelect
          form={form}
          name="paisNacimientoId"
          label="País de nacimiento"
          placeholder="Selecciona un país"
          opciones={opcionesPaises}
          alCambiar={() =>
            form.setValue("entidadNacimientoId", "", { shouldDirty: true })
          }
        />
        <CampoSelect
          form={form}
          name="entidadNacimientoId"
          label="Entidad de nacimiento"
          placeholder="Selecciona una entidad"
          opciones={opcionesEntidades}
        />
        <CampoSelect
          form={form}
          name="nacionalidadId"
          label="Nacionalidad"
          placeholder="Selecciona una nacionalidad"
          opciones={opcionesDe(nacionalidades)}
          requerido
        />
      </div>

      <CampoTexto
        form={form}
        name="lugarDeNacimiento"
        label="Lugar de nacimiento"
        formato={mayusculas}
        maxLength={100}
      />

      <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-12">
        <CampoTexto
          form={form}
          name="fechaNacimiento"
          label="Fecha de nacimiento"
          type="date"
          min="1900-01-01"
          max={hoyIso()}
          className="lg:col-span-3"
        />
        <div className="space-y-2 lg:col-span-1">
          <Label className={CLASE_ETIQUETA}>Edad</Label>
          <div
            aria-label="Edad calculada"
            className="flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-slate-100 text-sm font-bold text-slate-700"
          >
            {edad ?? "—"}
          </div>
        </div>
        <CampoGenero form={form} className="lg:col-span-3" />
        <CampoTexto
          form={form}
          name="rfc"
          label="RFC"
          formato={rfc}
          maxLength={13}
          className="lg:col-span-2 [&_input]:font-mono [&_input]:tracking-wider"
        />
        <CampoTexto
          form={form}
          name="curp"
          label="CURP"
          formato={alfanumerico}
          maxLength={18}
          className="sm:col-span-2 lg:col-span-3 [&_input]:font-mono [&_input]:tracking-wider"
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-3">
        <CampoSelect
          form={form}
          name="estadoCivilId"
          label="Estado civil"
          placeholder="Selecciona un estado civil"
          opciones={opcionesDe(estadosCiviles)}
        />
        <CampoTexto
          form={form}
          name="numDependientes"
          label="No. de dependientes"
          inputMode="numeric"
          formato={soloDigitos}
          maxLength={2}
        />
        <CampoSelect
          form={form}
          name="nivelEstudiosId"
          label="Nivel de estudios"
          placeholder="Selecciona un nivel"
          opciones={opcionesDe(nivelesEstudios)}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2">
        <CampoSelect
          form={form}
          name="tipoIdentificacionId"
          label="Tipo de identificación oficial"
          placeholder="Selecciona un tipo"
          opciones={opcionesDe(tiposIdentificacion)}
          icono={IdCard}
        />
        <CampoTexto
          form={form}
          name="folioIdentificacion"
          label="Folio de identificación"
          formato={alfanumerico}
          maxLength={50}
          className="[&_input]:font-mono [&_input]:font-bold [&_input]:tracking-wider"
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2">
        <CampoTexto
          form={form}
          name="telefono"
          label="Teléfono celular"
          type="tel"
          inputMode="numeric"
          formato={soloDigitos}
          maxLength={10}
          placeholder="10 dígitos"
          icono={Phone}
        />
        <CampoTexto
          form={form}
          name="correo"
          label="Correo electrónico"
          inputMode="email"
          formato={correo}
          maxLength={150}
          autoCapitalize="none"
          spellCheck={false}
          icono={Mail}
        />
      </div>
    </SeccionFicha>
  );
}
