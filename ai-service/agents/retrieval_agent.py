import time
from graph.state import GraphState

from mcp_server.tools.pinecone_search_tool import (
    pinecone_search_tool
)

async def retrieval_agent(state: GraphState):
    start_time = time.perf_counter()
    if "timings" not in state or state["timings"] is None:
        state["timings"] = {}

    ticket = state["ticket"]

    results = await pinecone_search_tool(ticket)

    state["retrieved_context"] = results

    state["logs"].append(
        "Retrieved similar support tickets"
    )

    duration = time.perf_counter() - start_time
    state["timings"]["retrieval"] = max(round(duration, 2), 0.01)

    return state