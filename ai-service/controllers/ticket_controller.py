from models.ticket_model import TicketModel
from services.embedding_service import generate_embedding
from services.pinecone_service import index

async def create_ticket_controller(ticket: TicketModel):

    text_for_embedding = f"""
    Issue: {ticket.issue}
    Resolution: {ticket.resolution}
    """
    print('text_for_embedding: ', text_for_embedding)
    embedding = generate_embedding(text_for_embedding)
    print(len(embedding))
    index.upsert(
        vectors=[
            {
                "id": ticket.ticketId,
                "values": embedding,
                "metadata": {
                    "issue": ticket.issue,
                    "resolution": ticket.resolution,
                    "priority": ticket.priority
                }
            }
        ]
    )

    return {
        "message": "Ticket successfully added to Pinecone",
        "ticketId": ticket.ticketId
    }

async def search_tickets_controller(query: str, top_k: int = 5):
    # Generate embedding for the search query
    query_embedding = generate_embedding(query)
    
    # Search Pinecone for similar tickets
    results = index.query(
        vector=query_embedding,
        top_k=top_k,
        include_metadata=True
    )
    
    formatted_results = []
    for match in results.get("matches", []):
        score = match.get("score", 0)
        
        # Only return matches that are somewhat relevant (e.g., score > 0.3)
        if score > 0.4:
            metadata = match.get("metadata", {})
            formatted_results.append({
                "score": score,
                "issue": metadata.get("issue", ""),
                "resolution": metadata.get("resolution", ""),
                "priority": metadata.get("priority", "")
            })
        
    return formatted_results
