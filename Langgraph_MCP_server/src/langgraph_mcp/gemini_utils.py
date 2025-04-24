"""Utility functions for Gemini models integration with LangGraph and MCP."""

import os
from typing import Optional
from contextlib import contextmanager
from typing import Generator

from langchain_core.embeddings import Embeddings
from langchain_core.runnables import RunnableConfig
from langchain_core.vectorstores import VectorStoreRetriever
from langchain_core.language_models import BaseChatModel

from langgraph_mcp.gemini_configuration import GeminiConfiguration

def load_gemini_chat_model(fully_specified_name: str) -> BaseChatModel:
    """Load a Gemini chat model from a fully specified name.

    Args:
        fully_specified_name (str): String in the format 'provider/model'.
        
    Returns:
        BaseChatModel: A Gemini chat model instance
    """
    if "/" in fully_specified_name:
        provider, model = fully_specified_name.split("/", maxsplit=1)
    else:
        provider = ""
        model = fully_specified_name
        
    if provider.lower() == "google":
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(model=model)
    else:
        # Fallback to other providers if needed
        from langchain.chat_models import init_chat_model
        return init_chat_model(model, model_provider=provider)


def make_embedding_model(model: str) -> Embeddings:
    """Connect to the configured text encoder for embeddings."""
    provider, model_name = model.split("/", maxsplit=1)
    
    if provider.lower() == "google":
        from langchain_google_genai import GoogleGenerativeAIEmbeddings
        return GoogleGenerativeAIEmbeddings(model=model_name)
    elif provider.lower() == "openai":
        from langchain_openai import OpenAIEmbeddings
        return OpenAIEmbeddings(model=model_name)
    else:
        raise ValueError(f"Unsupported embedding provider: {provider}")


@contextmanager
def make_chroma_retriever(configuration, embedding_model):
    """Versión más robusta del creador de retrievers Chroma."""
    collection_name = "mcp_routing"
    persist_directory = "./chroma_db"
    
    # Crear directorio si no existe
    os.makedirs(persist_directory, exist_ok=True)
    
    try:
        # Intenta importar desde langchain-chroma (nueva versión)
        from langchain_chroma import Chroma
    except ImportError:
        # Fallback a la versión anterior
        from langchain_community.vectorstores import Chroma
    
    try:
        # Primero intentamos obtener la colección existente
        vstore = Chroma(
            collection_name=collection_name,
            embedding_function=embedding_model,
            persist_directory=persist_directory,
        )
        
        # Verificar si está vacío
        count = vstore._collection.count()
        if count == 0:
            print("Inicializando ChromaDB con documento placeholder")
            vstore.add_texts(
                ["Documento placeholder. Ejecuta el constructor de router para poblar la colección."],
                metadatas=[{"id": "placeholder"}],
            )
    except Exception as e:
        print(f"Error al inicializar ChromaDB: {e}")
        print("Reinicializando la colección desde cero...")
        
        # Si hay error, recreamos desde cero
        try:
            # Crear una nueva colección
            vstore = Chroma.from_texts(
                texts=["Documento placeholder. Ejecuta el constructor de router para poblar la colección."],
                metadatas=[{"id": "placeholder"}],
                embedding=embedding_model,
                collection_name=collection_name,
                persist_directory=persist_directory,
            )
        except Exception as inner_e:
            print(f"Error crítico al reinicializar ChromaDB: {inner_e}")
            raise
    
    # Crear y devolver el retriever
    retriever = vstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 5},
    )
    
    try:
        yield retriever
    finally:
        # No es necesario persist() en versiones nuevas
        pass

@contextmanager
def make_retriever(
    config: RunnableConfig,
) -> Generator[VectorStoreRetriever, None, None]:
    """Create a retriever for the agent, based on the current configuration."""
    configuration = GeminiConfiguration.from_runnable_config(config)
    embedding_model = make_embedding_model(configuration.embedding_model)
    
    # Use ChromaDB for vector storage
    with make_chroma_retriever(configuration, embedding_model) as retriever:
        yield retriever