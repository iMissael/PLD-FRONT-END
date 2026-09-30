import { ShieldCheck } from "lucide-react";
import { LoginForm } from "@/features/auth/components/LoginForm";

export function LoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl shadow-lg md:grid-cols-2">
        <div className="bg-card flex flex-col justify-center gap-6 p-10">
          <div className="text-center">
            <h1 className="text-primary text-2xl font-bold">Inicie sesión en</h1>
            <p className="text-primary text-sm font-medium">SICANET PLD</p>
          </div>
          <LoginForm />
        </div>
        <div className="from-brand-mint to-brand-teal hidden flex-col items-center justify-center gap-4 bg-gradient-to-br p-10 md:flex">
          <span className="flex size-20 items-center justify-center rounded-2xl bg-white/90 shadow-md">
            <ShieldCheck className="text-brand-teal size-11" strokeWidth={1.75} />
          </span>
          <span className="text-3xl font-bold text-white drop-shadow">SICANET PLD</span>
        </div>
      </div>
    </div>
  );
}
