import { useMemo } from "react";
import { motion } from "framer-motion";
import { ReactFlow, Background, Handle, Position } from "@xyflow/react";
import { Check, ShieldAlert, Database, FileText, Cpu, ArrowDown } from "lucide-react";
import "@xyflow/react/dist/style.css";

interface AgentGraphProps {
  currentStep: string | null;
  timings?: {
    classify?: number;
    retrieval?: number;
    draft?: number;
    supervisor?: number;
    total?: number;
  } | null;
}

const iconMap = {
  classify: <ShieldAlert className="h-5 w-5" />,
  retrieval: <Database className="h-5 w-5" />,
  draft: <FileText className="h-5 w-5" />,
  supervisor: <Cpu className="h-5 w-5" />,
};

function CustomAgentNode({ data }: { data: any }) {
  const { label, sublabel, status, duration, iconKey } = data;

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
  const icon = iconMap[iconKey as keyof typeof iconMap];

  return (
    <div className="relative w-[340px] select-none text-left">
      {styles.glow && <div className={styles.glow} />}
      
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      
      <div
        className={`flex items-center gap-4 p-4 rounded-xl border backdrop-blur-md transition-all duration-500 ${styles.card}`}
      >
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-sm transition-colors duration-500 ${styles.iconContainer}`}>
          {status === "complete" ? <Check className="h-5 w-5" /> : icon}
        </div>
        <div className="text-left flex-grow mr-2">
          <div className={`text-sm font-bold transition-colors duration-500 ${status === "active" ? "text-purple-300" : status === "complete" ? "text-emerald-400" : "text-gray-400"}`}>
            {label}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">{sublabel}</div>
        </div>

        {status === "complete" && duration !== undefined && (
          <span className="ml-auto text-xs font-mono font-semibold text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded shrink-0">
            {duration.toFixed(2)}s
          </span>
        )}

        {status === "active" && (
          <div className="ml-auto flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}

const nodeTypes = {
  agentNode: CustomAgentNode,
};

export default function AgentGraph({ currentStep, timings }: AgentGraphProps) {
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
      if (currentIdx === stepOrder.indexOf("drafting") + 1) return "active"; 
    }

    return "pending";
  };

  const classifyStatus = getStatus("classify");
  const retrievalStatus = getStatus("retrieval");
  const draftStatus = getStatus("draft");
  const supervisorStatus = getStatus("supervisor");

  // Dynamically compute nodes based on current status and timings
  const nodes = useMemo(() => {
    return [
      {
        id: "classify",
        type: "agentNode",
        position: { x: 10, y: 10 },
        data: {
          label: "Classify Agent",
          sublabel: "Urgency & category classification",
          status: classifyStatus,
          duration: timings?.classify,
          iconKey: "classify",
        },
      },
      {
        id: "retrieval",
        type: "agentNode",
        position: { x: 10, y: 130 },
        data: {
          label: "Retrieval Agent",
          sublabel: "Contextual similarity search in Pinecone",
          status: retrievalStatus,
          duration: timings?.retrieval,
          iconKey: "retrieval",
        },
      },
      {
        id: "draft",
        type: "agentNode",
        position: { x: 10, y: 250 },
        data: {
          label: "Draft Agent",
          sublabel: "Draft response generation via Groq",
          status: draftStatus,
          duration: timings?.draft,
          iconKey: "draft",
        },
      },
      {
        id: "supervisor",
        type: "agentNode",
        position: { x: 10, y: 370 },
        data: {
          label: "Supervisor Agent",
          sublabel: "Final decision routing review",
          status: supervisorStatus,
          duration: timings?.supervisor,
          iconKey: "supervisor",
        },
      },
    ];
  }, [classifyStatus, retrievalStatus, draftStatus, supervisorStatus, timings]);

  // Dynamically compute edges style and animation
  const edges = useMemo(() => {
    return [
      {
        id: "e-classify-retrieval",
        source: "classify",
        target: "retrieval",
        animated: classifyStatus === "complete" || retrievalStatus === "active",
        style: {
          stroke: retrievalStatus === "active" 
            ? "#a855f7" 
            : classifyStatus === "complete" 
            ? "#10b981" 
            : "rgba(255,255,255,0.08)",
          strokeWidth: 2,
        },
      },
      {
        id: "e-retrieval-draft",
        source: "retrieval",
        target: "draft",
        animated: retrievalStatus === "complete" || draftStatus === "active",
        style: {
          stroke: draftStatus === "active" 
            ? "#a855f7" 
            : retrievalStatus === "complete" 
            ? "#10b981" 
            : "rgba(255,255,255,0.08)",
          strokeWidth: 2,
        },
      },
      {
        id: "e-draft-supervisor",
        source: "draft",
        target: "supervisor",
        animated: draftStatus === "complete" || supervisorStatus === "active" || supervisorStatus === "complete",
        style: {
          stroke: supervisorStatus === "active" 
            ? "#a855f7" 
            : draftStatus === "complete" 
            ? "#10b981" 
            : "rgba(255,255,255,0.08)",
          strokeWidth: 2,
        },
      },
    ];
  }, [classifyStatus, retrievalStatus, draftStatus, supervisorStatus]);

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-2xl flex flex-col items-center h-full z-10 relative overflow-hidden">
      <style>{`
        .react-flow__renderer {
          background-color: transparent !important;
        }
        .react-flow__edge-path {
          transition: stroke 0.5s ease, stroke-width 0.5s ease;
        }
        .react-flow__handle {
          opacity: 0 !important;
          pointer-events: none !important;
        }
        .react-flow__attribution {
          display: none !important;
        }
      `}</style>
      <div className="absolute top-0 right-0 h-[2px] w-24 bg-gradient-to-r from-purple-500/10 via-purple-500/60 to-purple-500/10"></div>

      <h2 className="text-lg font-bold text-gray-100 self-start flex items-center gap-2 mb-4">
        <Cpu className="h-4 w-4 text-purple-400" />
        Real-Time Agent Execution Graph
      </h2>

      {/* React Flow Container */}
      <div className="w-full h-[450px] relative flex-grow">
        {currentStep ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            panOnDrag={false}
            panOnScroll={false}
            fitView
            fitViewOptions={{ padding: 0.05 }}
          >
            <Background color="rgba(255,255,255,0.03)" gap={20} size={1} />
          </ReactFlow>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black/20 border border-dashed border-white/5 rounded-xl"
          >
            <motion.div
              animate={{ 
                y: [0, -6, 0],
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600/10 border border-purple-500/20 text-purple-400 mb-5"
            >
              <Cpu className="h-8 w-8" />
            </motion.div>
            <h3 className="text-sm font-semibold text-gray-300 leading-relaxed max-w-xs">
              Submit a support ticket to watch AI agents collaborate in real time.
            </h3>
            <div className="flex gap-1.5 mt-6">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500/60 animate-pulse" />
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500/60 animate-pulse delay-75" />
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500/60 animate-pulse delay-150" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Execution Timings Panel */}
      {timings && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mt-6 pt-6 border-t border-white/5 flex flex-col gap-3"
        >
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider text-left mb-1">
            Execution Timings
          </div>
          <div className="grid grid-cols-2 gap-2 text-left">
            {timings.classify !== undefined && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 text-xs">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <span className="text-emerald-500">✓</span> Classify Agent
                </span>
                <span className="font-mono text-purple-300 font-bold">{timings.classify.toFixed(2)}s</span>
              </div>
            )}
            {timings.retrieval !== undefined && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 text-xs">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <span className="text-emerald-500">✓</span> Retrieval Agent
                </span>
                <span className="font-mono text-purple-300 font-bold">{timings.retrieval.toFixed(2)}s</span>
              </div>
            )}
            {timings.draft !== undefined && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 text-xs">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <span className="text-emerald-500">✓</span> Draft Agent
                </span>
                <span className="font-mono text-purple-300 font-bold">{timings.draft.toFixed(2)}s</span>
              </div>
            )}
            {timings.supervisor !== undefined && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 text-xs">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <span className="text-emerald-500">✓</span> Supervisor Agent
                </span>
                <span className="font-mono text-purple-300 font-bold">{timings.supervisor.toFixed(2)}s</span>
              </div>
            )}
          </div>

          {timings.total !== undefined && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-2 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between"
            >
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Total Runtime</span>
                <span className="text-[11px] text-gray-400 mt-0.5">Workflow execution completed</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-mono font-black text-purple-300 glow-purple">
                  {timings.total.toFixed(2)}s
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
