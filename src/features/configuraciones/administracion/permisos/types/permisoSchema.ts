import { z } from "zod";
import { texto } from "@/shared/utils/validacion";

/** Mismos valores que el enum AccionPermiso del backend (minúsculas, como en el token). */
export const ACCIONES_PERMISO = [
  "ver",
  "crear",
  "modificar",
  "eliminar",
  "ejecutar",
  "desbloquear",
  "confirmar",
] as const;

export type AccionPermiso = (typeof ACCIONES_PERMISO)[number];

export const ETIQUETAS_ACCION: Record<AccionPermiso, string> = {
  ver: "Ver",
  crear: "Crear",
  modificar: "Modificar",
  eliminar: "Eliminar",
  ejecutar: "Ejecutar",
  desbloquear: "Desbloquear",
  confirmar: "Confirmar",
};

export interface MenuPermiso {
  valor: string;
  etiqueta: string;
  /**
   * Recursos reales del backend (enum Recurso, ver Recurso.java) que agrupa este menú del
   * sidebar. El backend sigue revisando cada uno por separado en su propio @RequirePermission;
   * elegir el menú solo evita tener que dar de alta un permiso por cada recurso fino.
   */
  recursos: readonly string[];
}

/**
 * Los 4 menús generales del sidebar (ver NAV_ITEMS en AppLayout.tsx) que de verdad agrupan
 * pantallas de negocio: "Buzón de denuncias" y "Nuevos usuarios" quedan fuera a propósito, son
 * áreas aparte (denuncias tiene su propio flujo; usuarios/roles/permisos es la administración
 * misma, nunca se le da de alta "en bloque" a un rol operativo).
 */
export const MENUS_PERMISO: readonly MenuPermiso[] = [
  {
    valor: "configuraciones",
    etiqueta: "Configuraciones",
    recursos: ["catalogos", "matriz_riesgo", "usuarios"],
  },
  {
    valor: "configuracion_alertas",
    etiqueta: "Configuración de alertas",
    recursos: ["configuracion_alertas", "personas_bloqueadas"],
  },
  {
    valor: "operacion",
    etiqueta: "Operación",
    recursos: [
      "evaluacion_riesgo",
      "alertas",
      "operaciones_caja",
      "coincidencias",
      "socios",
      "empleados",
    ],
  },
  {
    valor: "control",
    etiqueta: "Control",
    recursos: ["consulta_listas", "tipo_cambio"],
  },
] as const;

// El menú se elige de los 4 generales; las acciones, una o varias del enum (se crea un permiso
// real por cada combinación recurso-del-menú × acción marcada).
export const crearPermisosPorMenuSchema = z.object({
  menu: z.string().trim().min(1, "El menú es obligatorio"),
  acciones: z.array(z.enum(ACCIONES_PERMISO)).min(1, "Elige al menos una acción"),
  descripcion: texto(255),
});

export type CrearPermisosPorMenuFormValues = z.infer<typeof crearPermisosPorMenuSchema>;
