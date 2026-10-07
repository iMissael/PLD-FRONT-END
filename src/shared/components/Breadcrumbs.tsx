import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useRutaTenant } from "@/shared/tenant/useRutaTenant";

/**
 * Diccionario de traducción de segmentos de ruta a nombres amigables.
 */
const TITULOS_RUTAS: Record<string, string> = {
  buzon: "Buzón de denuncias",
  gestion: "Gestión de denuncias",
  alertas: "Alertas PLD",
  "mensaje-cabecera": "Mensaje de cabecera",
  denuncias: "Buzón público",
  configuraciones: "Configuraciones",
  "oficial-cumplimiento": "Oficial de cumplimiento",
  "matriz-riesgo": "Matriz de riesgo",
  "ubicacion-geografica": "Ubicación geográfica",
  "listas-paises": "Listas de países",
  "zonas-geograficas": "Zonas de riesgo",
  "zonas-paises": "Zonas de países",
  "zonas-entidades": "Zonas de entidades",
  "zonas-riesgo": "Zonas de riesgo",
  entidades: "Entidades",
  localidades: "Localidades",
  paises: "Países",
  personas: "Configuración de personas",
  edades: "Configuración de edades",
  "rangos-edad": "Edades",
  "tiempo-constitucion": "Tiempo de constitución",
  "experiencia-actividad": "Experiencia de actividad",
  "actividad-economica": "Actividad económica",
  "tipos-credito": "Tipos de crédito",
  "historial-crediticio": "Historial crediticio",
  "monto-credito": "Monto de crédito",
  recursos: "Configuración de recursos",
  origen: "Origen",
  destino: "Destino",
  "canales-pago": "Canales de pago",
  "configuracion-alertas": "Configuración de alertas",
  reglas: "Reglas de alerta",
  "carga-masiva": "Carga masiva",
  operacion: "Operación",
  "evaluacion-riesgo": "Evaluación de riesgo",
  "captura-alertas": "Captura de alertas",
  "revision-alertas": "Revisión de alertas",
  control: "Control",
  quienesquien: "Quién es quién",
  coincidencias: "Revisión de coincidencias",
  "control-dolar": "Control dólar",
  administracion: "Administración",
  usuarios: "Usuarios",
  roles: "Roles",
  permisos: "Permisos",
  "acerca-de": "Acerca de",
  ayuda: "Ayuda",
};

/**
 * Destino de navegación por defecto para segmentos intermedios que no son páginas finales.
 */
const RUTAS_INTERMEDIAS: Record<string, string> = {
  buzon: "buzon/gestion",
  configuraciones: "configuraciones/oficial-cumplimiento",
  "configuraciones/ubicacion-geografica": "configuraciones/ubicacion-geografica/listas-paises",
  "configuraciones/edades": "configuraciones/edades/rangos-edad",
  "configuraciones/recursos": "configuraciones/recursos/origen",
  "configuraciones/administracion": "configuraciones/administracion/usuarios",
  "configuracion-alertas": "configuracion-alertas/reglas",
  operacion: "operacion",
  control: "control",
};

export function Breadcrumbs() {
  const location = useLocation();
  const rutaTenant = useRutaTenant();

  const crumbs = useMemo(() => {
    const pathname = location.pathname;
    // Formato de ruta: /SICANETSC/PLD/:tenantId/...
    const partes = pathname.split("/").filter(Boolean);
    
    // Localizar el índice donde terminan el prefijo '/SICANETSC/PLD/:tenantId'
    let inicioRuta = 0;
    const pldIdx = partes.findIndex((p) => p.toUpperCase() === "PLD");
    if (pldIdx !== -1 && partes.length > pldIdx + 1) {
      inicioRuta = pldIdx + 2;
    }

    const segmentos = partes.slice(inicioRuta);
    if (segmentos.length === 0) {
      return [];
    }

    let acumulado = "";
    return segmentos.map((segmento, idx) => {
      acumulado += (acumulado ? "/" : "") + segmento;
      const esUltimo = idx === segmentos.length - 1;
      const etiqueta = TITULOS_RUTAS[segmento] || decodeURIComponent(segmento);
      const destino = RUTAS_INTERMEDIAS[acumulado] || acumulado;

      return {
        etiqueta,
        to: rutaTenant(destino),
        esUltimo,
      };
    });
  }, [location.pathname, rutaTenant]);

  if (crumbs.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Migas de pan" className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
      <Link
        to={rutaTenant("")}
        className="flex items-center gap-1 hover:text-foreground transition-colors font-medium"
        title="Inicio"
      >
        <Home className="size-3.5" />
        <span className="sr-only sm:not-sr-only">Inicio</span>
      </Link>

      {crumbs.map((crumb, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <ChevronRight className="size-3.5 text-muted-foreground/50 shrink-0" />
          {crumb.esUltimo ? (
            <span className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-none" aria-current="page">
              {crumb.etiqueta}
            </span>
          ) : (
            <Link
              to={crumb.to}
              className="hover:text-foreground transition-colors truncate max-w-[150px] sm:max-w-none font-medium"
            >
              {crumb.etiqueta}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
