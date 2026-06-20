import { motion } from "framer-motion";
import { Ticket, Send, UserCheck, Clock } from "lucide-react";
import { useEffect, useRef } from "react";
import { animate } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
}

function AnimatedCounter({ value, decimals = 0 }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const controls = animate(parseFloat(node.textContent || "0"), value, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate(val) {
        node.textContent = val.toFixed(decimals);
      },
    });

    return () => controls.stop();
  }, [value, decimals]);

  return <span ref={ref}>{value.toFixed(decimals)}</span>;
}

interface MetricsCardsProps {
  metrics: {
    ticketsProcessed: number;
    autoSent: number;
    humanReview: number;
    totalRuntime: number;
  };
}

export default function MetricsCards({ metrics }: MetricsCardsProps) {
  const avgRuntime = metrics.ticketsProcessed > 0 
    ? metrics.totalRuntime / metrics.ticketsProcessed 
    : 0;

  const cardData = [
    {
      label: "Tickets Processed",
      value: metrics.ticketsProcessed,
      decimals: 0,
      icon: <Ticket className="h-5 w-5 text-purple-400" />,
      colorClass: "from-purple-500/20 to-purple-500/5",
      borderClass: "border-purple-500/20",
      glowClass: "shadow-purple-500/5",
      suffix: "",
    },
    {
      label: "Auto Sent",
      value: metrics.autoSent,
      decimals: 0,
      icon: <Send className="h-5 w-5 text-emerald-400" />,
      colorClass: "from-emerald-500/20 to-emerald-500/5",
      borderClass: "border-emerald-500/20",
      glowClass: "shadow-emerald-500/5",
      suffix: "",
    },
    {
      label: "Human Review",
      value: metrics.humanReview,
      decimals: 0,
      icon: <UserCheck className="h-5 w-5 text-amber-400" />,
      colorClass: "from-amber-500/20 to-amber-500/5",
      borderClass: "border-amber-500/20",
      glowClass: "shadow-amber-500/5",
      suffix: "",
    },
    {
      label: "Average Runtime",
      value: avgRuntime,
      decimals: 2,
      icon: <Clock className="h-5 w-5 text-sky-400" />,
      colorClass: "from-sky-500/20 to-sky-500/5",
      borderClass: "border-sky-500/20",
      glowClass: "shadow-sky-500/5",
      suffix: "s",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 z-10 relative">
      {cardData.map((card, idx) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.08 }}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className={`glass-panel rounded-2xl p-5 shadow-lg border ${card.borderClass} ${card.glowClass} relative overflow-hidden flex items-center justify-between group`}
        >
          {/* Subtle radial background glow */}
          <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-gradient-to-br ${card.colorClass} opacity-30 blur-xl group-hover:scale-125 transition-transform duration-500`} />
          
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              {card.label}
            </span>
            <span className="text-2xl font-black text-gray-100 font-mono mt-1 flex items-baseline">
              <AnimatedCounter value={card.value} decimals={card.decimals} />
              {card.suffix && <span className="text-sm font-semibold text-gray-400 ml-0.5">{card.suffix}</span>}
            </span>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors">
            {card.icon}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
