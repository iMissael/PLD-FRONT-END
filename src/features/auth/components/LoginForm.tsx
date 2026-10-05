import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, Lock, User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { useTenantNombre } from "@/shared/tenant/useTenantNombre";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { isAppError } from "@/api/interceptors/errorInterceptor";
import { useLogin } from "@/features/auth/hooks/useLogin";
import type { LoginResponse } from "@/features/auth/types/auth";
import { loginSchema, type LoginFormValues } from "@/features/auth/types/loginSchema";
import { useAuthStore } from "@/shared/auth/authStore";
import { rutaTenant } from "@/shared/tenant/tenantPaths";

const MENSAJE_ERROR_GENERICO = "Usuario o contraseña incorrectos";

export function LoginForm() {
  const navigate = useNavigate();
  const { tenantId = "" } = useParams<{ tenantId: string }>();
  const { data: tenantNombre } = useTenantNombre(tenantId);

  const nombre = tenantNombre ?? "SICANET WEB";
  const login = useLogin();
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "", recordarme: false },
  });

  function onSubmit(values: LoginFormValues) {
    login.mutate(
      { username: values.username, password: values.password },
      {
        onSuccess: (data: LoginResponse) => {
          useAuthStore.getState().setSession(tenantId, data, values.recordarme);
          navigate(rutaTenant(tenantId), { replace: true });
        },
        onError: (error: unknown) => {
          // Credenciales malas llegan como 401/403: se muestra el mensaje fijo.
          const usarMensajeFijo =
            !isAppError(error) || error.status === 401 || error.status === 403;
          toast.error(usarMensajeFijo ? MENSAJE_ERROR_GENERICO : error.message);
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs font-semibold">MÓDULO SICANET PLD</span>
        </div>
        <div>
          <p className="text-primary text-xs font-semibold tracking-wide uppercase">
            Inicie sesión en
          </p>
          <h2 className="text-foreground text-3xl leading-tight font-extrabold uppercase">
            {nombre}
          </h2>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary">Usuario</FormLabel>
                <div className="relative">
                  <User className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 my-auto size-4 ml-3" />
                  <FormControl>
                    <Input
                      className="h-11 pl-9"
                      autoComplete="USUARIO"
                      autoFocus
                      placeholder="Ingrese su usuario"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary">Contraseña</FormLabel>
                <div className="relative">
                  <Lock className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 my-auto size-4 ml-3" />
                  <FormControl>
                    <Input
                      className="h-11 px-9"
                      type={mostrarPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Ingrese su contraseña"
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setMostrarPassword((v) => !v)}
                    className="text-muted-foreground hover:bg-accent absolute inset-y-0 right-0 flex items-center rounded-md px-3"
                    aria-label={
                      mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {mostrarPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center justify-between">

            <button
              type="button"
              onClick={() =>
                toast.info("Contacta a un administrador para restablecer tu contraseña.")
              }
              className="text-primary text-xs font-semibold hover:underline"
            >
              ¿Olvidé mi contraseña?
            </button>
          </div>
          <Button
            type="submit"
            size="lg"
            className="mt-2 w-full gap-2"
            disabled={login.isPending}
          >
            {login.isPending ? (
              "Iniciando sesión…"
            ) : (
              <>
                Acceder
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
