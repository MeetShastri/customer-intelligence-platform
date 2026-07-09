import time
import asyncio
from graph.state import GraphState
from langchain_core.messages import SystemMessage, HumanMessage
from services.llm_service import llm

DRAFT_SYSTEM_PROMPT = """You are the Draft Response Agent of an enterprise customer support team. 
Your objective is to generate an empathetic, concise, and professional draft response to the customer's ticket.

You must adhere to the following rules:
1. Grounding: Rely ONLY on the provided Historical Similar Cases for policies, resolutions, and instructions. Do not invent company policies or make promises not validated by historical context.
2. Empathy: Express clear understanding and validation of the customer's problem.
3. Clarity & Conciseness: Avoid corporate jargon. Provide actionable steps if applicable.
4. Privacy: NEVER mention internal terms like "retrieved context", "historical cases", "RAG", or "AI agents" in the response. Frame the answer as a direct response from customer support.
5. Structure: Keep responses formatted as:
   - Greeting (e.g. "Dear customer," or "Hi there,")
   - Acknowledgment & Empathy
   - Proposed Resolution / Solution Details
   - Closing & Sign-off"""

async def draft_agent(state: GraphState):
    start_time = time.perf_counter()
    await asyncio.sleep(1.5)
    if "timings" not in state or state["timings"] is None:
        state["timings"] = {}

    ticket = state["ticket"]
    retrieved_context = state["retrieved_context"]

    context_text = ""
    for item in retrieved_context:
        context_text += f"""
        Similar Issue:
        {item.get('issue', '')}

        Resolution:
        {item.get('resolution', '')}
        """

    human_prompt = f"""Customer Ticket:
    {ticket}

    Historical Similar Cases:
    {context_text}"""

    try:
        messages = [
            SystemMessage(content=DRAFT_SYSTEM_PROMPT),
            HumanMessage(content=human_prompt)
        ]

        response = await llm.ainvoke(messages)
        state["draft_reply"] = response.content
        state["logs"].append("Draft response generated using production agent guidelines.")
    except Exception as e:
        # Fallback simplistic prompt in case of failures
        state["logs"].append(f"Draft LLM invocation failed, running fallback. Error: {str(e)}")
        fallback_prompt = f"Ticket: {ticket}\nContext: {context_text}\nDraft a professional response:"
        response = await llm.ainvoke(fallback_prompt)
        state["draft_reply"] = response.content

    duration = time.perf_counter() - start_time
    state["timings"]["draft"] = max(round(duration, 2), 0.01)

    return state