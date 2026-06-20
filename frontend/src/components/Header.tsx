import { Cpu } from "lucide-react";

interface HeaderProps {
  onOpenDrawer: () => void;
}

export default function Header({ onOpenDrawer }: HeaderProps) {
  return (
    <header className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8 z-10">
      <div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDrawer}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/10 border border-purple-500/30 text-purple-400 hover:bg-purple-600/20 hover:text-purple-300 transition-all cursor-pointer group"
            title="View Architecture Flow"
          >
            <Cpu className="h-5 w-5 animate-pulse group-hover:scale-110 transition-transform" />
          </button>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
              Customer Intelligence Platform
            </h1>
            <p className="text-xs text-gray-400 font-medium">Real-time Multi-Agent AI Operations</p>
          </div>
        </div>
      </div>
    </header>
  );
}
