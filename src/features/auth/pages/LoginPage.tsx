import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

import { CaptchaChallenge } from "@/shared/components/CaptchaChallenge";
import { EyeIcon, EyeOffIcon, LockIcon, UserCircleIcon } from "@/shared/components/icons";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { es } from "@/shared/i18n/es";
import { mapBackendError } from "@/shared/utils/errorMapper";

import { loginUser } from "../api/authApi";
import { useAuth } from "../hooks/useAuth";

const loginSchema = z.object({
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  password: z.string().min(4, "La contraseña debe tener al menos 4 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const MAX_FAILED_ATTEMPTS = 3;

export function LoginPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const onSubmit = async (values: LoginFormValues) => {
    if (!captchaValid) {
      setErrorMessage(es.captcha.invalid);
      return;
    }

    if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
      setErrorMessage(es.auth.lockoutWarning);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    abortRef.current = new AbortController();

    try {
      const response = await loginUser(values, abortRef.current.signal);
      setSession(response);
      navigate(`/SICANETSC/PLD/${tenantId}/acerca-de`, {
        replace: true,
      });
    } catch (err: unknown) {
      setFailedAttempts((prev) => prev + 1);
      const mapped = mapBackendError(err);
      setErrorMessage(
        failedAttempts + 1 >= MAX_FAILED_ATTEMPTS
          ? es.auth.lockoutWarning
          : mapped.message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-white shadow-xs"
            style={{
              background: "linear-gradient(160deg, #88EC9B 0%, #5BD191 55%, #4BB58B 100%)",
            }}
          >
            SC
          </span>
          <span className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-200">
            SICANET SC · PLD
          </span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl transition-all dark:border-slate-800 dark:bg-slate-900">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {es.auth.title}
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {es.auth.subtitle}
            </p>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300"
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                {es.auth.username}
              </label>
              <div className="relative mt-1">
                <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  {...register("username")}
                  placeholder={es.auth.usernamePlaceholder}
                  className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#5BD191] focus:outline-none focus:ring-2 focus:ring-[#88EC9B]/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                {es.auth.password}
              </label>
              <div className="relative mt-1">
                <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder={es.auth.passwordPlaceholder}
                  className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#5BD191] focus:outline-none focus:ring-2 focus:ring-[#88EC9B]/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <CaptchaChallenge onVerify={setCaptchaValid} />

            <button
              type="submit"
              disabled={loading || !captchaValid || failedAttempts >= MAX_FAILED_ATTEMPTS}
              className="w-full rounded-lg py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #5BD191 0%, #4BB58B 100%)",
              }}
            >
              {loading ? es.auth.loggingIn : es.auth.loginButton}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
