import { apiClient } from "@/api/client";

export interface PersonaItem {
  id: string | number;
  referencia: string;
  nombreCompleto: string;
  tipo: "EMPLEADO" | "SOCIO";
  identificador?: string;
  puesto?: string;
  departamento?: string;
  email?: string;
  telefono?: string;
  estatus?: string;
  sucursal?: string;
  fechaIngreso?: string;
  detallesExtra?: Record<string, unknown>;
}

// Datos de prueba / simulación para pruebas de búsqueda y verificación
export const MOCK_PERSONAS: PersonaItem[] = [
  {
    id: "005-test",
    referencia: "005-test",
    nombreCompleto: "Carlos Mendoza Silva",
    tipo: "EMPLEADO",
    identificador: "MESC850412XYZ",
    puesto: "Auditor Senior de Cumplimiento",
    departamento: "Oficialía de Cumplimiento PLD",
    email: "carlos.mendoza@empresa.com",
    telefono: "+52 55 1234 5678",
    estatus: "ACTIVO",
    sucursal: "Oficina Central - Torre Corporativa",
    fechaIngreso: "2021-03-15",
  },
  {
    id: "0002",
    referencia: "0002",
    nombreCompleto: "María Fernanda Gómez Ríos",
    tipo: "EMPLEADO",
    identificador: "GOFM880215ABC",
    puesto: "Gerente de Operaciones y Tesorería",
    departamento: "Operaciones Financieras",
    email: "maria.gomez@empresa.com",
    telefono: "+52 55 9876 5432",
    estatus: "ACTIVO",
    sucursal: "Sucursal Matriz Reforma",
    fechaIngreso: "2019-08-01",
  },
  {
    id: "SOC-101",
    referencia: "SOC-101",
    nombreCompleto: "Inversiones del Norte S.A. de C.V.",
    tipo: "SOCIO",
    identificador: "INO120304999",
    puesto: "Persona Moral (Socio Inversionista)",
    departamento: "Sector Inmobiliario y Construcción",
    email: "contacto@inversionesnorte.com",
    telefono: "+52 81 8345 6789",
    estatus: "ACTIVO",
    sucursal: "Sucursal Monterrey Norte",
    fechaIngreso: "2020-01-10",
  },
  {
    id: "SOC-005",
    referencia: "SOC-005",
    nombreCompleto: "Roberto Garza Treviño",
    tipo: "SOCIO",
    identificador: "GATR750918HDF",
    puesto: "Persona Física con Actividad Empresarial",
    departamento: "Servicios Comerciales",
    email: "roberto.garza@comercio.mx",
    telefono: "+52 81 1234 0000",
    estatus: "ACTIVO",
    sucursal: "Sucursal San Pedro",
    fechaIngreso: "2022-05-20",
  },
];

/**
 * Busca empleados activos en el sistema mediante /api/empleados con fallback a datos simulados
 */
export async function buscarEmpleados(q: string, signal?: AbortSignal): Promise<PersonaItem[]> {
  if (!q || !q.trim()) return [];
  const term = q.trim().toLowerCase();

  try {
    const { data } = await apiClient.get<unknown>("/api/empleados", {
      params: { q: q.trim(), busqueda: q.trim(), nombre: q.trim() },
      signal,
    });
    const items: Record<string, unknown>[] = Array.isArray(data)
      ? data
      : (data as { content?: Record<string, unknown>[] })?.content || [];

    if (items.length > 0) {
      return items.map((item) => {
        const nombre = [item.nombre, item.primerApellido, item.segundoApellido, item.apellidoPaterno, item.apellidoMaterno]
          .filter(Boolean)
          .join(" ") || String(item.nombreCompleto || item.nombre || `Empleado #${item.id}`);

        const ref = String(item.numeroEmpleado || item.referencia || item.id || "");

        return {
          id: (item.id as string | number) ?? ref,
          referencia: ref,
          nombreCompleto: nombre,
          tipo: "EMPLEADO",
          puesto: (item.puesto || item.cargo) as string | undefined,
          departamento: (item.departamento || item.area) as string | undefined,
          email: (item.email || item.correo) as string | undefined,
          telefono: (item.telefono || item.celular) as string | undefined,
          estatus: (item.estatus || item.estado || "ACTIVO") as string | undefined,
          sucursal: (item.sucursal || item.oficina) as string | undefined,
          fechaIngreso: (item.fechaIngreso || item.fechaAlta) as string | undefined,
          identificador: (item.rfc || item.curp || item.numeroEmpleado) as string | undefined,
          detallesExtra: item,
        };
      });
    }
  } catch {
    // Si falla o el endpoint aún no está listo, se filtra de MOCK_PERSONAS
  }

  // Filtrado local de mock empleados
  return MOCK_PERSONAS.filter(
    (p) =>
      p.tipo === "EMPLEADO" &&
      (p.referencia.toLowerCase().includes(term) ||
        p.nombreCompleto.toLowerCase().includes(term) ||
        (p.identificador && p.identificador.toLowerCase().includes(term))),
  );
}

/**
 * Busca socios registrados en el sistema mediante /api/socios con fallback a datos simulados
 */
export async function buscarSocios(q: string, signal?: AbortSignal): Promise<PersonaItem[]> {
  if (!q || !q.trim()) return [];
  const term = q.trim().toLowerCase();

  try {
    const { data } = await apiClient.get<unknown>("/api/socios", {
      params: { q: q.trim(), busqueda: q.trim(), nombre: q.trim() },
      signal,
    });
    const items: Record<string, unknown>[] = Array.isArray(data)
      ? data
      : (data as { content?: Record<string, unknown>[] })?.content || [];

    if (items.length > 0) {
      return items.map((item) => {
        const nombre = [item.nombre, item.primerApellido, item.segundoApellido, item.apellidoPaterno, item.apellidoMaterno]
          .filter(Boolean)
          .join(" ") || String(item.razonSocial || item.nombreCompleto || item.nombre || `Socio #${item.id}`);

        const ref = String(item.numeroSocio || item.referencia || item.id || "");

        return {
          id: (item.id as string | number) ?? ref,
          referencia: ref,
          nombreCompleto: nombre,
          tipo: "SOCIO",
          puesto: (item.tipoPersona || item.regimen) as string | undefined,
          departamento: (item.actividadEconomica || item.sector) as string | undefined,
          email: (item.email || item.correo) as string | undefined,
          telefono: (item.telefono || item.celular) as string | undefined,
          estatus: (item.estatus || item.estado || "ACTIVO") as string | undefined,
          sucursal: (item.sucursal || item.sucursalRegistro) as string | undefined,
          fechaIngreso: (item.fechaIngreso || item.fechaAlta) as string | undefined,
          identificador: (item.rfc || item.curp || item.numeroSocio) as string | undefined,
          detallesExtra: item,
        };
      });
    }
  } catch {
    // Si falla, se filtra de MOCK_PERSONAS
  }

  // Filtrado local de mock socios
  return MOCK_PERSONAS.filter(
    (p) =>
      p.tipo === "SOCIO" &&
      (p.referencia.toLowerCase().includes(term) ||
        p.nombreCompleto.toLowerCase().includes(term) ||
        (p.identificador && p.identificador.toLowerCase().includes(term))),
  );
}

/**
 * Conecta ambos endpoints (empleados y socios) en paralelo para sugerir coincidencias
 */
export async function buscarPersonasDenunciadas(
  termino: string,
  signal?: AbortSignal,
): Promise<PersonaItem[]> {
  if (!termino || termino.trim().length < 1) return [];
  const [empleados, socios] = await Promise.all([
    buscarEmpleados(termino, signal),
    buscarSocios(termino, signal),
  ]);

  const map = new Map<string, PersonaItem>();
  [...empleados, ...socios].forEach((item) => map.set(item.referencia, item));
  return Array.from(map.values());
}

/**
 * Resuelve la persona por referencia (ej. "005-test" o "0002")
 */
export function obtenerPersonaPorRef(ref: string | null | undefined): PersonaItem | null {
  if (!ref) return null;
  const clean = ref.trim().toLowerCase();
  return MOCK_PERSONAS.find((p) => p.referencia.toLowerCase() === clean) || null;
}
