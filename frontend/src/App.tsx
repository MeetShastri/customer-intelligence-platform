import { useState, useEffect } from "react";
import socket from "./sockets/socket";
import axios from "axios";

import ParticleBackground from "./components/ParticleBackground";
import Header from "./components/Header";
import TicketPanel from "./components/TicketPanel";
import AgentGraph from "./components/AgentGraph";
import Timeline from "./components/Timeline";
import TabsArea from "./components/TabsArea";
import Login from "./components/Login";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

interface WorkflowResult {
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
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [rawJson, setRawJson] = useState<any>(null);

  useEffect(() => {
    socket.on("progress-update", (data: any) => {
      console.log("Progress update received:", data);
      
      if (data.progress !== undefined) {
        setProgress(data.progress);
      }
      if (data.step) {
        setCurrentStep(data.step);
      }
      if (data.logs) {
        setLogs(data.logs);
      }

      // Handle final output
      if (data.step === "completed" && data.result) {
        setResult(data.result);
        setRawJson(data);
        setLoading(false);
      } else if (data.step === "failed") {
        setLoading(false);
        setLogs((prev) => [...prev, "Workflow execution failed."]);
      }
    });

    return () => {
      socket.off("progress-update");
    };
  }, []);

  const handleTicketSubmit = async (ticketText: string) => {
    setLoading(true);
    setProgress(0);
    setCurrentStep("queued");
    setLogs(["Ticket submission queued in Redis..."]);
    setResult(null);
    setRawJson(null);

    try {
      const response = await axios.post(`${BACKEND_URL}/workflow/run`, {
        ticket: ticketText,
      });

      const { jobId } = response.data;
      setLogs((prev) => [
        ...prev,
        `Job assigned ID: ${jobId}`,
        "Waiting for BullMQ worker to pick up...",
      ]);

      // Request to join the specific room for real-time progress updates
      socket.emit("join", jobId);
    } catch (error: any) {
      console.error("Error submitting ticket:", error);
      setLogs((prev) => [...prev, `Failed to enqueue job: ${error.message}`]);
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="relative min-h-screen bg-[#030712] overflow-x-hidden select-none">
      {/* Background decoration grid / particles */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(124,58,237,0.06),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.04),transparent_50%)] pointer-events-none z-0"></div>
      <ParticleBackground />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col min-h-screen">
        <Header />

        {/* Dashboard Panels Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 flex-grow items-stretch">
          {/* Left Panel - Form submission */}
          <div className="lg:col-span-4 h-full">
            <TicketPanel
              onSubmit={handleTicketSubmit}
              loading={loading}
              currentStep={currentStep}
            />
          </div>

          {/* Center Panel - Real-time execution graph */}
          <div className="lg:col-span-4 h-full">
            <AgentGraph currentStep={currentStep} />
          </div>

          {/* Right Panel - Live logs timeline */}
          <div className="lg:col-span-4 h-full">
            <Timeline logs={logs} currentStep={currentStep} />
          </div>
        </div>

        {/* Bottom Panel - Tabbed result area */}
        <div className="w-full mt-auto">
          <TabsArea result={result} rawJson={rawJson} />
        </div>
      </div>
    </div>
  );
}
