from controllers.ticket_controller import search_tickets_controller

async def pinecone_search_tool(query: str):
    return await search_tickets_controller(query)