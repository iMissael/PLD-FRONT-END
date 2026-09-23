/**
 * Se muestra cuando se entra a la app sin un tenant en la URL (p. ej. `/`
 * a secas). Mientras no exista login/selector de tenant, el único punto de
 * entrada válido es un link con el tenant incluido:
 * `/SICANETSC/PLD/{tenantId}/configuracion-alertas`.
 */
export function TenantRequeridoPage() {
  return (
    <div className="mx-auto mt-16 max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center">
      <h1 className="text-lg font-semibold text-slate-900">Falta el tenant en la URL</h1>
      <p className="mt-2 text-sm text-slate-500">
        Esta aplicación es multi-tenant: accede con el link completo que incluye tu
        tenant, con el formato{" "}
        <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
          /SICANETSC/PLD/&#123;tenantId&#125;/configuracion-alertas
        </code>
        .
      </p>
    </div>
  );
}
