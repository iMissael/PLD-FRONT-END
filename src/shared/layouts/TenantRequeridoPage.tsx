/**
 * Se muestra cuando se entra a la app sin un tenant en la URL (p. ej. `/`
 * a secas). Mientras no exista login/selector de tenant, el único punto de
 * entrada válido es un link con el tenant incluido:
 * `/SICANETSC/PLD/{tenantId}/configuracion-alertas`.
 */
export function TenantRequeridoPage() {
  return (
    <div className="mx-auto mt-16 max-w-md rounded-xl border border-border bg-card p-6 text-center shadow-sm">
      <h1 className="text-lg font-semibold text-foreground">Falta el tenant en la URL</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Esta aplicación es multi-tenant: accede con el link completo que incluye tu
        tenant, con el formato{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground font-mono">
          /SICANETSC/PLD/&#123;tenantId&#125;/configuracion-alertas
        </code>
        .
      </p>
    </div>
  );
}
