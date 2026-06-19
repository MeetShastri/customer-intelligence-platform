import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Clock, Terminal } from "lucide-react";

interface TimelineProps {
  logs: string[];
  currentStep: string | null;
}

export default function Timeline({ logs, currentStep }: TimelineProps) {
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const stepsList = [
    { key: "starting", label: "Workflow Initiated" },
    { key: "classification", label: "Urgency Classified" },
    { key: "retrieval", label: "Historical Retrieval Done" },
    { key: "drafting", label: "Draft Reply Generated" },
    { key: "completed", label: "Supervisor Review Done" },
  ];

  const getStepStatus = (stepKey: string): "pending" | "active" | "complete" => {
    if (!currentStep) return "pending";
    if (currentStep === "failed") return "pending";

    const stepOrder = ["queued", "starting", "classification", "retrieval", "drafting", "completed"];
    const currentIdx = stepOrder.indexOf(currentStep);
    const nodeIdx = stepOrder.indexOf(stepKey);

    if (currentStep === stepKey) return "active";
    if (currentIdx > nodeIdx) return "complete";
    return "pending";
  };

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-2xl flex flex-col h-full z-10 relative overflow-hidden">
      <div className="absolute top-0 right-0 h-[2px] w-24 bg-gradient-to-r from-purple-500/10 via-purple-500/60 to-purple-500/10"></div>

      {/* Structured Checklist Timeline */}
      <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2 mb-6">
        <Clock className="h-4 w-4 text-purple-400" />
        Workflow Timeline
      </h2>

      <div className="relative pl-6 border-l border-white/5 space-y-5 mb-8">
        {stepsList.map((step) => {
          const status = getStepStatus(step.key);
          return (
            <div key={step.key} className="relative flex items-center gap-3">
              <div className="absolute -left-[31px] flex items-center justify-center bg-[#030712] rounded-full p-0.5 z-10">
                {status === "complete" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shadow-sm" />
                ) : status === "active" ? (
                  <span className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500 border border-purple-400"></span>
                  </span>
                ) : (
                  <Circle className="h-4 w-4 text-gray-700" />
                )}
              </div>

              <span className={`text-sm font-semibold transition-colors duration-300 ${
                status === "complete"
                  ? "text-emerald-400"
                  : status === "active"
                  ? "text-purple-300"
                  : "text-gray-600"
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Terminal logs area */}
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5 mt-auto">
        <Terminal className="h-3 w-3" />
        Agent Execution Logs
      </h3>

      <div className="flex-grow bg-black/50 border border-white/5 rounded-xl p-4 font-mono text-xs overflow-y-auto h-48 select-text">
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {logs.map((log, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="text-left text-gray-400 leading-normal"
              >
                <span className="text-purple-500 font-bold select-none mr-2">&gt;</span>
                {log}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={consoleEndRef} />
        </div>
      </div>
    </div>
  );
}
