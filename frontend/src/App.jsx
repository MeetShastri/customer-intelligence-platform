import { useState, useEffect, useRef } from "react";
import socket from "./sockets/socket";
import axios from "axios";
import "./App.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function App() {
  const [ticket, setTicket] = useState("My account is locked out after three failed login attempts. Please help me reset my password.");
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState(null);
  
  // Progress states
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(null);
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);

  const logsEndRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom of logs when they update
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to Socket.io gateway");
    });

    socket.on("progress-update", (data) => {
      console.log("Received progress update:", data);
      
      // Update progress states
      if (data.progress !== undefined) setProgress(data.progress);
      if (data.step) setCurrentStep(data.step);
      if (data.logs) setLogs(data.logs);
      
      if (data.step === "completed" && data.result) {
        setResult(data.result);
        setLoading(false);
      } else if (data.step === "failed") {
        setLoading(false);
      }
    });

    return () => {
      socket.off("connect");
      socket.off("progress-update");
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ticket.trim()) return;

    setLoading(true);
    setJobId(null);
    setProgress(0);
    setCurrentStep("queued");
    setLogs(["Submitting ticket to queue..."]);
    setResult(null);

    try {
      const response = await axios.post(`${BACKEND_URL}/workflow/run`, {
        ticket,
      });

      const { jobId } = response.data;
      setJobId(jobId);
      setLogs((prev) => [...prev, `Ticket queued. Job ID: ${jobId}`, "Waiting for worker to pick up..."]);
      
      // Join room for this job ID
      socket.emit("join", jobId);
      console.log(`Requested to join room for job: ${jobId}`);

    } catch (error) {
      console.error("Error running workflow:", error);
      setLogs((prev) => [...prev, `Failed to run workflow: ${error.message}`]);
      setLoading(false);
    }
  };

  const stepsList = [
    { key: "queued", label: "Queued in Redis" },
    { key: "starting", label: "Job Picked Up" },
    { key: "classification", label: "Urgency Classified" },
    { key: "retrieval", label: "Context Retrieved" },
    { key: "drafting", label: "Reply Drafted" },
    { key: "completed", label: "Supervisor Done" },
  ];

  const getStepIndex = (stepKey) => {
    return stepsList.findIndex((s) => s.key === stepKey);
  };

  const currentStepIndex = getStepIndex(currentStep);

  return (
    <div className="container">
      <header className="app-header">
        <h1>AI Support Intelligence Platform</h1>
        <p className="subtitle">Real-time Multi-Agent Workflow Monitor (Day 7)</p>
      </header>

      <main className="dashboard-grid">
        {/* Ticket Submission Section */}
        <section className="card form-section">
          <h2>Submit Customer Ticket</h2>
          <form onSubmit={handleSubmit}>
            <textarea
              value={ticket}
              onChange={(e) => setTicket(e.target.value)}
              placeholder="Describe the customer issue here..."
              rows={5}
              disabled={loading}
              className="ticket-input"
            />
            <button type="submit" disabled={loading || !ticket.trim()} className="btn-submit">
              {loading ? "Processing..." : "Run AI Workflow"}
            </button>
          </form>

          {jobId && (
            <div className="job-badge">
              Active Job ID: <code>{jobId}</code>
            </div>
          )}
        </section>

        {/* Live Progress Tracker */}
        <section className="card progress-section">
          <h2>Workflow Progress ({progress}%)</h2>
          
          {/* Progress Bar */}
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>

          {/* Stepper */}
          <div className="stepper">
            {stepsList.map((step, index) => {
              let statusClass = "step-pending";
              if (index < currentStepIndex) statusClass = "step-complete";
              else if (index === currentStepIndex) statusClass = "step-active";

              return (
                <div key={step.key} className={`step-item ${statusClass}`}>
                  <div className="step-number">
                    {statusClass === "step-complete" ? "✓" : index + 1}
                  </div>
                  <div className="step-label">{step.label}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Live Console Logs */}
        <section className="card console-section">
          <h2>Real-Time Agent Logs</h2>
          <div className="console-log-box">
            {logs.map((log, idx) => (
              <div key={idx} className="log-line">
                <span className="log-prefix">&gt;</span> {log}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </section>

        {/* Output Section */}
        {result && (
          <section className="card output-section fade-in">
            <h2>Workflow Output</h2>
            <div className="meta-details">
              <div className="meta-item">
                <span className="meta-label">Urgency Classification:</span>
                <span className={`badge urgency-${result.urgency?.toLowerCase()}`}>
                  {result.urgency}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Supervisor Decision:</span>
                <span className={`badge decision-${result.decision?.toLowerCase()?.replace('_', '-')}`}>
                  {result.decision}
                </span>
              </div>
            </div>

            <div className="draft-reply-box">
              <h3>Drafted AI Response:</h3>
              <p className="draft-content">{result.draft_reply}</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;