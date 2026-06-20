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
import MetricsCards from "./components/MetricsCards";

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
  timings?: {
    classify?: number;
    retrieval?: number;
    draft?: number;
    supervisor?: number;
    total?: number;
  };
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(() => {
    const status = localStorage.getItem("cip-workflow-queue-status");
    return status === "Queued" || status === "Running";
  });
  const [jobId, setJobId] = useState<string | null>(() => {
    return localStorage.getItem("cip-workflow-job-id") || null;
  });
  const [queueStatus, setQueueStatus] = useState<string | null>(() => {
    return localStorage.getItem("cip-workflow-queue-status") || null;
  });
  const [currentStep, setCurrentStep] = useState<string | null>(() => {
    const status = localStorage.getItem("cip-workflow-queue-status");
    if (status === "Queued") return "queued";
    if (status === "Running") return "starting";
    return null;
  });
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [rawJson, setRawJson] = useState<any>(null);
  const [timings, setTimings] = useState<WorkflowResult["timings"] | null>(null);
  const [metrics, setMetrics] = useState(() => {
    try {
      const saved = localStorage.getItem("cip-workflow-metrics");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return {
      ticketsProcessed: 0,
      autoSent: 0,
      humanReview: 0,
      totalRuntime: 0
    };
  });

  useEffect(() => {
    socket.on("progress-update", (data: any) => {
      console.log("Progress update received:", data);
      
      if (data.progress !== undefined) {
        setProgress(data.progress);
      }
      if (data.step) {
        setCurrentStep(data.step);
        if (data.step === "completed") {
          setQueueStatus("Completed");
          localStorage.setItem("cip-workflow-queue-status", "Completed");
        } else if (data.step === "failed") {
          setQueueStatus("Failed");
          localStorage.setItem("cip-workflow-queue-status", "Failed");
        } else if (
          data.step === "starting" ||
          data.step === "classification" ||
          data.step === "retrieval" ||
          data.step === "drafting"
        ) {
          setQueueStatus("Running");
          localStorage.setItem("cip-workflow-queue-status", "Running");
        }
      }
      if (data.logs) {
        setLogs(data.logs);
      }
      if (data.result && data.result.timings) {
        setTimings((prev) => ({
          ...prev,
          ...data.result.timings
        }));
      }

      // Handle final output
      if (data.step === "completed" && data.result) {
        setResult(data.result);
        setRawJson(data);
        setLoading(false);

        // Update metrics
        setMetrics((prev: any) => {
          const isAutoSend = data.result.decision === "AUTO_SEND";
          const runtime = data.result.timings?.total || 0;
          const nextMetrics = {
            ticketsProcessed: prev.ticketsProcessed + 1,
            autoSent: prev.autoSent + (isAutoSend ? 1 : 0),
            humanReview: prev.humanReview + (isAutoSend ? 0 : 1),
            totalRuntime: prev.totalRuntime + runtime
          };
          try {
            localStorage.setItem("cip-workflow-metrics", JSON.stringify(nextMetrics));
          } catch (e) {
            console.error(e);
          }
          return nextMetrics;
        });
      } else if (data.step === "failed") {
        setLoading(false);
        setLogs((prev) => [...prev, "Workflow execution failed."]);
      }
    });

    return () => {
      socket.off("progress-update");
    };
  }, []);

  // Poll & sync queue status from BullMQ backend via jobId
  useEffect(() => {
    if (!jobId) return;

    // Join socket room for this jobId on load/refresh
    socket.emit("join", jobId);

    let active = true;
    let pollInterval: any;

    const checkStatus = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/workflow/status/${jobId}`);
        const status = res.data.status;
        if (!active) return;

        if (status) {
          let nextStatus: string | null = null;
          if (status === "waiting" || status === "delayed" || status === "prioritized") {
            nextStatus = "Queued";
          } else if (status === "active") {
            nextStatus = "Running";
          } else if (status === "completed") {
            nextStatus = "Completed";
          } else if (status === "failed") {
            nextStatus = "Failed";
          }

          if (nextStatus) {
            setQueueStatus(nextStatus);
            localStorage.setItem("cip-workflow-queue-status", nextStatus);
            
            // If terminal state, clear interval and set loading false
            if (nextStatus === "Completed" || nextStatus === "Failed") {
              setLoading(false);
              if (pollInterval) clearInterval(pollInterval);
            } else {
              setLoading(true);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching job status:", err);
      }
    };

    // Check status immediately
    checkStatus();

    // Poll status every 2 seconds if not completed/failed
    if (queueStatus !== "Completed" && queueStatus !== "Failed") {
      pollInterval = setInterval(checkStatus, 2000);
    }

    return () => {
      active = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [jobId, queueStatus]);

  const handleTicketSubmit = async (ticketText: string) => {
    setLoading(true);
    setProgress(0);
    setCurrentStep("queued");
    setQueueStatus("Queued");
    localStorage.setItem("cip-workflow-queue-status", "Queued");
    setLogs(["Ticket submission queued in Redis..."]);
    setResult(null);
    setRawJson(null);
    setTimings(null);

    try {
      const response = await axios.post(`${BACKEND_URL}/workflow/run`, {
        ticket: ticketText,
      });

      const { jobId } = response.data;
      localStorage.setItem("cip-workflow-job-id", jobId);
      setJobId(jobId);
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
      setQueueStatus("Failed");
      localStorage.setItem("cip-workflow-queue-status", "Failed");
    }
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="relative min-h-screen bg-[#030712] overflow-x-hidden">
      {/* Background decoration grid / particles */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(124,58,237,0.06),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.04),transparent_50%)] pointer-events-none z-0"></div>
      <ParticleBackground />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col min-h-screen">
        <Header />

        <MetricsCards metrics={metrics} />

        {/* Dashboard Panels Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 flex-grow items-stretch">
          {/* Left Panel - Form submission */}
          <div className="lg:col-span-4 h-full">
            <TicketPanel
              onSubmit={handleTicketSubmit}
              loading={loading}
              currentStep={currentStep}
              queueStatus={queueStatus}
            />
          </div>

          {/* Center Panel - Real-time execution graph */}
          <div className="lg:col-span-4 h-full">
            <AgentGraph currentStep={currentStep} timings={timings} />
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
