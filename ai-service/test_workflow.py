import asyncio

from graph.workflow_graph import graph

async def main():

    result = await graph.ainvoke({
        "ticket": "Customer unable to login",
        "urgency": "",
        "retrieved_context": [],
        "draft_reply": "",
        "decision": "",
        "logs": []
    })

    print(result)

asyncio.run(main())