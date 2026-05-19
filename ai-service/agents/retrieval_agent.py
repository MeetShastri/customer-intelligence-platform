from graph.state import GraphState

from mcp_server.tools.pinecone_search_tool import (
    pinecone_search_tool
)

async def retrieval_agent(state: GraphState):

    ticket = state["ticket"]

    results = await pinecone_search_tool(ticket)

    state["retrieved_context"] = results

    state["logs"].append(
        "Retrieved similar support tickets"
    )

    return state