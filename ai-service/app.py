from fastapi import FastAPI
from routes.ticket_routes import router as ticket_router

app = FastAPI(title="Customer Intelligence Platform AI Service")

# Include the external routers
app.include_router(ticket_router, prefix="/api/v1/tickets")

@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}