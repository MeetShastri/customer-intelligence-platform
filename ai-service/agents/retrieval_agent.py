import time
import asyncio
from graph.state import GraphState
from langchain_core.messages import SystemMessage, HumanMessage
from services.llm_service import llm

from mcp_server.tools.pinecone_search_tool import (
    pinecone_search_tool
)

RETRIEVAL_SYSTEM_PROMPT = """You are the Query Optimization Agent in an enterprise customer support RAG pipeline.
Your job is to optimize raw customer support tickets into clean, concise semantic search queries (1-5 words max) for Pinecone lookup.

Instructions:
1. Strip all conversational fluff, greetings ("Hello", "Please help"), and politeness.
2. Identify core technical entities, errors, systems, and actions (e.g., "login lockout", "double billing", "subscription cancellation").
3. Do not output anything except the raw optimized query. No explanation, no quotes."""

async def retrieval_agent(state: GraphState):
    start_time = time.perf_counter()
    await asyncio.sleep(1.5)
    if "timings" not in state or state["timings"] is None:
        state["timings"] = {}

    ticket = state["ticket"]
    search_query = ticket

    try:
        messages = [
            SystemMessage(content=RETRIEVAL_SYSTEM_PROMPT),
            HumanMessage(content=f"Ticket: {ticket}")
        ]
        
        response = await llm.ainvoke(messages)
        refined_query = response.content.strip().strip('"').strip("'")
        if refined_query:
            search_query = refined_query
            state["logs"].append(f"Optimized search query: '{search_query}'")
    except Exception as e:
        state["logs"].append(f"Query optimization failed, falling back to original ticket. Error: {str(e)}")

    results = await pinecone_search_tool(search_query)

    state["retrieved_context"] = results

    state["logs"].append(
        "Retrieved similar support tickets"
    )

    duration = time.perf_counter() - start_time
    state["timings"]["retrieval"] = max(round(duration, 2), 0.01)

    return state