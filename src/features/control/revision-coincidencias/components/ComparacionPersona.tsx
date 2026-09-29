import { CheckCircle2, CircleHelp, XCircle } from "lucide-react";

import type { PersonaEnLista, SocioEnRevision } from "../types/coincidencias";
import { coinciden } from "../utils/comparar";

function Indicador({ resultado }: { resultado: boolean | null }) {
  if (resultado === null) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <CircleHelp className="size-4" aria-hidden />
        Sin dato
      </span>
    );
  }
  return resultado ? (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
      <CheckCircle2 className="size-4" aria-hidden />
      Coincide
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-success-hover">
      <XCircle className="size-4" aria-hidden />
      Distinto
    </span>
  );
}

function Dato({ label, valor }: { label: string; valor: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm">{valor || "—"}</dd>
    </div>
  );
}

interface ComparacionPersonaProps {
  socio: SocioEnRevision | undefined;
  persona: PersonaEnLista;
}

/** Datos del socio frente a los de la persona de la lista, marcando qué coincide. */
export function ComparacionPersona({ socio, persona }: ComparacionPersonaProps) {
  const filas = [
    { campo: "Nombre", socio: socio?.nombre, lista: persona.nombre },
    { campo: "RFC", socio: socio?.rfc, lista: persona.rfc },
    { campo: "CURP", socio: socio?.curp, lista: persona.curp },
    {
      campo: "Fecha de nacimiento",
      socio: socio?.fecha_nacimiento,
      lista: persona.fecha_nacimiento,
    },
  ];

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="pb-2 font-medium">Dato</th>
            <th className="pb-2 font-medium">Socio</th>
            <th className="pb-2 font-medium">En la lista</th>
            <th className="pb-2 font-medium" aria-label="Resultado" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {filas.map((fila) => (
            <tr key={fila.campo}>
              <th scope="row" className="py-2 pr-2 text-left font-medium">
                {fila.campo}
              </th>
              <td className="py-2 pr-2 break-words">{fila.socio || "—"}</td>
              <td className="py-2 pr-2 break-words">{fila.lista || "—"}</td>
              <td className="py-2 whitespace-nowrap">
                <Indicador resultado={coinciden(fila.socio, fila.lista)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="grid grid-cols-2 gap-3 border-t pt-4">
        <Dato label="Lista" valor={persona.lista} />
        <Dato label="País" valor={persona.pais} />
        <Dato label="Oficio" valor={persona.oficio} />
        <Dato label="Fecha de publicación" valor={persona.fecha_publicacion} />
        <div className="col-span-2">
          <Dato label="Motivo" valor={persona.motivo} />
        </div>
        {persona.alias_coincidentes?.length ? (
          <div className="col-span-2">
            <Dato
              label="Coincidió por el alias"
              valor={persona.alias_coincidentes.join(", ")}
            />
          </div>
        ) : null}
      </dl>
    </div>
  );
}
