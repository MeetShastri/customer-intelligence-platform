from graph.state import GraphState
from services.llm_service import llm

async def draft_agent(state: GraphState):

    ticket = state["ticket"]

    retrieved_context = state["retrieved_context"]

    context_text = ""

    for item in retrieved_context:

        context_text += f"""
        Similar Issue:
        {item['issue']}

        Resolution:
        {item['resolution']}
        """

    prompt = f"""
    You are an enterprise customer support AI assistant.

    Generate a professional and concise customer support reply.

    Customer Ticket:
    {ticket}

    Historical Similar Cases:
    {context_text}

    Requirements:
    - Be empathetic
    - Be concise
    - Avoid hallucinations
    - Do not invent policies
    - Use historical cases as guidance
    """

    response = await llm.ainvoke(prompt)

    state["draft_reply"] = response.content

    state["logs"].append(
        "Draft response generated"
    )

    return state