import time
import asyncio
import json
from graph.state import GraphState
from langchain_core.messages import SystemMessage, HumanMessage
from services.llm_service import llm

CLASSIFY_SYSTEM_PROMPT = """You are the Classification Agent of an enterprise customer support intelligence platform.
Your primary objective is to analyze the incoming customer support ticket and output a structured JSON response categorizing the ticket and determining its urgency.

Classify urgency based on these strict guidelines:
- HIGH: Issues involving critical system outages, financial/billing anomalies (unauthorized charges, failed payment flows, double billing), active security incidents, suspected fraud, account compromise, or GDPR/compliance requests (data deletion/export).
- MEDIUM: Technical bugs affecting non-critical features, account access issues (password resets, login lockouts without compromise), invoice copy requests, or subscription cancellation requests.
- LOW: General inquiries, feature requests, minor UI/cosmetic bugs, feedback, or greetings.

Categorize the ticket into one of:
- "Billing & Payments"
- "Account Security"
- "Technical Support"
- "General Inquiry"

You must output a valid JSON object matching the schema below. Do not include any markdown fences (like ```json), explanation, or extra characters.

Response Schema:
{
  "urgency": "HIGH" | "MEDIUM" | "LOW",
  "category": "Billing & Payments" | "Account Security" | "Technical Support" | "General Inquiry",
  "reasoning": "A concise (1-2 sentence) explanation of the classification."
}"""

async def classify_agent(state: GraphState):
    start_time = time.perf_counter()
    await asyncio.sleep(1.5)
    if "timings" not in state or state["timings"] is None:
        state["timings"] = {}

    ticket = state["ticket"]

    try:
        messages = [
            SystemMessage(content=CLASSIFY_SYSTEM_PROMPT),
            HumanMessage(content=f"Ticket: {ticket}")
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
        urgency = data.get("urgency", "LOW").strip().upper()
        if urgency not in ["HIGH", "MEDIUM", "LOW"]:
            urgency = "LOW"
            
        reasoning = data.get("reasoning", "No classification reasoning provided.")
        category = data.get("category", "General Inquiry")
        
        state["urgency"] = urgency
        state["logs"].append(f"Ticket classified as {urgency} ({category}). Reasoning: {reasoning}")
        
    except Exception as e:
        # Fallback keyword logic in case of LLM/JSON failure
        urgency_keywords = ["fraud", "payment failed", "billing issue", "charged twice"]
        urgency = "LOW"
        for keyword in urgency_keywords:
            if keyword.lower() in ticket.lower():
                urgency = "HIGH"
                
        state["urgency"] = urgency
        state["logs"].append(
            f"Ticket classified as {urgency} (Fallback). Error: {str(e)}"
        )

    duration = time.perf_counter() - start_time
    state["timings"]["classify"] = max(round(duration, 2), 0.01)

    return state