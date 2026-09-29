import { Scale } from "lucide-react";
import { useMemo } from "react";
import { useWatch } from "react-hook-form";
import { useActividadesEconomicas } from "@/features/catalogos/hooks/useCatalogos";
import {
  CampoCatalogo,
  CampoSelect,
  CampoTexto,
  SeccionFicha,
  type FichaForm,
  type OpcionCatalogo,
} from "@/features/configuraciones/oficial-cumplimiento/components/campos";
import { clave, soloLetras } from "@/shared/utils/entradas";
import { nombreMoneda } from "@/features/configuraciones/oficial-cumplimiento/utils/oficialCumplimiento";

const TIPOS_PERSONA = [
  { valor: "FISICA", etiqueta: "Persona física" },
  { valor: "MORAL", etiqueta: "Persona moral" },
];

export function SeccionParametrosPld({ form }: { form: FichaForm }) {
  const { data: actividades, isPending: cargandoActividades } =
    useActividadesEconomicas();
  const actividadActual = useWatch({
    control: form.control,
    name: "actividadEconomicaId",
  });
  const moneda = useWatch({ control: form.control, name: "monedaDeOperacionPrincipal" });

  // La actividad ya asignada se conserva en la lista aunque el catálogo la marque inactiva.
  const opcionesActividad = useMemo<OpcionCatalogo[]>(
    () =>
      (actividades ?? [])
        .filter(
          (item) => item.id && (item.estatus === "A" || item.id === actividadActual),
        )
        .map((item) => ({
          valor: item.id ?? "",
          etiqueta: item.descripcion ?? "",
          codigo: item.id,
        })),
    [actividades, actividadActual],
  );
  const esVulnerable = actividades?.find(
    (item) => item.id === actividadActual,
  )?.es_actividad_vulnerable;

  return (
    <SeccionFicha
      icono={Scale}
      titulo="Información complementaria y parámetros PLD"
      descripcion="Claves regulatorias de supervisión y actividad económica del oficial."
    >
      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
        <CampoTexto
          form={form}
          name="claveDelOficialDeCumplimiento"
          label="Clave del oficial de cumplimiento"
          formato={clave}
          maxLength={12}
          className="[&_input]:font-mono [&_input]:font-bold"
        />
        <CampoTexto
          form={form}
          name="claveDelSujetoObligado"
          label="Clave del sujeto obligado"
          formato={clave}
          maxLength={50}
          requerido
          className="[&_input]:font-mono [&_input]:font-bold"
        />
        <CampoTexto
          form={form}
          name="claveOrganoSuperior"
          label="Clave del órgano supervisor (CNBV / CONDUSEF)"
          formato={clave}
          maxLength={50}
          requerido
          className="[&_input]:font-mono [&_input]:font-bold"
        />
        <CampoTexto
          form={form}
          name="monedaDeOperacionPrincipal"
          label="Moneda de operación principal"
          formato={soloLetras}
          maxLength={3}
          placeholder="MXN"
          sufijo={nombreMoneda(moneda)}
          className="[&_input]:font-bold"
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-12">
        <CampoSelect
          form={form}
          name="tipoPersona"
          label="Tipo de persona"
          placeholder="Selecciona un tipo"
          opciones={TIPOS_PERSONA}
          requerido
          className="md:col-span-4"
        />
        <CampoCatalogo
          form={form}
          name="actividadEconomicaId"
          label="Actividad económica"
          placeholder="Busca una actividad"
          opciones={opcionesActividad}
          cargando={cargandoActividades}
          ayuda={esVulnerable ? "Actividad considerada vulnerable." : undefined}
          className="md:col-span-8"
        />
      </div>
    </SeccionFicha>
  );
}
