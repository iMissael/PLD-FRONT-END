import { useCallback, useEffect, useRef, useState } from "react";
import { es } from "@/shared/i18n/es";
import { RefreshCwIcon, Volume2Icon } from "./icons";

interface CaptchaChallengeProps {
  onVerify: (isValid: boolean) => void;
}

const CAPTCHA_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // Exclude ambiguous chars 0,1,O,I
const CODE_LENGTH = 5;
const COOLDOWN_SECONDS = 3;

export function CaptchaChallenge({ onVerify }: CaptchaChallengeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [code, setCode] = useState("");
  const [userInput, setUserInput] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [showAccessibleCode, setShowAccessibleCode] = useState(false);

  const generateCode = useCallback(() => {
    let result = "";
    for (let i = 0; i < CODE_LENGTH; i++) {
      const randomIndex = Math.floor(Math.random() * CAPTCHA_CHARS.length);
      result += CAPTCHA_CHARS[randomIndex];
    }
    return result;
  }, []);

  const drawCaptcha = useCallback((text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "#f8fafc");
    bgGrad.addColorStop(1, "#e2e8f0");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Random noise lines
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 150}, ${Math.random() * 150}, ${Math.random() * 150}, 0.3)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.stroke();
    }

    // Random noise dots
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 200}, ${Math.random() * 200}, ${Math.random() * 200}, 0.4)`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Distorted text
    ctx.font = "bold 24px monospace";
    ctx.textBaseline = "middle";

    const charSpacing = width / (CODE_LENGTH + 1);

    for (let i = 0; i < text.length; i++) {
      const char = text[i] ?? "";
      const x = (i + 1) * charSpacing;
      const y = height / 2 + (Math.random() * 6 - 3);

      ctx.save();
      ctx.translate(x, y);

      const angle = (Math.random() * 30 - 15) * (Math.PI / 180);
      ctx.rotate(angle);

      ctx.fillStyle = `hsl(${Math.random() * 360}, 60%, 35%)`;
      ctx.fillText(char, -8, 0);

      ctx.restore();
    }
  }, []);

  const refreshCaptcha = useCallback(() => {
    if (cooldown > 0) return;
    const newCode = generateCode();
    setCode(newCode);
    setUserInput("");
    onVerify(false);
    drawCaptcha(newCode);

    setCooldown(COOLDOWN_SECONDS);
  }, [cooldown, generateCode, drawCaptcha, onVerify]);

  useEffect(() => {
    const newCode = generateCode();
    setCode(newCode);
    drawCaptcha(newCode);
  }, [generateCode, drawCaptcha]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserInput(val);
    const isValid = val === code;
    onVerify(isValid);
  };

  const playAudio = () => {
    if ("speechSynthesis" in window && code) {
      const textToSpeak = code.split("").join(" ");
      const utterance = new SpeechSynthesisUtterance(`Código captcha: ${textToSpeak}`);
      utterance.lang = "es-ES";
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    } else {
      setShowAccessibleCode(true);
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-semibold tracking-wider text-muted-foreground">
          {es.captcha.label}
        </label>
        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
           {es.captcha.deterrentNotice}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative overflow-hidden rounded-md border border-border shadow-xs bg-card">
          <canvas ref={canvasRef} width={180} height={44} className="block cursor-default select-none" />
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={refreshCaptcha}
            disabled={cooldown > 0}
            title={es.captcha.refreshTooltip}
            className="rounded-md border border-border bg-card p-2 text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
          >
            <RefreshCwIcon className={`h-4 w-4 ${cooldown > 0 ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={playAudio}
            title={es.captcha.audioTooltip}
            className="rounded-md border border-border bg-card p-2 text-foreground hover:bg-muted transition-colors"
          >
            <Volume2Icon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          maxLength={CODE_LENGTH}
          value={userInput}
          onChange={handleInputChange}
          placeholder={es.captcha.placeholder}
          aria-label={es.captcha.label}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono tracking-wider text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {showAccessibleCode && (
        <p className="text-xs text-muted-foreground">
          Código accesible: <span className="font-mono font-bold tracking-widest text-foreground">{code}</span>
        </p>
      )}
    </div>
  );
}
