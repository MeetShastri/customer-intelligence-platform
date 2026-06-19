import { motion } from "framer-motion";
import { Check, Cpu, FileText, Database, ShieldAlert, ArrowDown } from "lucide-react";

interface AgentGraphProps {
  currentStep: string | null;
}

interface NodeProps {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  status: "pending" | "active" | "complete";
}

function AgentNode({ label, sublabel, icon, status }: NodeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case "active":
        return {
          card: "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10",
          iconContainer: "bg-purple-500/20 border-purple-400 text-purple-300 animate-pulse",
          glow: "absolute inset-0 -z-10 rounded-2xl bg-purple-500/20 blur-md",
        };
      case "complete":
        return {
          card: "border-emerald-500/60 bg-emerald-500/5",
          iconContainer: "bg-emerald-500/20 border-emerald-400 text-emerald-300",
          glow: "",
        };
      default:
        return {
          card: "border-white/5 bg-white/5 opacity-50",
          iconContainer: "bg-white/5 border-white/10 text-gray-500",
          glow: "",
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className="relative w-full max-w-sm">
      {styles.glow && <div className={styles.glow} />}
      
      <div
        className={`flex items-center gap-4 p-4 rounded-xl border backdrop-blur-md transition-all duration-500 ${styles.card}`}
      >
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-sm transition-colors duration-500 ${styles.iconContainer}`}>
          {status === "complete" ? <Check className="h-5 w-5" /> : icon}
        </div>
        <div className="text-left">
          <div className={`text-sm font-bold transition-colors duration-500 ${status === "active" ? "text-purple-300" : status === "complete" ? "text-emerald-400" : "text-gray-400"}`}>
            {label}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{sublabel}</div>
        </div>

        {status === "active" && (
          <div className="ml-auto flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AgentGraph({ currentStep }: AgentGraphProps) {
  // Helper to determine node status
  const getStatus = (nodeKey: string): "pending" | "active" | "complete" => {
    if (!currentStep) return "pending";

    const stepOrder = ["queued", "starting", "classification", "retrieval", "drafting", "completed"];
    const currentIdx = stepOrder.indexOf(currentStep);

    if (nodeKey === "classify") {
      if (currentStep === "classification") return "active";
      if (currentIdx > stepOrder.indexOf("classification")) return "complete";
    }

    if (nodeKey === "retrieval") {
      if (currentStep === "retrieval") return "active";
      if (currentIdx > stepOrder.indexOf("retrieval")) return "complete";
    }

    if (nodeKey === "draft") {
      if (currentStep === "drafting") return "active";
      if (currentIdx > stepOrder.indexOf("drafting")) return "complete";
    }

    if (nodeKey === "supervisor") {
      if (currentStep === "completed") return "complete";
      // It's active during final phase
      if (currentIdx === stepOrder.indexOf("drafting") + 1) return "active"; 
    }

    return "pending";
  };

  const classifyStatus = getStatus("classify");
  const retrievalStatus = getStatus("retrieval");
  const draftStatus = getStatus("draft");
  const supervisorStatus = getStatus("supervisor");

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-2xl flex flex-col items-center h-full z-10 relative overflow-hidden">
      <style>{`
        @keyframes flow {
          to {
            stroke-dashoffset: -20;
          }
        }
        .animate-flow-active {
          stroke-dasharray: 6, 4;
          animation: flow 1.5s linear infinite;
        }
      `}</style>
      <div className="absolute top-0 right-0 h-[2px] w-24 bg-gradient-to-r from-purple-500/10 via-purple-500/60 to-purple-500/10"></div>

      <h2 className="text-lg font-bold text-gray-100 self-start flex items-center gap-2 mb-8">
        <Cpu className="h-4 w-4 text-purple-400" />
        Real-Time Agent Execution Graph
      </h2>

      <div className="flex flex-col items-center w-full gap-8 relative py-4">
        {/* Node 1 */}
        <AgentNode
          id="classify"
          label="Classify Agent"
          sublabel="Urgency & category classification"
          icon={<ShieldAlert className="h-5 w-5" />}
          status={classifyStatus}
        />

        {/* Connection Line 1 */}
        <div className="h-8 flex items-center justify-center relative">
          <svg className="absolute w-2 h-12 overflow-visible" pointerEvents="none">
            <line
              x1="4"
              y1="0"
              x2="4"
              y2="48"
              className={`stroke-white/10 stroke-[2]`}
            />
            {(classifyStatus === "complete" || retrievalStatus === "active") && (
              <line
                x1="4"
                y1="0"
                x2="4"
                y2="48"
                className={`stroke-[2] ${
                  retrievalStatus === "active"
                    ? "stroke-purple-500 animate-flow-active"
                    : "stroke-emerald-500"
                }`}
              />
            )}
          </svg>
          <ArrowDown className={`h-4 w-4 relative z-10 transition-colors ${
            retrievalStatus === "active" ? "text-purple-400" : classifyStatus === "complete" ? "text-emerald-500" : "text-gray-600"
          }`} />
        </div>

        {/* Node 2 */}
        <AgentNode
          id="retrieval"
          label="Retrieval Agent"
          sublabel="Contextual similarity search in Pinecone"
          icon={<Database className="h-5 w-5" />}
          status={retrievalStatus}
        />

        {/* Connection Line 2 */}
        <div className="h-8 flex items-center justify-center relative">
          <svg className="absolute w-2 h-12 overflow-visible" pointerEvents="none">
            <line
              x1="4"
              y1="0"
              x2="4"
              y2="48"
              className={`stroke-white/10 stroke-[2]`}
            />
            {(retrievalStatus === "complete" || draftStatus === "active") && (
              <line
                x1="4"
                y1="0"
                x2="4"
                y2="48"
                className={`stroke-[2] ${
                  draftStatus === "active"
                    ? "stroke-purple-500 animate-flow-active"
                    : "stroke-emerald-500"
                }`}
              />
            )}
          </svg>
          <ArrowDown className={`h-4 w-4 relative z-10 transition-colors ${
            draftStatus === "active" ? "text-purple-400" : retrievalStatus === "complete" ? "text-emerald-500" : "text-gray-600"
          }`} />
        </div>

        {/* Node 3 */}
        <AgentNode
          id="draft"
          label="Draft Agent"
          sublabel="Draft response generation via Groq"
          icon={<FileText className="h-5 w-5" />}
          status={draftStatus}
        />

        {/* Connection Line 3 */}
        <div className="h-8 flex items-center justify-center relative">
          <svg className="absolute w-2 h-12 overflow-visible" pointerEvents="none">
            <line
              x1="4"
              y1="0"
              x2="4"
              y2="48"
              className={`stroke-white/10 stroke-[2]`}
            />
            {(draftStatus === "complete" || supervisorStatus === "active" || supervisorStatus === "complete") && (
              <line
                x1="4"
                y1="0"
                x2="4"
                y2="48"
                className={`stroke-[2] ${
                  supervisorStatus === "active"
                    ? "stroke-purple-500 animate-flow-active"
                    : "stroke-emerald-500"
                }`}
              />
            )}
          </svg>
          <ArrowDown className={`h-4 w-4 relative z-10 transition-colors ${
            supervisorStatus === "active" ? "text-purple-400" : draftStatus === "complete" ? "text-emerald-500" : "text-gray-600"
          }`} />
        </div>

        {/* Node 4 */}
        <AgentNode
          id="supervisor"
          label="Supervisor Agent"
          sublabel="Final decision routing review"
          icon={<Cpu className="h-5 w-5" />}
          status={supervisorStatus}
        />
      </div>
    </div>
  );
}
