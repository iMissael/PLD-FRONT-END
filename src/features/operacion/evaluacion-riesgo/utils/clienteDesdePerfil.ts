import type { ClienteMatrizRiesgo } from "@/features/operacion/evaluacion-riesgo/types/evaluacionRiesgo";
import type { AcreditadoPerfilRiesgo } from "@/features/acreditados/types/acreditados";

const PREFIJO_PERSONA = "PERS-";

/** Expediente que se muestra al elegir un acreditado que todavía no tiene una evaluación en la sesión. */
export function clienteDesdePerfil(perfil: AcreditadoPerfilRiesgo): ClienteMatrizRiesgo {
  const referencia = perfil.referencia ?? "—";
  return {
    nombre: perfil.nombre ?? "—",
    numero: referencia.startsWith(PREFIJO_PERSONA)
      ? referencia.slice(PREFIJO_PERSONA.length)
      : referencia,
    referencia,
    rfc: perfil.rfc || "—",
    curp: perfil.curp || "—",
    persona: /moral/i.test(perfil.tipoPersona?.nombre ?? "") ? "MORAL" : "FISICA",
    tipoCliente: perfil.tipoPersona?.nombre ?? "—",
    fechaAlta: "—",
    sucursal: perfil.sucursal ?? "—",
    fechaModificacion: "—",
  };
}
