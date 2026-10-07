import { useEffect, useState } from "react";

import { Button } from "@/shared/components/ui/CatalogoButton";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { card, field, hint, label } from "@/shared/components/ui/styles";

import { useScopesIntegracion } from "../hooks/useIntegraciones";
import {
  CLIENT_ID_REGEX,
  DESCRIPCION_SCOPE,
  type RegistrarSistemaInput,
  type SistemaIntegracionResponse,
} from "../types/integraciones";

interface SistemaFormProps {
  /** null = alta de un sistema nuevo. */
  sistema: SistemaIntegracionResponse | null;
  onGuardar: (input: RegistrarSistemaInput) => void;
  onCancelar: () => void;
  isPending?: boolean;
}

interface FormState {
  clientId: string;
  nombre: string;
  scopes: string[];
}

const aFormState = (sistema: SistemaIntegracionResponse | null): FormState =>
  sistema
    ? { clientId: sistema.clientId, nombre: sistema.nombre, scopes: sistema.scopes }
    : { clientId: "", nombre: "", scopes: [] };

/** Alta o edición de un sistema. El client_id no cambia una vez registrado. */
export function SistemaForm({ sistema, onGuardar, onCancelar, isPending }: SistemaFormProps) {
  const { data: scopesDisponibles } = useScopesIntegracion();
  const [form, setForm] = useState<FormState>(() => aFormState(sistema));

  useEffect(() => {
    setForm(aFormState(sistema));
  }, [sistema]);

  const clientIdValido = CLIENT_ID_REGEX.test(form.clientId);
  const puedeGuardar = clientIdValido && form.nombre.trim() !== "" && form.scopes.length > 0;

  const alternarScope = (scope: string, marcado: boolean) =>
    setForm((prev) => ({
      ...prev,
      scopes: marcado ? [...prev.scopes, scope] : prev.scopes.filter((s) => s !== scope),
    }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!puedeGuardar) return;
    onGuardar({ clientId: form.clientId, nombre: form.nombre.trim(), scopes: form.scopes });
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-4 p-4 ${card}`}>
      <h3 className="text-sm font-semibold text-foreground">
        {sistema ? `Editar sistema: ${sistema.clientId}` : "Nuevo sistema de integración"}
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="clientIdSistema" className={label}>
            client_id
          </label>
          <input
            id="clientIdSistema"
            type="text"
            required
            disabled={sistema !== null}
            maxLength={50}
            placeholder="sistema-socios"
            value={form.clientId}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, clientId: event.target.value.toLowerCase().replace(/\s/g, "") }))
            }
            className={field}
            aria-invalid={form.clientId !== "" && !clientIdValido}
          />
          <span className={hint}>
            {sistema
              ? "No se puede cambiar: es con el que el sistema pide su token."
              : "De 3 a 50 caracteres; empieza con letra y usa solo minúsculas, números y guiones."}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="nombreSistema" className={label}>
            Nombre
          </label>
          <input
            id="nombreSistema"
            type="text"
            required
            maxLength={120}
            placeholder="Sistema de Socios"
            value={form.nombre}
            onChange={(event) => setForm((prev) => ({ ...prev, nombre: event.target.value }))}
            className={field}
          />
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className={label}>Scopes</legend>
        <span className={hint}>
          Lo que el sistema puede hacer en la API. Un cambio aplica a los tokens nuevos; los ya emitidos
          conservan sus scopes hasta que expiran (15 minutos).
        </span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(scopesDisponibles ?? []).map((scope) => (
            <label key={scope} className="flex items-start gap-2 text-sm">
              <Checkbox
                checked={form.scopes.includes(scope)}
                onCheckedChange={(marcado) => alternarScope(scope, marcado === true)}
                className="mt-0.5"
              />
              <span>
                <code className="text-xs">{scope}</code>
                {DESCRIPCION_SCOPE[scope] ? (
                  <span className="text-muted-foreground"> · {DESCRIPCION_SCOPE[scope]}</span>
                ) : null}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex justify-end gap-2">
        <Button type="button" variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending || !puedeGuardar}>
          {isPending ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
