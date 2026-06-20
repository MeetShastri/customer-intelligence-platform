import { X, Code2, Zap, Server, ListOrdered, Database, Cpu, Flame, GitFork, Wrench, Layers } from "lucide-react";

interface ArchitectureDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const techStack = [
  { name: "React", sub: "User Interface & State Management", icon: Code2, color: "text-blue-400 border-blue-500/20 bg-blue-500/5" },
  { name: "Socket.io", sub: "Bi-directional Event Streaming", icon: Zap, color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5" },
  { name: "NestJS", sub: "Main Server & Gateway Architecture", icon: Server, color: "text-rose-400 border-rose-500/20 bg-rose-500/5" },
  { name: "BullMQ", sub: "Queue Manager & Job Distribution", icon: ListOrdered, color: "text-amber-400 border-amber-500/20 bg-amber-500/5" },
  { name: "Redis", sub: "BullMQ Backing & Pub/Sub Store", icon: Database, color: "text-red-400 border-red-500/20 bg-red-500/5" },
  { name: "Worker", sub: "NestJS Node Worker executing jobs", icon: Cpu, color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" },
  { name: "FastAPI", sub: "Python Backend for ML models", icon: Flame, color: "text-teal-400 border-teal-500/20 bg-teal-500/5" },
  { name: "LangGraph", sub: "Stateful Multi-Agent graphs", icon: GitFork, color: "text-violet-400 border-violet-500/20 bg-violet-500/5" },
  { name: "MCP", sub: "Tool Integration & context provider", icon: Wrench, color: "text-pink-400 border-pink-500/20 bg-pink-500/5" },
  { name: "Pinecone", sub: "Semantic Search & RAG Store", icon: Layers, color: "text-sky-400 border-sky-500/20 bg-sky-500/5" }
];

export default function ArchitectureDrawer({ isOpen, onClose }: ArchitectureDrawerProps) {
  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#090d16]/95 backdrop-blur-md border-l border-white/10 p-6 overflow-y-auto shadow-2xl z-50 transition-transform duration-300 ease-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-100">System Architecture</h2>
            <p className="text-xs text-gray-400">Data flow & technology stack layers</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-white/5 bg-white/5 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col items-center">
          {techStack.map((tech, index) => {
            const Icon = tech.icon;
            return (
              <div key={tech.name} className="w-full flex flex-col items-center">
                <div className={`w-full flex items-center gap-4 p-4 rounded-xl border ${tech.color} transition-all duration-300 hover:scale-[1.02] hover:bg-white/[0.02]`}>
                  <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-black/40 border border-white/5">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-100">{tech.name}</h3>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">{tech.sub}</p>
                  </div>
                </div>
                {index < techStack.length - 1 && (
                  <div className="my-1.5 flex flex-col items-center gap-0.5">
                    <div className="h-4 w-0.5 bg-gradient-to-b from-purple-500/40 to-indigo-500/40" />
                    <span className="text-[10px] text-purple-400/60 font-bold select-none">↓</span>
                    <div className="h-4 w-0.5 bg-gradient-to-b from-indigo-500/40 to-blue-500/40" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
