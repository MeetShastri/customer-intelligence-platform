import time
import asyncio
from graph.state import GraphState

async def classify_agent(state: GraphState):
    start_time = time.perf_counter()
    await asyncio.sleep(1.5)
    if "timings" not in state or state["timings"] is None:
        state["timings"] = {}

    ticket = state["ticket"]

    urgency_keywords = [
        "fraud",
        "payment failed",
        "billing issue",
        "charged twice"
    ]

    urgency = "LOW"

    for keyword in urgency_keywords:

        if keyword.lower() in ticket.lower():
            urgency = "HIGH"

    state["urgency"] = urgency

    state["logs"].append(
        f"Ticket classified as {urgency}"
    )

    duration = time.perf_counter() - start_time
    state["timings"]["classify"] = max(round(duration, 2), 0.01)

    return state