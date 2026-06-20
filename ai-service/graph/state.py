from typing import TypedDict, List, Dict

class GraphState(TypedDict):

    ticket: str

    urgency: str

    retrieved_context: List

    draft_reply: str

    decision: str

    logs: List[str]

    timings: Dict[str, float]