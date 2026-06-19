from fastapi import FastAPI
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