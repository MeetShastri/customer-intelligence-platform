import time
import asyncio
import json
from graph.state import GraphState
from langchain_core.messages import SystemMessage, HumanMessage
from services.llm_service import llm

CLASSIFY_SYSTEM_PROMPT = """You are the Classification Agent of an enterprise customer support intelligence platform.
Your primary objective is to analyze the incoming customer support ticket and output a structured JSON response categorizing the ticket and determining its urgency.

Classify urgency based on these strict guidelines:
- HIGH: Issues involving critical system outages, security breaches, password/credential compromises, fraudulent activities, GDPR/privacy data requests (deletion, export), payment failures, double billing, or unauthorized transactions. These require immediate, high-priority intervention.
- MEDIUM: Technical bugs affecting non-critical features, minor functionality issues, account access problems (e.g., login lockouts without suspected compromise), invoice copy requests, or subscription cancellation requests. These are important but do not pose immediate risk to system stability or customer data security.
- LOW: General inquiries, feature requests, minor cosmetic UI bugs, feedback, or polite greetings.

Categorize the ticket into one of the following departments:
- "Billing & Payments": Questions about pricing, invoices, subscription changes, refunds, payment failures, or charges.
- "Account Security": Issues regarding logins, lockouts, password resets, potential compromises, or permission settings.
- "Technical Support": Reports of bugs, errors, system sluggishness, service crashes, API failures, or usage help.
- "General Inquiry": High-level product questions, sales requests, feedback, or general greetings.

You must output a valid JSON object matching the schema below. Do not include any markdown fences (like ```json), explanation, or extra characters.

Response Schema:
{
  "urgency": "HIGH" | "MEDIUM" | "LOW",
  "category": "Billing & Payments" | "Account Security" | "Technical Support" | "General Inquiry",
  "reasoning": "A highly descriptive, step-by-step reasoning explaining how you analyzed the ticket text, extracted keywords/intent, and matched it to the urgency and department classification."
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