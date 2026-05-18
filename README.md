# Customer Intelligence Platform

## Overview

Customer Intelligence Platform is a production-style multi-agent AI support system built using LangGraph, MCP Server, Pinecone, NestJS, Redis, Socket.io, and React.

The system processes customer support tickets through an AI workflow pipeline where:

1. Ticket urgency is classified
2. Similar historical tickets are retrieved from Pinecone
3. AI drafts a suggested response
4. Supervisor agent decides:
   - Auto-send response
   - Flag for human review

The platform also streams real-time workflow progress to the frontend dashboard using Socket.io.

---

# Tech Stack

## Frontend
- React
- Vite
- Socket.io Client
- Axios

## Backend
- NestJS
- Socket.io
- BullMQ
- Redis
- Axios

## AI Service
- Python
- FastAPI
- LangGraph
- LangChain
- Pinecone

## Infrastructure
- Redis
- AWS EC2

---

# Project Structure

```bash
customer-intelligence-platform/
│
├── backend/        # NestJS Backend
├── frontend/       # React Frontend
├── ai-service/     # Python LangGraph AI Service
└── README.md

---

# Setup

## Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env
npm run build
npm run start:dev
```

## Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env
npm run dev
```

## AI Service
```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

---

# Usage

1. Start Backend → `npm run start:dev`
2. Start Frontend → `npm run dev`
3. Start AI Service → `uvicorn app:app --reload --port 8000`

Access:
- Frontend: http://localhost:3000
- AI Service: http://localhost:8000/health

---

# Architecture

```

Frontend (React) <─── Socket.io ───> Backend (NestJS) ─── Redis ─── AI Service (LangGraph)
        ↑                                 ↑                        ↑
        └─────────────────────────────────└────────────────────────┘
                         AI-Assisted Ticket Resolution

```

---

# Features

✅ Real-time Ticket Processing
✅ Multi-Agent Workflow Pipeline
✅ Pinecone Similarity Search
✅ AI Response Drafting
✅ Supervisor Decision Agent
✅ Socket.io Progress Streaming
✅ Production-Grade Stack

---

# Testing

1. Open Frontend
2. Open AI Service
3. Open Backend
4. Test ticket resolution workflow
5. Check Socket.io events in browser console