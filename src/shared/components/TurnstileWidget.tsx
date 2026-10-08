import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export interface TurnstileWidgetRef {
  reset: () => void;
}

interface TurnstileWidgetProps {
  siteKey?: string;
  action?: string;
  theme?: "light" | "dark" | "auto";
  onSuccess: (token: string) => void;
  onError?: (error?: unknown) => void;
  onExpire?: () => void;
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          action?: string;
          theme?: "light" | "dark" | "auto";
          callback?: (token: string) => void;
          "error-callback"?: (error?: unknown) => void;
          "expired-callback"?: () => void;
          "timeout-callback"?: () => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const DEFAULT_SITE_KEY =
  import.meta.env.VITE_TURNSTILE_SITE_KEY || "0x4AAAAAAFQ8vnh6fwrcIhwL";

export const TurnstileWidget = forwardRef<
  TurnstileWidgetRef,
  TurnstileWidgetProps
>(function TurnstileWidget(
  {
    siteKey = DEFAULT_SITE_KEY,
    action = "denuncia_anonima",
    theme = "auto",
    onSuccess,
    onError,
    onExpire,
    className = "",
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(() => {
    return (
      typeof window !== "undefined" && typeof window.turnstile !== "undefined"
    );
  });

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.reset(widgetIdRef.current);
      }
    },
  }));

  // Carga del script oficial de Cloudflare Turnstile
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.turnstile) {
      setScriptLoaded(true);
      return;
    }

    const scriptId = "cf-turnstile-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setScriptLoaded(true);
      };
      script.onerror = (e) => {
        console.error("Error al cargar Cloudflare Turnstile script", e);
        onError?.(e);
      };
      document.head.appendChild(script);
    } else {
      script.addEventListener("load", () => setScriptLoaded(true));
    }
  }, [onError]);

  // Renderizado del widget Turnstile
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !window.turnstile) return;

    // Si ya existe un widget montado, lo removemos antes de volver a renderizar
    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {
        // Ignorar si ya fue removido
      }
      widgetIdRef.current = null;
    }

    try {
      const id = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        action,
        theme,
        callback: (token: string) => {
          onSuccess(token);
        },
        "error-callback": (err) => {
          onError?.(err);
        },
        "expired-callback": () => {
          onExpire?.();
        },
        "timeout-callback": () => {
          onExpire?.();
        },
      });
      widgetIdRef.current = id;
    } catch (e) {
      console.error("Error al renderizar Turnstile widget", e);
      onError?.(e);
    }

    return () => {
      if (window.turnstile && widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Ignorar error al desmontar
        }
        widgetIdRef.current = null;
      }
    };
  }, [scriptLoaded, siteKey, action, theme, onSuccess, onError, onExpire]);

  return (
    <div
      className={`turnstile-container flex justify-center py-2 ${className}`}
    >
      <div ref={containerRef} />
    </div>
  );
});
