from graph.state import GraphState

async def supervisor_agent(state: GraphState):

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

    return state