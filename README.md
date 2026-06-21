# AI Customer Support Intelligence Platform

An enterprise-grade, production-style Multi-Agent AI Customer Support system. The platform orchestrates complex support operations using an asynchronous job queue, microservice agents, semantic vector databases, and a real-time monitoring operations dashboard.

---

## 🚀 Key Features

* **Multi-Agent AI Pipeline**: An event-driven LangGraph orchestrating specialized agents:
  * **Classify Agent**: Determines urgency classification (`LOW`, `MEDIUM`, `HIGH`).
  * **Retrieval Agent**: Performs semantic vector searches in Pinecone to find similar resolved issues.
  * **Draft Agent**: Generates empathetic, contextual support draft responses via Groq LLM.
  * **Supervisor Agent**: Rules final actions, auto-sending low-urgency verified replies or escalating high-urgency/complex tickets to manual human review.
* **Process-Isolated Asynchronous Queueing**: Decouples API endpoints from slow LLM/agent compute pipelines using **Redis** and **BullMQ**. High-performance worker nodes run isolated from web servers to prevent Node.js event-loop blockage.
* **Real-time Event Streaming**: Live worker actions, progress updates, and terminal-style logs are published to **Redis Pub/Sub** and broadcast to clients via a **NestJS Socket.io Gateway** (utilizing socket rooms tied to specific `jobId` sessions).
* **World-Class Operations UI**: A dark-themed, glassmorphic React dashboard featuring a custom HTML5 canvas particle background, interactive SVG execution graph nodes, animated flow lines, a live terminal, and copyable draft outcomes.

---

## 🏗 System Architecture

```text
       [ React Frontend Client ]
                  │
        (HTTP)    │  (WebSockets / Socket.io)
    POST /run     │  Join "jobId" Rooms
                  ▼
         [ NestJS API Gateway ] ───(Publish)───► [ Redis Pub/Sub ]
                  │                                     ▲
             (Queue Job)                                │
                  ▼                                 (Subscribe)
         [ Redis Queue (BullMQ) ]                       │
                  │                                     │
             (Poll Job)                                 │
                  ▼                                     │
        [ Standalone Worker Node ] ───(Emit Progress)───┘
                  │
       (HTTP Streaming NDJSON)
         POST /run-workflow/stream
                  ▼
       [ FastAPI Python AI Service ]
                  │
        [ LangGraph Workflow ]
         ├── Classify Agent
         ├── Retrieval Agent  ◄──► [ Pinecone Vector DB ]
         ├── Draft Agent      ◄──► [ Groq LLM API ]
         └── Supervisor Agent
```

---

## 📂 Project Structure

```bash
customer-intelligence-platform/
├── backend/                  # NestJS API Gateway & Queue Service
│   ├── src/
│   │   ├── main.ts           # Web server entrypoint
│   │   ├── main-worker.ts    # Standalone queue worker process entrypoint
│   │   └── modules/
│   │       ├── queue/        # BullMQ producers, workers & job stores
│   │       └── socket/       # Socket.io gateways & Redis Pub/Sub subscribers
│   └── package.json
│
├── ai-service/               # FastAPI LangGraph AI Orchestration
│   ├── agents/               # Classify, Retrieval, Draft & Supervisor agents
│   ├── graph/                # State definitions and LangGraph workflow config
│   ├── services/             # Pinecone and Groq LLM client wrappers
│   └── app.py                # FastAPI endpoints & streaming event loops
│
└── frontend/                 # Vite React Operations Dashboard (TypeScript)
    ├── src/
    │   ├── components/       # Header, AgentGraph, TicketPanel, ParticleBackground
    │   ├── sockets/          # Socket.io client setup
    │   ├── App.tsx           # Global state & coordinate dashboard panel
    │   └── main.tsx          # React render engine hook
    └── package.json
```

---

## 🛠 Prerequisites

Ensure you have the following installed on your system:
* **Node.js** (v18 or higher)
* **Python** (3.10 or higher)
* **Redis** (running locally on port `6379`)

Verify Redis is running:
```bash
redis-cli ping
# Expected output: PONG
```

---

## 🔧 Installation & Setup

### 1. AI Service Setup (FastAPI)
1. Navigate to `ai-service`:
   ```bash
   cd ai-service
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file and input your keys:
   ```bash
   cp .env.example .env
   ```
   *Required variables*: `PINECONE_API_KEY`, `PINECONE_INDEX`, and `GROQ_API_KEY`.
5. Run the FastAPI development server:
   ```bash
   uvicorn app:app --reload --port 8000
   ```

### 2. Backend Gateway Setup (NestJS)
1. Navigate to `backend`:
   ```bash
   cd ../backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```
   *Required variables*: `PORT=3000`, `REDIS_URL` (connection URL, e.g. Upstash secure Redis URL) or fallbacks `REDIS_HOST=localhost` and `REDIS_PORT=6379`, `AI_SERVICE_URL=http://localhost:8000`, and `START_WORKER=true`.
4. Compile the application and start the web gateway:
   ```bash
   npm run build
   npm run start:dev
   ```
5. **Start the queue worker** (Run in a separate terminal process to isolate worker overhead):
   ```bash
   npm run worker
   ```

### 3. Frontend Dashboard Setup (React + Vite)
1. Navigate to `frontend`:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```
   *Required variables*: `VITE_BACKEND_URL=http://localhost:3000`.
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
5. Open your browser to `http://localhost:5173`.

---

## ⚙ Production Considerations (Scaling & Architecture)

* **Process Isolation**: In production, set `START_WORKER=false` in the environment variables of your API web instances (so they only ingest requests and trigger socket broadcasts without executing workers). Run standalone worker nodes running `npm run worker:prod` on separate server instances to scale work capacity independently.
* **WebSocket Rooms**: Rather than broadcasting progress to all connected clients, clients subscribe to rooms corresponding to the unique `jobId` (`socket.emit("join", jobId)`). Progress reports are targeted only to the client watching the ticket, significantly reducing network traffic.

---

## 🆕 Recent Updates & Enhancements

We have rolled out several premium updates to improve visibility, usability, and visual feedback:

1. **Queue Status Badge**:
   * Displays the actual BullMQ queue status (`Queued`, `Running`, `Completed`, `Failed`) dynamically queried from Redis via the NestJS API.
   * Features a pulsing bullet indicator near the run button.
   * State is persisted across page refreshes via `localStorage` and synced via active polling.

2. **System Architecture Drawer**:
   * Added a glassmorphic, slide-out drawer accessible by clicking the animated CPU icon in the header.
   * Graphically demonstrates the system stack layers: `React` ➔ `Socket.io` ➔ `NestJS` ➔ `BullMQ` ➔ `Redis` ➔ `Worker` ➔ `FastAPI` ➔ `LangGraph` ➔ `MCP` ➔ `Pinecone`.

3. **AI Confidence & Risk Metrics**:
   * Integrated into the **Supervisor Decision** panel.
   * Computes a dynamic `Confidence %` and `Risk Level` (`Low` / `Medium` / `High`) based on classification urgency, routing logic, and historical retrieval match scores.

4. **Dashboard Onboarding (Empty State)**:
   * Prior to the first ticket submission, the center graph is replaced with a custom onboarding card: *"Submit a support ticket to watch AI agents collaborate in real time."*
   * Includes floating animations and pulsing indicator lights.

5. **Expanded Preset Templates**:
   * Expanded presets list to 8 common support tickets: *Login Lockout, Double Charged, Account Compromised, Email Not Received, Subscription Cancellation, Invoice Missing, Payment Failed,* and *Data Export Request*.
   * Placed inside a scrollable container to preserve the main container height.

6. **Agent Execution Pace Tuning**:
   * Added a 1.5-second delay to each agent step (`classify`, `retrieval`, `draft`, `supervisor`) in the python `ai-service` to allow observers to follow graph animations and terminal logs step-by-step.

7. **Upstash Redis Integration**:
   - Seamless support for secure remote Redis instances (like Upstash) via the `REDIS_URL` environment variable.
   - Built-in URL sanitization to strip console command prefixes (like `redis-cli --tls -u ...`), auto-detecting TLS requirements and configuring secure connections seamlessly.
   - Clean implementation of BullMQ connection sharing to avoid nested Node module compiler conflicts.