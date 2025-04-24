import json
import os
from datetime import datetime, timezone
from langchain_core.documents import Document
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableConfig
from langgraph.graph import StateGraph, START, END
from pydantic import BaseModel
from typing import cast, Dict, Any, Optional

from langgraph_mcp.gemini_configuration import GeminiConfiguration
from langgraph_mcp import mcp_wrapper as mcp
from langgraph_mcp.gemini_utils import make_retriever, load_gemini_chat_model
from langgraph_mcp.state import InputState, State
from langgraph_mcp.utils.utils import get_message_text, format_docs


NOTHING_RELEVANT = "No MCP server with an appropriate tool to address current context"
IDK_RESPONSE = "No appropriate tool available."
OTHER_SERVERS_MORE_RELEVANT = "Other servers are more relevant."
AMBIGUITY_PREFIX = "Ambiguity:"

class SearchQuery(BaseModel):
    """Search the indexed documents for a query."""
    query: str


async def generate_routing_query(state: State, *, config: RunnableConfig) -> dict[str, list[str]]:
    """Generate a routing query based on the current state and configuration."""
    messages = state.messages
    if len(messages) == 1:
        # First user question, use input directly
        human_input = get_message_text(messages[-1])
        return {"queries": [human_input]}
    else:
        # Use LLM to generate refined query for subsequent messages
        configuration = GeminiConfiguration.from_runnable_config(config)
        prompt = ChatPromptTemplate.from_messages([
            ("system", configuration.routing_query_system_prompt),
            ("placeholder", "{messages}"),
        ])
        model = load_gemini_chat_model(
            configuration.routing_query_model
        ).with_structured_output(SearchQuery)

        message_value = await prompt.ainvoke({
            "messages": state.messages,
            "queries": "\n- ".join(state.queries),
            "system_time": datetime.now(tz=timezone.utc).isoformat(),
        }, config)
        
        generated = cast(SearchQuery, await model.ainvoke(message_value, config))
        return {"queries": [generated.query]}


async def retrieve(state: State, *, config: RunnableConfig) -> dict[str, list[Document]]:
    """Retrieve documents based on the latest query in the state."""
    with make_retriever(config) as retriever:
        response = await retriever.ainvoke(state.queries[-1], config)
        return {"retrieved_docs": response}


async def route(state: State, *, config: RunnableConfig) -> dict[str, list[BaseMessage]]:
    """Determine which MCP server should handle the request."""
    configuration = GeminiConfiguration.from_runnable_config(config)
    prompt = ChatPromptTemplate.from_messages([
        ("system", configuration.routing_response_system_prompt),
        ("placeholder", "{messages}"),
    ])
    model = load_gemini_chat_model(configuration.routing_response_model)

    retrieved_docs = format_docs(state.retrieved_docs)
    message_value = await prompt.ainvoke({
        "messages": state.messages,
        "retrieved_docs": retrieved_docs,
        "nothing_relevant": NOTHING_RELEVANT,
        "ambiguity_prefix": AMBIGUITY_PREFIX,
        "system_time": datetime.now(tz=timezone.utc).isoformat(),
    }, config)

    response = await model.ainvoke(message_value, config)

    # Handle special responses
    if response.content == NOTHING_RELEVANT or response.content.startswith(AMBIGUITY_PREFIX):
        return {"messages": [response]}

    # Extract server name from response
    mcp_server = response.content.split(":")[1].strip() if ":" in response.content else response.content
    
    # Verify it's a valid server name (not a longer text)
    if len(mcp_server.split(" ")) > 1:
        return {"messages": [response]}

    return {"current_mcp_server": mcp_server}


def decide_mcp_or_not(state: State) -> str:
    """Decide whether to route to MCP server processing or not."""
    return "mcp_orchestrator" if state.current_mcp_server else END


async def mcp_orchestrator(state: State, *, config: RunnableConfig) -> dict[str, list[BaseMessage]]:
    """Orchestrate MCP server processing."""
    # Get server name and safe server config
    server_name = state.current_mcp_server
    configuration = GeminiConfiguration.from_runnable_config(config)
    mcp_config = getattr(configuration, "mcp_server_config", None) 
    
    
    mcp_servers = mcp_config.get("mcpServers", {})
    
    # Check if server exists
    if server_name not in mcp_servers:
        return {
            "messages": [AIMessage(content=f"I don't have information about the '{server_name}' server.")],
            "current_mcp_server": None
        }
    
    server_config = mcp_servers[server_name]

    # Get other server descriptions
    server_descriptions = []
    for name, config in mcp_servers.items():
        desc = config.get("description", f"Server with unknown capabilities")
        server_descriptions.append((name, desc))
        
    other_servers_list = "\n".join([
        f"- {name}: {desc}" for name, desc in server_descriptions if name != server_name
    ])

    # Get tools from MCP server
    tools = []
    args = server_config["args"][1:] if server_config["args"][0] == "-y" else server_config["args"]
    

    # Prepare the LLM
    prompt = ChatPromptTemplate.from_messages([
        ("system", configuration.mcp_orchestrator_system_prompt),
        ("placeholder", "{messages}"),
    ])
    model = load_gemini_chat_model(configuration.mcp_orchestrator_model)
    
    message_value = await prompt.ainvoke({
        "messages": state.messages,
        "idk_response": IDK_RESPONSE,
        "other_servers": other_servers_list,
        "other_servers_response": OTHER_SERVERS_MORE_RELEVANT,
        "system_time": datetime.now(tz=timezone.utc).isoformat(),
    }, config)

    # Bind tools to model and invoke
    response = await model.bind_tools(tools).ainvoke(message_value, config)

    # Check for tool calls (for OpenAPI tools)
    current_tool = None
    if len(args) > 0 and args[0] == "openapi-mcp-server@1.1.0":
        if response.__class__ == AIMessage and response.tool_calls:
            current_tool = next(
                (tool for tool in tools if tool["name"] == response.tool_calls[0].get("name")),
                None
            )

    # Handle special responses
    if (response.content == IDK_RESPONSE or response.content == OTHER_SERVERS_MORE_RELEVANT):
        if state.messages[-1].__class__ != ToolMessage:
            return {"current_mcp_server": None}

    return {"messages": [response], "current_tool": current_tool}


async def refine_tool_call(state: State, *, config: RunnableConfig) -> dict[str, list[BaseMessage]]:
    """Refine tool calls."""
    if state.current_tool is None:
        return {"messages": state.messages, "current_tool": None}

    # Get configuration
    server_name = state.current_mcp_server
    configuration = GeminiConfiguration.from_runnable_config(config)
    mcp_config = getattr(configuration, "mcp_server_config", None) 
    mcp_servers = mcp_config.get("mcpServers", {})
    server_config = mcp_servers.get(server_name, {})

    # Get tool info and refine call
    tool_info = state.current_tool.get("metadata", {}).get("tool_info", {})
    prompt = ChatPromptTemplate.from_messages([
        ("system", configuration.tool_refiner_prompt),
        ("placeholder", "{messages}"),
    ])
    model = load_gemini_chat_model(configuration.tool_refiner_model)
    
    message_value = await prompt.ainvoke({
        "messages": state.messages[:-1],
        "tool_info": str(tool_info),
        "system_time": datetime.now(tz=timezone.utc).isoformat(),
    }, config)

    # Save last message ID
    last_msg_id = state.messages[-1].id
    
    # Bind tool and generate response
    response = await model.bind_tools([state.current_tool]).ainvoke(message_value, config)
    response.id = last_msg_id

    return {"messages": [response], "current_tool": None}


async def mcp_tool_call(state: State, *, config: RunnableConfig) -> dict[str, list[BaseMessage]]:
    """Execute MCP server tool call."""
    # Get configuration for tool execution
    server_name = state.current_mcp_server
    configuration = GeminiConfiguration.from_runnable_config(config)
    mcp_config = getattr(configuration, "mcp_server_config", None)
    mcp_servers = mcp_config.get("mcpServers", {})
    server_config = mcp_servers.get(server_name, {})

    # Execute the tool
    tool_call = state.messages[-1].tool_calls[0]
    try:
        tool_output = await mcp.apply(
            server_name,
            server_config,
            mcp.RunTool(tool_call["name"], **tool_call["args"]),
        )
    except Exception as e:
        tool_output = f"Error executing tool: {e}"
        
    return {"messages": [ToolMessage(content=tool_output, tool_call_id=tool_call["id"])]}


def route_tools(state: State) -> str:
    """Determine routing path based on message type."""
    last_message = state.messages[-1]
    
    if last_message.__class__ == HumanMessage:
        return "generate_routing_query"
    if last_message.model_dump().get("tool_calls"):
        return "refine_tool_call"
    if last_message.__class__ == ToolMessage:
        return "generate_routing_query"
    return END


def decide_subgraph(state: State) -> str:
    """Choose path based on state."""
    return "mcp_orchestrator" if state.current_mcp_server else "generate_routing_query"


# Build the graph
builder = StateGraph(State, input=InputState, config_schema=GeminiConfiguration)

# Add nodes
builder.add_node(generate_routing_query)
builder.add_node(retrieve)
builder.add_node(route)
builder.add_node(mcp_orchestrator)
builder.add_node(refine_tool_call)
builder.add_node(mcp_tool_call)

# Connect nodes
builder.add_conditional_edges(
    START,
    decide_subgraph,
    {
        "generate_routing_query": "generate_routing_query",
        "mcp_orchestrator": "mcp_orchestrator",
    },
)
builder.add_edge("generate_routing_query", "retrieve")
builder.add_edge("retrieve", "route")
builder.add_conditional_edges(
    "route",
    decide_mcp_or_not,
    {
        "mcp_orchestrator": "mcp_orchestrator",
        END: END,
    },
)
builder.add_conditional_edges(
    "mcp_orchestrator",
    route_tools,
    {
        "mcp_tool_call": "mcp_tool_call",
        "generate_routing_query": "generate_routing_query",
        "refine_tool_call": "refine_tool_call",
        END: END,
    },
)
builder.add_edge("refine_tool_call", "mcp_tool_call")
builder.add_edge("mcp_tool_call", "mcp_orchestrator")

# Compile graph
graph = builder.compile()
graph.name = "AssistantGraph"