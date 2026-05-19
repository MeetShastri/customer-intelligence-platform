from langgraph.graph import StateGraph
from graph.state import GraphState

from agents.classify_agent import classify_agent
from agents.retrieval_agent import retrieval_agent

workflow = StateGraph(GraphState)

workflow.add_node(
    "classify_agent",
    classify_agent
)

workflow.add_node(
    "retrieval_agent",
    retrieval_agent
)

workflow.set_entry_point("classify_agent")

workflow.add_edge(
    "classify_agent",
    "retrieval_agent"
)

workflow.set_finish_point(
    "retrieval_agent"
)

graph = workflow.compile()