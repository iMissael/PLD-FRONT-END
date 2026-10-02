import { MapPinHouse } from "lucide-react";
import { useMemo } from "react";
import { useWatch } from "react-hook-form";
import {
  useEntidades,
  useLocalidades,
  useMunicipios,
  usePaises,
  usePosesionesVivienda,
  useTiposAsentamiento,
  useTiposComprobante,
  useTiposVialidad,
} from "@/features/catalogos/hooks/useCatalogos";
import {
  CampoCatalogo,
  CampoSelect,
  CampoTexto,
  InsigniaSeccion,
  SeccionFicha,
  type FichaForm,
  type OpcionCatalogo,
} from "@/features/configuraciones/oficial-cumplimiento/components/campos";
import {
  mayusculas,
  numeroDomicilio,
  soloDigitos,
} from "@/shared/utils/entradas";
import { hoyIso } from "@/shared/utils/fechas";

function aNumeroOIndefinido(valor: string | undefined) {
  if (!valor) return undefined;
  const numero = Number(valor);
  return Number.isNaN(numero) ? undefined : numero;
}

function opcionesDe(items: { id?: string; descripcion?: string }[] | undefined) {
  return (items ?? [])
    .filter((item) => item.id)
    .map((item) => ({ valor: item.id ?? "", etiqueta: item.descripcion ?? "" }));
}

export function SeccionDomicilio({ form }: { form: FichaForm }) {
  const { data: tiposComprobante } = useTiposComprobante();
  const { data: tiposVialidad } = useTiposVialidad();
  const { data: posesionesVivienda } = usePosesionesVivienda();
  const { data: tiposAsentamiento } = useTiposAsentamiento();
  const { data: paises } = usePaises();
  const { data: entidades } = useEntidades();

  const comprobante = useWatch({ control: form.control, name: "tipoComprobante" });
  const pais = useWatch({ control: form.control, name: "domicilioPaisId" });
  const entidad = useWatch({ control: form.control, name: "domicilioEntidadId" });
  const municipio = useWatch({ control: form.control, name: "municipioId" });
  const asentamiento = useWatch({ control: form.control, name: "tipoAsentamiento" });

  const { data: municipios, isFetching: cargandoMunicipios } = useMunicipios(
    aNumeroOIndefinido(entidad),
  );
  const { data: localidades, isFetching: cargandoLocalidades } = useLocalidades(
    aNumeroOIndefinido(municipio),
  );

  const opcionesPaises = useMemo<OpcionCatalogo[]>(
    () =>
      (paises ?? [])
        .filter((item) => item.idPais)
        .map((item) => ({
          valor: item.idPais ?? "",
          etiqueta: item.nombre ?? "",
          codigo: item.codigoIso,
        })),
    [paises],
  );
  const opcionesEntidades = useMemo<OpcionCatalogo[]>(
    () =>
      (entidades ?? [])
        .filter((item) => !pais || item.idPais === pais)
        .map((item) => ({
          valor: String(item.idEntidad),
          etiqueta: item.nombre ?? "",
          codigo: item.claveCurp,
        })),
    [entidades, pais],
  );
  const opcionesMunicipios = useMemo<OpcionCatalogo[]>(
    () =>
      (municipios ?? []).map((item) => ({
        valor: String(item.id),
        etiqueta: item.nombre ?? "",
      })),
    [municipios],
  );
  const opcionesLocalidades = useMemo<OpcionCatalogo[]>(
    () =>
      (localidades ?? []).map((item) => ({
        valor: String(item.idLocalidad),
        etiqueta: item.nombre ?? "",
      })),
    [localidades],
  );
  // Se guarda la descripción (no un id): si el catálogo no la trae, se conserva visible el valor actual.
  const opcionesAsentamiento = useMemo<OpcionCatalogo[]>(() => {
    const opciones = (tiposAsentamiento ?? [])
      .filter((item) => item.descripcion)
      .map((item) => ({
        valor: item.descripcion ?? "",
        etiqueta: item.descripcion ?? "",
      }));
    if (asentamiento && !opciones.some((opcion) => opcion.valor === asentamiento)) {
      opciones.push({ valor: asentamiento, etiqueta: asentamiento });
    }
    return opciones;
  }, [tiposAsentamiento, asentamiento]);

  const nombreComprobante = tiposComprobante?.find(
    (item) => item.id === comprobante,
  )?.descripcion;

  function limpiar(...campos: ("domicilioEntidadId" | "municipioId" | "localidadId")[]) {
    campos.forEach((campo) => form.setValue(campo, "", { shouldDirty: true }));
  }


  return (
    <SeccionFicha
      icono={MapPinHouse}
      titulo="Domicilio"
      descripcion="Ubicación geográfica residencial y comprobante de domicilio."
      insignia={
        nombreComprobante ? (
          <InsigniaSeccion tono="ok">Comprobante: {nombreComprobante}</InsigniaSeccion>
        ) : null
      }
    >
      <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-12">
        <CampoSelect
          form={form}
          name="tipoComprobante"
          label="Tipo de comprobante"
          placeholder="Selecciona un comprobante"
          opciones={opcionesDe(tiposComprobante)}
          className="lg:col-span-4"
        />
        <CampoSelect
          form={form}
          name="tipoVialidad"
          label="Tipo de vialidad"
          placeholder="Selecciona una vialidad"
          opciones={opcionesDe(tiposVialidad)}
          className="lg:col-span-3"
        />
        <CampoTexto
          form={form}
          name="calle"
          label="Calle"
          formato={mayusculas}
          maxLength={100}
          className="sm:col-span-2 lg:col-span-5"
        />
      </div>

      <div className="grid grid-cols-2 items-start gap-5 lg:grid-cols-12">
        <CampoTexto
          form={form}
          name="numExterior"
          label="# Ext"
          formato={numeroDomicilio}
          maxLength={10}
          className="lg:col-span-2 [&_input]:text-center"
        />
        <CampoTexto
          form={form}
          name="numInterior"
          label="# Int"
          formato={numeroDomicilio}
          maxLength={10}
          className="lg:col-span-2 [&_input]:text-center"
        />
        <CampoTexto
          form={form}
          name="nombreCalleIzquierda"
          label="Calle a la izquierda"
          formato={mayusculas}
          maxLength={50}
          placeholder="Calle lateral 1"
          className="col-span-2 lg:col-span-4"
        />
        <CampoTexto
          form={form}
          name="nombreCalleDerecha"
          label="Calle a la derecha"
          formato={mayusculas}
          maxLength={50}
          placeholder="Calle lateral 2"
          className="col-span-2 lg:col-span-4"
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-12">
        <CampoTexto
          form={form}
          name="referencia"
          label="Referencia de ubicación"
          formato={mayusculas}
          maxLength={100}
          placeholder="Fachada blanca, portón café, cerca del parque…"
          className="sm:col-span-2 lg:col-span-6"
        />
        <CampoSelect
          form={form}
          name="posesionVivienda"
          label="La casa es"
          placeholder="Selecciona una opción"
          opciones={opcionesDe(posesionesVivienda)}
          className="lg:col-span-3"
        />
        <CampoTexto
          form={form}
          name="antiguedadDomicilio"
          label="Antigüedad en el domicilio"
          type="date"
          max={hoyIso()}
          className="lg:col-span-3"
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-12">
        <CampoTexto
          form={form}
          name="codigoPostal"
          label="C.P."
          inputMode="numeric"
          formato={soloDigitos}
          maxLength={5}
          placeholder="5 dígitos"
          className="lg:col-span-2 [&_input]:text-center [&_input]:font-mono [&_input]:font-bold"
        />
        <CampoSelect
          form={form}
          name="tipoAsentamiento"
          label="Tipo de asentamiento"
          placeholder="Selecciona un tipo"
          opciones={opcionesAsentamiento}
          className="lg:col-span-4"
        />
        <CampoTexto
          form={form}
          name="colonia"
          label="Colonia"
          formato={mayusculas}
          maxLength={100}
          className="sm:col-span-2 lg:col-span-6"
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2">
        <CampoCatalogo
          form={form}
          name="domicilioPaisId"
          label="País"
          placeholder="Busca un país"
          opciones={opcionesPaises}
          requerido
          alCambiar={() => limpiar("domicilioEntidadId", "municipioId", "localidadId")}
        />
        <CampoCatalogo
          form={form}
          name="domicilioEntidadId"
          label="Entidad federativa"
          placeholder="Busca una entidad"
          opciones={opcionesEntidades}
          requerido
          alCambiar={() => limpiar("municipioId", "localidadId")}
        />
        <CampoCatalogo
          form={form}
          name="municipioId"
          label="Municipio / alcaldía"
          placeholder={entidad ? "Busca un municipio" : "Elige primero la entidad"}
          opciones={opcionesMunicipios}
          requerido
          deshabilitado={!entidad}
          cargando={cargandoMunicipios}
          alCambiar={() => limpiar("localidadId")}
        />
        <CampoCatalogo
          form={form}
          name="localidadId"
          label="Localidad"
          placeholder={municipio ? "Busca una localidad" : "Elige primero el municipio"}
          opciones={opcionesLocalidades}
          requerido
          deshabilitado={!municipio}
          cargando={cargandoLocalidades}
        />
      </div>
    </SeccionFicha>
  );
}
