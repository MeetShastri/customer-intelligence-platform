import time
import asyncio
from graph.state import GraphState

async def supervisor_agent(state: GraphState):
    start_time = time.perf_counter()
    await asyncio.sleep(1.5)
    if "timings" not in state or state["timings"] is None:
        state["timings"] = {}

    urgency = state["urgency"]

    retrieved_context = state["retrieved_context"]

    decision = "HUMAN_REVIEW"

    if (
        urgency == "LOW"
        and len(retrieved_context) > 0
    ):
        decision = "AUTO_SEND"

    state["decision"] = decision

    state["logs"].append(
        f"Supervisor decision: {decision}"
    )

    duration = time.perf_counter() - start_time
    state["timings"]["supervisor"] = max(round(duration, 2), 0.01)

    # Calculate total workflow runtime as the sum of all agent durations
    classify_time = state["timings"].get("classify", 0.0)
    retrieval_time = state["timings"].get("retrieval", 0.0)
    draft_time = state["timings"].get("draft", 0.0)
    supervisor_time = state["timings"].get("supervisor", 0.0)
    state["timings"]["total"] = round(classify_time + retrieval_time + draft_time + supervisor_time, 2)

    return state