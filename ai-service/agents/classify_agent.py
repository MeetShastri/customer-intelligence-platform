from graph.state import GraphState

async def classify_agent(state: GraphState):

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

    return state