import asyncio

from services.llm_service import llm

async def main():

    response = await llm.ainvoke(
        "Tell me a joke in hindi"
    )

    print(response.content)

asyncio.run(main())