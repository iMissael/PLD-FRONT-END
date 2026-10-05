import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { LoginForm } from "@/features/auth/components/LoginForm";

const anioActual = new Date().getFullYear();

export function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <main className="bg-nav-soft flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="bg-card grid w-full max-w-5xl overflow-hidden rounded-2xl shadow-xl md:grid-cols-2">
          <div className="p-10 sm:p-14">
            <LoginForm />
          </div>

          <div className="from-brand-mint to-brand-teal relative hidden flex-col items-center justify-center gap-4 bg-gradient-to-br p-14 text-center md:flex">        

            <span className="flex size-20 items-center justify-center rounded-2xl bg-white/90 shadow-md">
              <ShieldCheck className="text-brand-teal size-10" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-2xl font-extrabold text-white">SICANET PLD</p>
              <p className="mt-2 max-w-xs text-sm text-white/90">
                Prevención de Lavado de Dinero y Financiamiento al Terrorismo
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-card border-border text-muted-foreground flex flex-wrap items-center justify-between gap-2 border-t px-6 py-4 text-xs">
        <p>
          © {anioActual} SICANET PLD. Todos los derechos reservados. Confidencialidad y
          Cumplimiento Regulatorio.
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => toast.info("Disponible próximamente.")}
            className="hover:text-foreground hover:underline"
          >
            Aviso de Privacidad
          </button>
          <button
            type="button"
            onClick={() => toast.info("Disponible próximamente.")}
            className="hover:text-foreground hover:underline"
          >
            Términos de Servicio
          </button>
          <button
            type="button"
            onClick={() => toast.info("Escribe a soporte@sicanet.com para recibir ayuda.")}
            className="hover:text-foreground hover:underline"
          >
            Mesa de Ayuda
          </button>
        </div>
      </footer>
    </div>
  );
}
