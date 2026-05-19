from typing import TypedDict, List

class GraphState(TypedDict):

    ticket: str

    urgency: str

    retrieved_context: List

    draft_reply: str

    decision: str

    logs: List[str]