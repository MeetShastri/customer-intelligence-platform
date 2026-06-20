import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, FileText, UserCheck, Terminal, Copy, Check } from "lucide-react";

interface TabsAreaProps {
  result: {
    urgency: string;
    decision: string;
    draft_reply: string;
    retrieved_context: Array<{
      issue: string;
      resolution: string;
      score?: number;
      priority?: string;
    }>;
    logs: string[];
  } | null;
  rawJson: any;
}

type TabKey = "retrieval" | "draft" | "supervisor" | "developer";

export default function TabsArea({ result, rawJson }: TabsAreaProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("retrieval");
  const [copied, setCopied] = useState(false);

  const tabs = [
    { key: "retrieval", label: "Retrieved Context", icon: <Database className="h-4 w-4" /> },
    { key: "draft", label: "Draft Reply", icon: <FileText className="h-4 w-4" /> },
    { key: "supervisor", label: "Supervisor Decision", icon: <UserCheck className="h-4 w-4" /> },
    { key: "developer", label: "Developer View", icon: <Terminal className="h-4 w-4" /> },
  ] as const;

  const handleCopy = () => {
    if (!result?.draft_reply) return;
    navigator.clipboard.writeText(result.draft_reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderTabContent = () => {
    if (!result) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 text-sm border border-dashed border-white/5 rounded-xl bg-black/20">
          <Terminal className="h-8 w-8 mb-3 opacity-30 animate-pulse text-purple-400" />
          Waiting for workflow execution to complete...
        </div>
      );
    }

    switch (activeTab) {
      case "retrieval":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {result.retrieved_context && result.retrieved_context.length > 0 ? (
              result.retrieved_context.map((match, idx) => (
                <div
                  key={idx}
                  className="flex flex-col bg-white/5 border border-white/5 rounded-xl p-4 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-bold border-l border-b border-white/5 rounded-bl-lg">
                    {match.score ? `${(match.score * 100).toFixed(1)}% Match` : "Similarity Match"}
                  </div>

                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Historical Case {idx + 1}
                  </span>

                  <div className="mb-3 text-left">
                    <h4 className="text-xs font-bold text-gray-300 mb-1">Issue:</h4>
                    <p className="text-xs text-gray-400 max-h-24 overflow-y-auto bg-black/20 p-2 rounded-lg">{match.issue}</p>
                  </div>

                  <div className="text-left">
                    <h4 className="text-xs font-bold text-gray-300 mb-1">Resolution:</h4>
                    <p className="text-xs text-emerald-400/90 max-h-32 overflow-y-auto bg-emerald-500/5 p-2 rounded-lg">{match.resolution}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center text-xs text-gray-500 py-6">
                No similar historical cases retrieved.
              </div>
            )}
          </motion.div>
        );

      case "draft":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 border border-white/5 rounded-xl p-5 relative text-left"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                Agent Generated Output
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 transition-colors border border-white/5"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied!" : "Copy Response"}
              </button>
            </div>
            <p className="text-sm leading-relaxed text-gray-200 whitespace-pre-wrap select-text">
              {result.draft_reply}
            </p>
          </motion.div>
        );

      case "supervisor":
        const isAutoSend = result.decision === "AUTO_SEND";
        const friendlyDecision = isAutoSend ? "Auto Send" : result.decision === "HUMAN_REVIEW" ? "Human Review" : result.decision;
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-6 text-center"
          >
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              Routing Logic Evaluation
            </span>

            <div
              className={`inline-flex items-center gap-2 px-8 py-3 rounded-full border text-lg font-bold shadow-lg mb-6 transition-colors ${
                isAutoSend
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/5"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-amber-500/5"
              }`}
            >
              <UserCheck className="h-5 w-5 animate-pulse" />
              {friendlyDecision}
            </div>

            <div className="max-w-md bg-white/5 border border-white/5 rounded-xl p-4 text-xs text-left">
              <h4 className="font-bold text-gray-300 mb-1.5">Decision Logic Explanation:</h4>
              <p className="text-gray-400 leading-normal">
                {isAutoSend
                  ? "The ticket was classified as LOW urgency and matched relevant historical resolutions. The response has been routed for automated dispatch (Auto Send)."
                  : "The ticket is classified with HIGH urgency or does not match suitable historical cases. Escalated for human review (Human Review)."}
              </p>
            </div>
          </motion.div>
        );

      case "developer":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0b0f19] border border-white/5 rounded-xl p-4 font-mono text-[11px] text-left overflow-x-auto select-text max-h-[350px]"
          >
            <pre className="text-sky-400">{JSON.stringify(rawJson, null, 2)}</pre>
          </motion.div>
        );
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-2xl z-10 relative">
      <div className="absolute top-0 right-0 h-[2px] w-24 bg-gradient-to-r from-purple-500/10 via-purple-500/60 to-purple-500/10"></div>

      {/* Tabs list */}
      <div className="flex border-b border-white/5 gap-2 overflow-x-auto pb-[1px] mb-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
                isActive
                  ? "border-purple-500 text-purple-300 font-bold"
                  : "border-transparent text-gray-500 hover:text-gray-400"
              }`}
            >
              {tab.icon}
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-purple-500"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panel */}
      <div className="min-h-[220px]">
        <AnimatePresence mode="wait">
          {renderTabContent()}
        </AnimatePresence>
      </div>
    </div>
  );
}
