from pydantic import BaseModel

class TicketModel(BaseModel):
    ticketId: str
    issue: str
    resolution: str
    priority: str