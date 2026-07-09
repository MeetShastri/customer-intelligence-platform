import time
import asyncio
import json
from graph.state import GraphState
from langchain_core.messages import SystemMessage, HumanMessage
from services.llm_service import llm

SUPERVISOR_SYSTEM_PROMPT = """You are the Routing Supervisor Agent of an enterprise customer support platform.
Your job is to audit the generated draft reply against the customer's ticket, its urgency, and retrieved historical resolutions, and select the appropriate next routing action.

Routing Decisions:
- AUTO_SEND: Choose this ONLY if all of the following conditions are met:
  1. The ticket urgency is LOW.
  2. The retrieved context contains at least one highly relevant historical case that matches the customer's issue.
  3. The draft reply is complete, correct, and fully addresses the issue based on that historical case.
- HUMAN_REVIEW: Choose this if any of the following conditions are met:
  1. The ticket urgency is HIGH or MEDIUM (e.g., billing anomalies, active lockouts, outages).
  2. The retrieved context is empty, irrelevant, or insufficient to solve the ticket.
  3. The draft reply requires policy verification, manual intervention, or human empathy validation.

You must output a valid JSON object matching the schema below. Do not include markdown fences (like ```json), explanation, or extra characters.

Response Schema:
{
  "decision": "AUTO_SEND" | "HUMAN_REVIEW",
  "reasoning": "A highly descriptive, step-by-step reasoning explaining why this routing decision was chosen, auditing the draft reply against the original ticket and the retrieved historical contexts."
}"""

async def supervisor_agent(state: GraphState):
    start_time = time.perf_counter()
    await asyncio.sleep(1.5)
    if "timings" not in state or state["timings"] is None:
        state["timings"] = {}

    ticket = state["ticket"]
    urgency = state["urgency"]
    retrieved_context = state["retrieved_context"]
    draft_reply = state["draft_reply"]

    context_text = ""
    for idx, item in enumerate(retrieved_context):
        context_text += f"\nCase {idx+1}: Issue: {item.get('issue', '')} | Resolution: {item.get('resolution', '')}"

    human_prompt = f"""Ticket: {ticket}
Urgency Classification: {urgency}
Retrieved Historical Cases: {len(retrieved_context)} cases
Context details: {context_text}
Generated Draft Reply: {draft_reply}"""

    decision = "HUMAN_REVIEW"
    try:
        messages = [
            SystemMessage(content=SUPERVISOR_SYSTEM_PROMPT),
            HumanMessage(content=human_prompt)
        ]

        response = await llm.ainvoke(messages)
        content = response.content.strip()

        # Clean markdown code block formatting if returned by the LLM
        if content.startswith("```"):
            lines = content.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            content = "\n".join(lines).strip()

        data = json.loads(content)
        decision_val = data.get("decision", "HUMAN_REVIEW").strip().upper()
        if decision_val in ["AUTO_SEND", "HUMAN_REVIEW"]:
            decision = decision_val
        reasoning = data.get("reasoning", "No supervisor reasoning provided.")
        state["logs"].append(f"Supervisor Decision: {decision}. Reasoning: {reasoning}")
    except Exception as e:
        # Fallback routing logic
        if urgency == "LOW" and len(retrieved_context) > 0:
            decision = "AUTO_SEND"
        state["logs"].append(f"Supervisor routing evaluated via fallback. Error: {str(e)}")

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