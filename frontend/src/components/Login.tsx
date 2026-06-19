import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Eye, EyeOff, Loader2, CheckCircle2, Cpu } from "lucide-react";
import ParticleBackground from "./ParticleBackground";

interface LoginProps {
  onLoginSuccess: () => void;
}

interface StepItem {
  id: number;
  label: string;
  status: "pending" | "loading" | "complete";
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("admin@platform.ai");
  const [password, setPassword] = useState("sessionKey42");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [steps, setSteps] = useState<StepItem[]>([
    { id: 1, label: "Scanning system environment & configuration...", status: "pending" },
    { id: 2, label: "Validating access credentials...", status: "pending" },
    { id: 3, label: "Signing session authorization tokens...", status: "pending" },
    { id: 4, label: "Establishing secure NestJS gateway handshake...", status: "pending" },
  ]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    setCurrentStep(0);
  };

  useEffect(() => {
    if (!isAuthenticating) return;

    if (currentStep < steps.length) {
      // Set current step to loading
      setSteps((prev) =>
        prev.map((s, idx) => {
          if (idx === currentStep) return { ...s, status: "loading" };
          return s;
        })
      );

      const timer = setTimeout(() => {
        // Complete current step
        setSteps((prev) =>
          prev.map((s, idx) => {
            if (idx === currentStep) return { ...s, status: "complete" };
            return s;
          })
        );
        setCurrentStep((prev) => prev + 1);
      }, 900); // 900ms per agent task check

      return () => clearTimeout(timer);
    } else {
      // Completed all steps
      const endTimer = setTimeout(() => {
        onLoginSuccess();
      }, 500);
      return () => clearTimeout(endTimer);
    }
  }, [isAuthenticating, currentStep, steps.length, onLoginSuccess]);

  return (
    <div className="relative min-h-screen bg-[#030712] flex items-center justify-center p-4 overflow-hidden select-none">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(124,58,237,0.06),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.04),transparent_50%)] pointer-events-none z-0"></div>
      <ParticleBackground />

      <AnimatePresence mode="wait">
        {!isAuthenticating ? (
          <motion.div
            key="login-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md glass-panel rounded-2xl p-8 shadow-2xl relative z-10 overflow-hidden"
          >
            {/* Glowing top line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500/10 via-purple-500/60 to-purple-500/10"></div>

            <div className="flex flex-col items-center mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/10 border border-purple-500/30 text-purple-400 mb-3 shadow-lg shadow-purple-500/5">
                <Cpu className="h-6 w-6 animate-pulse" />
              </div>
              <h1 className="text-xl font-bold text-gray-100">AI Operations Ingestion</h1>
              <p className="text-xs text-gray-400 mt-1">Initialize secure agent session</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Session Identity / Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/5 bg-black/30 text-gray-200 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                  placeholder="name@domain.com"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Session Token / Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-white/5 bg-black/30 text-gray-200 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 cursor-pointer text-white font-bold text-sm shadow-lg shadow-purple-500/10 transition-all hover:-translate-y-[1px]"
              >
                <Shield className="h-4 w-4" />
                Initialize Session
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="authenticating"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md glass-panel rounded-2xl p-8 shadow-2xl relative z-10 text-left"
          >
            {/* Glowing top line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500/10 via-purple-500/60 to-purple-500/10"></div>

            <h2 className="text-md font-bold text-gray-100 mb-6 flex items-center gap-2">
              <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
              Security Agent Authentication Sequence
            </h2>

            <div className="space-y-4">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-300 ${
                    step.status === "complete"
                      ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-400"
                      : step.status === "loading"
                      ? "bg-purple-500/5 border-purple-500/30 text-purple-300"
                      : "bg-white/5 border-transparent text-gray-600"
                  }`}
                >
                  <div className="flex h-5 w-5 items-center justify-center shrink-0 mt-0.5">
                    {step.status === "complete" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : step.status === "loading" ? (
                      <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-gray-700"></div>
                    )}
                  </div>
                  <div className="text-xs font-semibold leading-normal">{step.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
