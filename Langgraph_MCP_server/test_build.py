import asyncio
import json
import os
from langchain_core.documents import Document
from langchain_core.runnables import RunnableConfig
from langgraph.graph import StateGraph

from langgraph_mcp.gemini_configuration import GeminiConfiguration
from langgraph_mcp import mcp_wrapper as mcp
from langgraph_mcp.gemini_utils import make_retriever
from langgraph_mcp.state import BuilderState


async def build_router(state: BuilderState, *, config: RunnableConfig):
    """
    Build the router by gathering routing descriptions from MCP servers and storing them in the retriever.
    """
    status = "failure"
    configuration = GeminiConfiguration.from_runnable_config(config)
    
    # Get MCP server config or return early if invalid
    if not hasattr(configuration, 'mcp_server_config') or not configuration.mcp_server_config:
        print("Error: No MCP server configuration found")
        return {"status": status}
    
    mcp_servers = configuration.mcp_server_config.get("mcpServers", {})
    if not mcp_servers:
        print("Error: No servers defined in MCP configuration")
        return {"status": status}

    try:
        # Gather routing descriptions from MCP servers
        print("Gathering routing descriptions from MCP servers")
        routing_descriptions = await asyncio.gather(
            *[
                mcp.apply(server_name, server_config, mcp.RoutingDescription())
                for server_name, server_config in mcp_servers.items()
            ]
        )

        # Create documents from the descriptions
        documents = [
            Document(page_content=description, metadata={"id": server_name})
            for server_name, description in routing_descriptions
        ]

        if not documents:
            print("Warning: No routing documents created")
            return {"status": status}

        # Store the documents in the retriever
        with make_retriever(config) as retriever:
            vectorstore = retriever.vectorstore
            
            # Clear existing documents
            try:
                collection = vectorstore._collection
                collection.delete(where={})
                print("Cleared existing collection")
            except Exception as e:
                print(f"Note: Could not clear existing collection: {e}")
            
            # Add the new documents
            texts = [doc.page_content for doc in documents]
            metadatas = [doc.metadata for doc in documents]
            vectorstore.add_texts(texts, metadatas=metadatas)
            print(f"Added {len(documents)} documents to vectorstore")
            
            # Persist changes
            if hasattr(vectorstore, "persist"):
                vectorstore.persist()
                print("Vector store persisted")

        status = "success"
    except Exception as e:
        print(f"Exception in build_router: {e}")
        import traceback
        traceback.print_exc()

    return {"status": status}


# Build the graph
builder = StateGraph(state_schema=BuilderState, config_schema=GeminiConfiguration)
builder.add_node(build_router)
builder.add_edge("__start__", "build_router")
graph = builder.compile()
graph.name = "GeminiBuildRouterGraph"


async def main():
    """
    Main function to test the LangGraph individually.
    """
    print("Starting LangGraph test...")

    # Sample MCP server configuration
    mcp_server_config = {
        "mcpServers": {
            "github": {
                "command": "npx",
                "description": "GitHub operations",  # Añadimos description que es necesaria
                "args": [
                    "-y",
                    "@modelcontextprotocol/server-github"
                ]
            },
            "filesystem": {
                "command": "npx",
                "description": "Filesystem operations",  # Añadimos description que es necesaria
                "args": [
                    "-y",
                    "@modelcontextprotocol/server-filesystem",
                    "C:/Users/Lap_Sabes/Documents/",
                    "C:/Users/Lap_Sabes/Documents/EjerciciosLanggraph"
                ]
            }
        }
    }

    # Initialize the initial state
    initial_state = BuilderState()

    try:
        # Problema identificado: from_runnable_config está tomando elementos directamente de configurable
        # No está procesando el valor anidado "gemini_config"
        config = RunnableConfig(configurable={"mcp_server_config": mcp_server_config})
        
        print("Configuración a utilizar:")
        print(json.dumps(config, default=str, indent=2))
        
        # Ejecutar el grafo
        print("Running the graph...")
        result = await graph.ainvoke(initial_state, config=config)
        print("Graph execution completed.")
        print("Result:", json.dumps(result, indent=2))
    except Exception as e:
        print(f"Error running the graph: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())