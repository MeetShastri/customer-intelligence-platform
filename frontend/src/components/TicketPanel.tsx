import { useState } from "react";
import { Send, Sparkles } from "lucide-react";

interface TicketPanelProps {
  onSubmit: (ticketText: string) => void;
  loading: boolean;
  currentStep: string | null;
}

const presets = [
  {
    title: "Login Lockout",
    text: "My account is locked out after three failed login attempts. Please help me reset my password.",
  },
  {
    title: "Double Charged",
    text: "I noticed a double charge on my statement from yesterday. Two transactions of $49.00 were processed instead of one. Please refund the duplicate transaction.",
  },
  {
    title: "Account Compromised",
    text: "URGENT: I received an email saying my login details were updated, but I didn't make this change. I think my account has been hacked and I need immediate lockout assistance.",
  },
];

export default function TicketPanel({ onSubmit, loading, currentStep }: TicketPanelProps) {
  const [text, setText] = useState(presets[0].text);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || loading) return;
    onSubmit(text);
  };

  const getButtonText = () => {
    if (!loading) return "Run AI Workflow";
    switch (currentStep) {
      case "queued":
        return "Queued in Redis...";
      case "starting":
        return "Initializing Workflow...";
      default:
        return "Running Agents...";
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-2xl flex flex-col h-full z-10 relative">
      <div className="absolute top-0 right-0 h-[2px] w-24 bg-gradient-to-r from-purple-500/10 via-purple-500/60 to-purple-500/10"></div>
      
      <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-purple-400" />
        Submit Support Ticket
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col flex-grow gap-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe the customer issue here..."
          className="w-full h-40 p-4 rounded-xl border border-white/5 bg-black/30 text-gray-200 text-sm focus:outline-none focus:border-purple-500/50 resize-none transition-colors"
          disabled={loading}
        />

        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
            Try a Preset Template
          </span>
          <div className="flex flex-col gap-2">
            {presets.map((preset) => (
              <button
                key={preset.title}
                type="button"
                onClick={() => !loading && setText(preset.text)}
                className={`text-left text-xs p-3 rounded-lg border border-white/5 transition-all ${
                  loading
                    ? "opacity-50 cursor-not-allowed"
                    : text === preset.text
                    ? "bg-purple-600/10 border-purple-500/30 text-purple-300"
                    : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-300"
                }`}
                disabled={loading}
              >
                <div className="font-semibold mb-0.5">{preset.title}</div>
                <div className="truncate opacity-75">{preset.text}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !text.trim()}
          className={`mt-auto flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all ${
            loading || !text.trim()
              ? "bg-gray-800 text-gray-500 cursor-not-allowed shadow-none border border-white/5"
              : "bg-purple-600 hover:bg-purple-500 cursor-pointer shadow-purple-500/15"
          }`}
        >
          <Send className={`h-4 w-4 ${loading ? "animate-bounce" : ""}`} />
          {getButtonText()}
        </button>
      </form>
    </div>
  );
}
