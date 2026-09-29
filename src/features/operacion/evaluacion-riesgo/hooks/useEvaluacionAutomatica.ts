import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { isAppError } from "@/api/interceptors/errorInterceptor";
import {
  useActividadesEconomicas,
  useCanalesPago,
  useDestinosRecurso,
  useLocalidades,
  useOrigenesRecurso,
  usePaises,
  usePeps,
  useTiposCredito,
  useTiposPersona,
} from "@/features/catalogos/hooks/useCatalogos";
import { useEvaluarRiesgo } from "@/features/operacion/evaluacion-riesgo/hooks/useEvaluacionRiesgo";
import type {
  ClienteMatrizRiesgo,
  EvaluacionRiesgoResultado,
} from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgo";
import {
  construirDetalles,
  type DetallesSubfactor,
} from "@/features/operacion/evaluacion-riesgo/utils/detalleSubfactor";
import {
  construirCliente,
  construirSolicitud,
  datosFaltantes,
  valoresDesdePerfil,
} from "@/features/operacion/evaluacion-riesgo/utils/solicitud";
import type { SocioPerfilRiesgo } from "@/features/socios/types/socios";
import { useAuthStore } from "@/shared/auth/authStore";
import { useSucursalActivaStore } from "@/shared/auth/sucursalActivaStore";

export type EstadoEvaluacionAutomatica =
  | { tipo: "inactivo" }
  | { tipo: "evaluando" }
  /** El perfil del socio no trae todo lo necesario: hay que completarlo en el formulario. */
  | { tipo: "incompleto"; faltantes: string[] }
  | { tipo: "error"; mensaje: string };

const INACTIVO: EstadoEvaluacionAutomatica = { tipo: "inactivo" };

export function mensajeDeErrorDeEvaluacion(error: unknown) {
  if (isAppError(error)) {
    if (error.status === 409) {
      return "El socio tiene coincidencias en listas pendientes de revisión del oficial de cumplimiento, por eso la evaluación se detuvo.";
    }
    return error.message;
  }
  return "No se pudo completar la evaluación de riesgo.";
}

/**
 * Evalúa al socio elegido sin pedir datos: si su perfil ya trae identidad, actividad, domicilio y
 * crédito solicitado, arma la solicitud y la envía una sola vez por elección. Si falta algo no
 * evalúa: lo informa para completarlo en el formulario.
 *
 * `habilitada` en falso (por ejemplo, el socio ya tiene una evaluación en la sesión) la apaga.
 * `reintentar` vuelve a evaluar con el perfil actual.
 */
export function useEvaluacionAutomatica({
  socio,
  perfil,
  habilitada,
  onResultado,
}: {
  socio: { id: string; nombre: string } | null;
  perfil: SocioPerfilRiesgo | undefined;
  habilitada: boolean;
  onResultado: (
    resultado: EvaluacionRiesgoResultado,
    cliente: ClienteMatrizRiesgo,
    detalles: DetallesSubfactor,
  ) => void;
}) {
  const evaluarRiesgo = useEvaluarRiesgo();
  const tiposPersona = useTiposPersona();
  const paises = usePaises();
  const peps = usePeps();
  const actividades = useActividadesEconomicas();
  const tiposCredito = useTiposCredito();
  const origenes = useOrigenesRecurso();
  const destinos = useDestinosRecurso();
  const canales = useCanalesPago();
  const municipioId = perfil?.domicilio?.municipioId;
  const localidades = useLocalidades(municipioId ? Number(municipioId) : undefined);

  const [intento, setIntento] = useState(0);
  const [registro, setRegistro] = useState<{
    clave: string;
    estado: EstadoEvaluacionAutomatica;
  } | null>(null);
  const ejecutada = useRef<string | null>(null);
  const alTerminar = useRef(onResultado);
  useEffect(() => {
    alTerminar.current = onResultado;
  });

  const clave = socio ? `${socio.id}#${intento}` : null;
  const valores = useMemo(() => (perfil ? valoresDesdePerfil(perfil) : null), [perfil]);

  const catalogos = [
    tiposPersona,
    paises,
    peps,
    actividades,
    tiposCredito,
    origenes,
    destinos,
    canales,
  ];
  const catalogosConError =
    catalogos.some((catalogo) => catalogo.isError) || localidades.isError;
  const catalogosListos =
    catalogos.every((catalogo) => catalogo.isSuccess) &&
    (!municipioId || localidades.isSuccess);

  const { mutate: evaluar } = evaluarRiesgo;
  const dependenciasListas = Boolean(valores) && (catalogosListos || catalogosConError);

  useEffect(() => {
    if (!habilitada || !clave || !valores || !dependenciasListas) return;
    if (ejecutada.current === clave) return;
    ejecutada.current = clave;

    const registrar = (estado: EstadoEvaluacionAutomatica) =>
      setRegistro({ clave, estado });

    if (catalogosConError) {
      registrar({
        tipo: "error",
        mensaje: "No se pudieron cargar los catálogos necesarios para evaluar.",
      });
      return;
    }

    const faltantes = datosFaltantes(valores);
    if (faltantes.length > 0) {
      registrar({ tipo: "incompleto", faltantes });
      return;
    }

    const sucursalActiva = useSucursalActivaStore.getState().sucursalActiva;
    const verificadoPor = useAuthStore.getState().usuario?.id;
    if (!sucursalActiva?.id || !verificadoPor) {
      registrar({
        tipo: "error",
        mensaje: "No se pudo determinar el usuario o la sucursal activa.",
      });
      return;
    }

    const payload = construirSolicitud(valores, {
      sucursalId: sucursalActiva.id,
      verificadoPor,
    });
    const cliente = construirCliente(
      valores,
      tiposPersona.data?.find((tipo) => tipo.id === valores.tipoPersonaId)?.nombre,
      sucursalActiva.nombre,
    );
    const detalles = construirDetalles(valores, {
      tiposPersona: tiposPersona.data,
      paises: paises.data,
      peps: peps.data,
      actividades: actividades.data,
      tiposCredito: tiposCredito.data,
      origenes: origenes.data,
      destinos: destinos.data,
      canales: canales.data,
      nombreLocalidad: localidades.data?.find(
        (localidad) => String(localidad.idLocalidad) === valores.localidadId,
      )?.nombre,
    });

    registrar({ tipo: "evaluando" });
    evaluar(payload, {
      onSuccess: (resultado) => {
        registrar(INACTIVO);
        alTerminar.current(resultado, cliente, detalles);
        toast.success("Evaluación de riesgo generada correctamente");
      },
      onError: (error) =>
        registrar({ tipo: "error", mensaje: mensajeDeErrorDeEvaluacion(error) }),
    });
  }, [
    habilitada,
    clave,
    valores,
    dependenciasListas,
    catalogosConError,
    evaluar,
    tiposPersona.data,
    paises.data,
    peps.data,
    actividades.data,
    tiposCredito.data,
    origenes.data,
    destinos.data,
    canales.data,
    localidades.data,
  ]);

  const reintentar = useCallback(() => setIntento((actual) => actual + 1), []);
  // Mientras llegan los catálogos (el perfil ya está) se considera en curso, para que el tablero no
  // muestre por un instante que el socio "no tiene evaluación".
  const estado: EstadoEvaluacionAutomatica =
    registro && registro.clave === clave
      ? registro.estado
      : habilitada && clave && valores
        ? { tipo: "evaluando" }
        : INACTIVO;

  return { estado, reintentar };
}
