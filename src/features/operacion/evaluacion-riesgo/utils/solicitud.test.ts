import { describe, expect, it } from "vitest";
import type { AcreditadoPerfilRiesgo } from "@/features/acreditados/types/acreditados";
import {
  construirCliente,
  construirSolicitud,
  datosFaltantes,
  valoresDesdePerfil,
} from "@/features/operacion/evaluacion-riesgo/utils/solicitud";

const perfilCompleto: AcreditadoPerfilRiesgo = {
  referencia: "CLI-001",
  nombre: "LUCÍA MARTÍNEZ HERRERA",
  nombres: "LUCÍA",
  apellidoPaterno: "MARTÍNEZ",
  apellidoMaterno: "HERRERA",
  rfc: "MAHL9005147K2",
  curp: "MAHL900514MDFRRC05",
  fechaNacimiento: "1990-05-14",
  esPep: false,
  tipoPersona: { id: 1, nombre: "Persona Física Nacional" },
  nacionalidad: { id: 165, nombre: "México" },
  actividadEconomica: { id: 10, descripcion: "CULTIVO DE SOYA" },
  sucursal: "SUC-001",
  domicilio: {
    paisId: "165",
    entidadId: "9",
    municipioId: "288",
    localidadId: "105249",
    calle: "INSURGENTES SUR",
    tipoCalle: "AVENIDA",
    noExterior: "1234",
    noInterior: "5",
    codigoPostal: "03100",
    tipoAsentamiento: "Colonia",
    nombreAsentamiento: "DEL VALLE CENTRO",
  },
  fechaInicioActividad: "2020-01-15",
  pepNacionalId: undefined,
  creditoSolicitado: {
    referencia: "CRED-001",
    tipo: 1,
    monto: 50000,
    origenRecursos: 2,
    destinoRecursos: 3,
    canalPagoId: 4,
    estatus: "APROBADO",
  },
  historialCrediticio: [
    {
      referencia: "HIST-001-1",
      tipo: 1,
      monto: 15000,
      fechaOtorgamiento: "2023-02-10",
      estatus: "PAGADO",
    },
  ],
};

const contexto = { sucursalId: "SUC-001", verificadoPor: "uuid-admin" };

describe("valoresDesdePerfil", () => {
  it("pasa el perfil completo a los campos del formulario", () => {
    const valores = valoresDesdePerfil(perfilCompleto);
    expect(valores).toMatchObject({
      acreditadoReferencia: "CLI-001",
      acreditadoNombres: "LUCÍA",
      tipoPersonaId: "1",
      nacionalidadId: "165",
      fechaNacimiento: "1990-05-14",
      fechaInicioActividad: "2020-01-15",
      pepNacionalId: "",
      actividadEconomicaId: "10",
      localidadId: "105249",
      noExterior: "1234",
      creditoReferencia: "CRED-001",
      creditoTipo: "1",
      monto: "50000",
      moneda: "MXN",
      origenRecursos: "2",
      destinoRecursos: "3",
      canalPagoId: "4",
    });
    expect(valores.creditosAnteriores).toEqual([
      {
        referencia: "HIST-001-1",
        tipo: "1",
        monto: "15000",
        moneda: "MXN",
        fechaOtorgamiento: "2023-02-10",
        estatus: "PAGADO",
      },
    ]);
  });

  it("deja vacío lo que el perfil no trae", () => {
    const valores = valoresDesdePerfil({ referencia: "EXT-1", nombre: "Acreditado externo" });
    expect(valores.fechaInicioActividad).toBe("");
    expect(valores.creditoTipo).toBe("");
    expect(valores.localidadId).toBe("");
    expect(valores.creditosAnteriores).toEqual([]);
  });
});

describe("datosFaltantes", () => {
  it("un perfil completo se puede evaluar sin capturar nada", () => {
    expect(datosFaltantes(valoresDesdePerfil(perfilCompleto))).toEqual([]);
  });

  it("nombra lo que falta cuando solo hay identidad (acreditado del sistema externo)", () => {
    const faltantes = datosFaltantes(
      valoresDesdePerfil({
        referencia: "CLI-CORP-001",
        nombre: "Acreditado Alpha",
        rfc: "CALP850101XYZ",
      }),
    );
    expect(faltantes).toEqual([
      "Tipo de persona",
      "Nacionalidad",
      "Fecha de nacimiento o constitución",
      "Fecha de inicio de actividad",
      "Actividad económica",
      "Domicilio (localidad)",
      "Tipo de crédito",
      "Monto del crédito",
      "Origen de los recursos",
      "Destino de los recursos",
      "Canal de pago",
    ]);
  });

  it("sin crédito solicitado pide solo los datos del crédito", () => {
    const sinCredito = { ...perfilCompleto, creditoSolicitado: undefined };
    expect(datosFaltantes(valoresDesdePerfil(sinCredito))).toEqual([
      "Tipo de crédito",
      "Monto del crédito",
      "Origen de los recursos",
      "Destino de los recursos",
      "Canal de pago",
    ]);
  });

  it("sin fecha de inicio de actividad no se puede evaluar", () => {
    const sinFecha = { ...perfilCompleto, fechaInicioActividad: undefined };
    expect(datosFaltantes(valoresDesdePerfil(sinFecha))).toEqual([
      "Fecha de inicio de actividad",
    ]);
  });
});

describe("construirSolicitud", () => {
  const ahora = new Date("2026-09-26T10:00:00Z");
  const solicitud = construirSolicitud(
    valoresDesdePerfil(perfilCompleto),
    contexto,
    ahora,
  );

  it("lleva el contexto del usuario y la sucursal", () => {
    expect(solicitud.meta).toEqual({
      timestamp: "2026-09-26T10:00:00.000Z",
      sucursal_id: "SUC-001",
      usuario_verificador_ref: "uuid-admin",
    });
  });

  it("arma el acreditado con su identidad y actividad", () => {
    expect(solicitud.acreditado).toEqual({
      acreditado_ref: "CLI-001",
      nombre: "LUCÍA",
      apellido_p: "MARTÍNEZ",
      apellido_m: "HERRERA",
      rfc: "MAHL9005147K2",
      curp: "MAHL900514MDFRRC05",
      tipo_acreditado_id: 1,
      nacionalidad_id: 165,
      fecha_nacimiento: "1990-05-14",
      fecha_inicio_actividad_economica: "2020-01-15",
      actividad_economica_id: 10,
    });
  });

  it("arma el domicilio con la localidad y los números", () => {
    expect(solicitud.domicilio?.localidad_id).toBe(105249);
    expect(solicitud.domicilio?.direccion).toMatchObject({
      calle: "INSURGENTES SUR",
      tipo_calle: "AVENIDA",
      no_exterior: "1234",
      no_interior: "5",
      codigo_postal: "03100",
      tipo: "Colonia",
      nombre: "DEL VALLE CENTRO",
    });
  });

  it("manda el crédito solicitado con los catálogos como número", () => {
    expect(solicitud.credito).toEqual({
      credito_ref: "CRED-001",
      tipo_id: 1,
      monto: 50000,
      origen_recursos: 2,
      destino_recursos: 3,
      canal_pago_id: 4,
      tipo_pago_id: undefined,
    });
  });

  it("manda el historial crediticio, y lo omite si no hay créditos anteriores", () => {
    expect(solicitud.historial_crediticio?.creditos_anteriores).toEqual([
      {
        credito_ref: "HIST-001-1",
        tipo_credito_id: 1,
        monto: 15000,
        fecha_otorgamiento: "2023-02-10",
        estatus: "PAGADO",
      },
    ]);
    const sinHistorial = construirSolicitud(
      valoresDesdePerfil({ ...perfilCompleto, historialCrediticio: [] }),
      contexto,
    );
    expect(sinHistorial.historial_crediticio).toBeUndefined();
  });
});

describe("construirCliente", () => {
  it("arma el expediente que muestra el tablero", () => {
    const cliente = construirCliente(
      valoresDesdePerfil(perfilCompleto),
      "Persona Moral Nacional",
      "SUCURSAL MATRIZ",
      new Date(2026, 8, 26, 10, 5, 7),
    );
    expect(cliente).toMatchObject({
      nombre: "LUCÍA MARTÍNEZ HERRERA",
      referencia: "CLI-001",
      rfc: "MAHL9005147K2",
      persona: "MORAL",
      tipoCliente: "Persona Moral Nacional",
      sucursal: "SUCURSAL MATRIZ",
      fechaModificacion: "2026-09-26 10:05:07",
    });
  });
});
