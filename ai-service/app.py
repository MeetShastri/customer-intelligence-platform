from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import json
from routes.ticket_routes import router as ticket_router
from graph.workflow_graph import graph

app = FastAPI(title="Customer Intelligence Platform AI Service")

# Include the external routers
app.include_router(ticket_router, prefix="/api/v1/tickets")

@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}



@app.post("/api/v1/run-workflow")
async def run_workflow(payload: dict):
    print('we are inside the ai-service')
    result = await graph.ainvoke({
        "ticket": payload["ticket"],
        "urgency": "",
        "retrieved_context": [],
        "draft_reply": "",
        "decision": "",
        "logs": []
    })

    return result

@app.post("/api/v1/run-workflow/stream")
async def run_workflow_stream(payload: dict):
    async def event_generator():
        initial_state = {
            "ticket": payload["ticket"],
            "urgency": "",
            "retrieved_context": [],
            "draft_reply": "",
            "decision": "",
            "logs": []
        }
        async for chunk in graph.astream(initial_state):
            yield json.dumps(chunk) + "\n"

    return StreamingResponse(event_generator(), media_type="application/x-ndjson")