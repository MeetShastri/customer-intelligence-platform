import sys
import os

# Add the parent directory (ai-service) to sys.path to allow importing from controllers, etc.
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mcp.server.fastmcp import FastMCP
from mcp_server.tools.pinecone_search_tool import (
    pinecone_search_tool
)

mcp = FastMCP("customer-support-tools")

@mcp.tool()
async def search_support_tickets(query: str):
    return await pinecone_search_tool(query)

if __name__ == "__main__":
    mcp.run()