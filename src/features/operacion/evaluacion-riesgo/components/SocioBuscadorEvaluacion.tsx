import { useCallback, useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import type { EvaluacionRiesgoFormValues } from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgoSchema";
import {
  useActividadesEconomicas,
  useCanalesPago,
  useDestinosRecurso,
  useEntidades,
  useLocalidades,
  useMunicipios,
  useOrigenesRecurso,
  usePaises,
  useTiposAsentamiento,
  useTiposCredito,
  useTiposPersona,
} from "@/features/catalogos/hooks/useCatalogos";
import { useBuscarSocios, usePerfilRiesgoSocio } from "@/features/socios/hooks/useSocios";
import { MONEDA_POR_DEFECTO } from "@/features/operacion/evaluacion-riesgo/utils/solicitud";
import type { SocioPerfilRiesgo } from "@/features/socios/types/socios";

// Campos del fieldset "Socio": pertenecen al socio elegido, no a la evaluación.
const CAMPOS_DEL_SOCIO = [
  "socioNombre",
  "socioNombres",
  "socioApellidoP",
  "socioApellidoM",
  "rfc",
  "curp",
  "tipoPersonaId",
  "nacionalidadId",
  "fechaNacimiento",
  "antiguedadGiroAnios",
  "pepNacionalId",
  "actividadEconomicaId",
  "paisId",
  "entidadId",
  "municipioId",
  "localidadId",
  "calle",
  "tipoCalle",
  "noExterior",
  "noInterior",
  "codigoPostal",
  "asentamientoTipo",
  "asentamientoNombre",
] as const;

// Campos del crédito solicitado: también salen del socio (credito_solicitado).
const CAMPOS_DEL_CREDITO = [
  "creditoReferencia",
  "creditoTipo",
  "monto",
  "origenRecursos",
  "destinoRecursos",
  "canalPagoId",
] as const;

function aTexto(valor: string | number | undefined | null) {
  return valor === undefined || valor === null ? "" : String(valor);
}

export function SocioBuscadorEvaluacion({
  form,
  socioInicial,
}: {
  form: UseFormReturn<EvaluacionRiesgoFormValues>;
  socioInicial?: { id: string; nombre: string };
}) {
  const [busqueda, setBusqueda] = useState("");
  const yaPreseleccionado = useRef(false);
  const perfilPendiente = useRef<string | null>(null);
  // Municipio y localidad dependen de catálogos que se piden al elegir la entidad y el municipio,
  // así que se asignan cuando esas listas llegan.
  const domicilioPendiente = useRef<{
    municipioId?: string;
    localidadId?: string;
  } | null>(null);
  const socioReferencia = form.watch("socioReferencia");
  const socioNombre = form.watch("socioNombre");
  const { data: socios, isFetching } = useBuscarSocios(busqueda);
  const perfilRiesgo = usePerfilRiesgoSocio();
  const { mutate: cargarPerfil } = perfilRiesgo;

  // Los selects del formulario reinician a vacío un valor cuyo catálogo aún no llegó, así que
  // el perfil se aplica hasta que estén los catálogos que llena (tipo, nacionalidad, actividad).
  const { isSuccess: tiposPersonaListos } = useTiposPersona();
  const { isSuccess: paisesListos } = usePaises();
  const { isSuccess: actividadesListas } = useActividadesEconomicas();
  const { isSuccess: entidadesListas } = useEntidades();
  const { isSuccess: asentamientosListos } = useTiposAsentamiento();
  const { isSuccess: tiposCreditoListos } = useTiposCredito();
  const { isSuccess: origenesListos } = useOrigenesRecurso();
  const { isSuccess: destinosListos } = useDestinosRecurso();
  const { isSuccess: canalesListos } = useCanalesPago();
  const catalogosListos =
    tiposPersonaListos &&
    paisesListos &&
    actividadesListas &&
    entidadesListas &&
    asentamientosListos &&
    tiposCreditoListos &&
    origenesListos &&
    destinosListos &&
    canalesListos;

  const entidadId = form.watch("entidadId");
  const municipioId = form.watch("municipioId");
  const { data: municipios } = useMunicipios(entidadId ? Number(entidadId) : undefined);
  const { data: localidades } = useLocalidades(
    municipioId ? Number(municipioId) : undefined,
  );

  useEffect(() => {
    const pendiente = domicilioPendiente.current;
    if (!pendiente?.municipioId || !municipios) return;
    if (municipios.some((m) => String(m.id) === pendiente.municipioId)) {
      form.setValue("municipioId", pendiente.municipioId, { shouldValidate: true });
    }
    pendiente.municipioId = undefined;
  }, [municipios, form]);

  useEffect(() => {
    const pendiente = domicilioPendiente.current;
    if (!pendiente?.localidadId || pendiente.municipioId || !localidades) return;
    if (localidades.some((l) => String(l.idLocalidad) === pendiente.localidadId)) {
      form.setValue("localidadId", pendiente.localidadId, { shouldValidate: true });
    }
    domicilioPendiente.current = null;
  }, [localidades, form]);

  function limpiarDatosDelSocio() {
    domicilioPendiente.current = null;
    CAMPOS_DEL_SOCIO.forEach((campo) => form.setValue(campo, ""));
    CAMPOS_DEL_CREDITO.forEach((campo) => form.setValue(campo, ""));
    form.setValue("creditosAnteriores", []);
  }

  const aplicarPerfil = useCallback(
    (perfil: SocioPerfilRiesgo) => {
      if (perfil.nombre)
        form.setValue("socioNombre", perfil.nombre, { shouldValidate: true });
      form.setValue("socioNombres", perfil.nombres ?? "");
      form.setValue("socioApellidoP", perfil.apellidoPaterno ?? "");
      form.setValue("socioApellidoM", perfil.apellidoMaterno ?? "");
      form.setValue("rfc", perfil.rfc ?? "");
      form.setValue("curp", perfil.curp ?? "");
      form.setValue("fechaNacimiento", perfil.fechaNacimiento ?? "");
      if (perfil.tipoPersona?.id) {
        form.setValue("tipoPersonaId", perfil.tipoPersona.id, { shouldValidate: true });
      }
      if (perfil.nacionalidad?.id) {
        form.setValue("nacionalidadId", perfil.nacionalidad.id, { shouldValidate: true });
      }
      if (perfil.actividadEconomica?.id) {
        form.setValue("actividadEconomicaId", perfil.actividadEconomica.id, {
          shouldValidate: true,
        });
      }
      form.setValue("antiguedadGiroAnios", aTexto(perfil.antiguedadGiroAnios), {
        shouldValidate: perfil.antiguedadGiroAnios != null,
      });
      form.setValue("pepNacionalId", aTexto(perfil.pepNacionalId));
      const credito = perfil.creditoSolicitado;
      if (credito) {
        form.setValue("creditoReferencia", aTexto(credito.referencia));
        form.setValue("creditoTipo", aTexto(credito.tipo), { shouldValidate: true });
        form.setValue("monto", aTexto(credito.monto), { shouldValidate: true });
        form.setValue("origenRecursos", aTexto(credito.origenRecursos), {
          shouldValidate: true,
        });
        form.setValue("destinoRecursos", aTexto(credito.destinoRecursos), {
          shouldValidate: true,
        });
        form.setValue("canalPagoId", aTexto(credito.canalPagoId), {
          shouldValidate: true,
        });
      }
      form.setValue(
        "creditosAnteriores",
        (perfil.historialCrediticio ?? []).map((anterior) => ({
          referencia: aTexto(anterior.referencia),
          tipo: aTexto(anterior.tipo),
          monto: aTexto(anterior.monto),
          moneda: MONEDA_POR_DEFECTO,
          fechaOtorgamiento: aTexto(anterior.fechaOtorgamiento),
          estatus: aTexto(anterior.estatus),
        })),
      );
      const domicilio = perfil.domicilio;
      if (domicilio) {
        form.setValue("paisId", aTexto(domicilio.paisId), { shouldValidate: true });
        form.setValue("entidadId", aTexto(domicilio.entidadId), { shouldValidate: true });
        form.setValue("calle", aTexto(domicilio.calle));
        form.setValue("tipoCalle", aTexto(domicilio.tipoCalle));
        form.setValue("noExterior", aTexto(domicilio.noExterior));
        form.setValue("noInterior", aTexto(domicilio.noInterior));
        form.setValue("codigoPostal", aTexto(domicilio.codigoPostal));
        form.setValue("asentamientoTipo", aTexto(domicilio.tipoAsentamiento));
        form.setValue("asentamientoNombre", aTexto(domicilio.nombreAsentamiento));
        domicilioPendiente.current = {
          municipioId: domicilio.municipioId,
          localidadId: domicilio.localidadId,
        };
      }
      toast.success(
        perfil.creditoSolicitado
          ? "Datos del socio y de su crédito cargados. Revisa y ajusta lo que haga falta."
          : "Datos del socio cargados. Completa lo que falte.",
      );
    },
    [form],
  );

  const pedirPerfil = useCallback(
    (id: string) => {
      cargarPerfil(id, {
        onSuccess: aplicarPerfil,
        onError: () => {
          toast.error(
            "No se encontraron datos adicionales de este socio; completa el resto a mano.",
          );
        },
      });
    },
    [cargarPerfil, aplicarPerfil],
  );

  useEffect(() => {
    if (!catalogosListos || !perfilPendiente.current) return;
    const id = perfilPendiente.current;
    perfilPendiente.current = null;
    pedirPerfil(id);
  }, [catalogosListos, pedirPerfil]);

  function elegirSocio(id: string, nombre: string) {
    setBusqueda("");
    limpiarDatosDelSocio();
    form.setValue("socioReferencia", id, { shouldValidate: true });
    form.setValue("socioNombre", nombre, { shouldValidate: true });

    if (catalogosListos) {
      pedirPerfil(id);
    } else {
      perfilPendiente.current = id;
    }
  }

  useEffect(() => {
    if (!socioInicial || yaPreseleccionado.current) return;
    yaPreseleccionado.current = true;
    elegirSocio(socioInicial.id, socioInicial.nombre);
    // Solo al montar: el socio inicial no cambia mientras el formulario está abierto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cambiarSocio() {
    perfilPendiente.current = null;
    perfilRiesgo.reset();
    limpiarDatosDelSocio();
    form.setValue("socioReferencia", "", { shouldValidate: true });
  }

  if (socioReferencia) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="text-sm">
          {socioNombre || socioReferencia}
        </Badge>
        {perfilRiesgo.data?.esPep && <Badge variant="destructive">PEP</Badge>}
        {perfilRiesgo.isPending && (
          <span className="text-muted-foreground text-xs">Cargando datos…</span>
        )}
        <button
          type="button"
          onClick={cambiarSocio}
          className="text-muted-foreground text-xs underline underline-offset-2"
        >
          Cambiar socio
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Input
        placeholder="Buscar socio por nombre…"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      {busqueda.trim().length >= 2 && (
        <div className="bg-popover absolute z-10 mt-1 w-full rounded-md border shadow-md">
          {isFetching && <p className="text-muted-foreground p-2 text-sm">Buscando…</p>}
          {!isFetching && socios?.length === 0 && (
            <p className="text-muted-foreground p-2 text-sm">Sin resultados.</p>
          )}
          {socios?.map((socio) => (
            <button
              key={socio.id}
              type="button"
              onClick={() => elegirSocio(socio.id ?? "", socio.nombre ?? "")}
              className="hover:bg-accent flex w-full flex-col items-start px-3 py-2 text-left text-sm"
            >
              <span className="font-medium">{socio.nombre}</span>
              <span className="text-muted-foreground text-xs">
                {socio.id} · {socio.rfc}
              </span>
            </button>
          ))}
        </div>
      )}
      {form.formState.errors.socioReferencia && (
        <p className="text-destructive mt-1 text-sm">
          {form.formState.errors.socioReferencia.message}
        </p>
      )}
    </div>
  );
}
