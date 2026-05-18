from fastapi import APIRouter
from models.ticket_model import TicketModel
from controllers.ticket_controller import create_ticket_controller, search_tickets_controller

router = APIRouter()

@router.post("/", tags=["Tickets"])
async def create_ticket(ticket: TicketModel):
    return await create_ticket_controller(ticket)

@router.get("/search", tags=["Search"])
async def search(query: str, top_k: int = 5):
    return await search_tickets_controller(query, top_k)

