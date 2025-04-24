"""Manage the configuration of retrievers using Google embeddings."""

import os
from contextlib import contextmanager
from typing import Generator

from langchain_core.embeddings import Embeddings
from langchain_core.runnables import RunnableConfig
from langchain_core.vectorstores import VectorStoreRetriever

from gemini_configuration import GeminiConfiguration

## Encoder constructors

def make_gemini_text_encoder(model: str) -> Embeddings:
    """Connect to the configured text encoder for Gemini."""
    provider, model = model.split("/", maxsplit=1)
    if provider.lower() == "google":
        from langchain_google_genai import GoogleGenerativeAIEmbeddings
        return GoogleGenerativeAIEmbeddings(model=model)
    else:
        raise ValueError(f"Unsupported embedding provider for Gemini: {provider}")


## Retriever constructors
@contextmanager
def make_milvus_retriever(
    configuration: GeminiConfiguration, embedding_model: Embeddings
) -> Generator[VectorStoreRetriever, None, None]:
    """Configure this agent to use milvus lite file based uri to store the vector index."""
    from langchain_milvus.vectorstores import Milvus

    uri = os.environ["MILVUS_DB"]
    vstore = Milvus (
        embedding_function=embedding_model,
        connection_args={"uri": uri},
        index_params=None if uri.startswith("http") else {"index_type": "FLAT", "metric_type": "L2", "params": {}}
    )
    yield vstore.as_retriever()

@contextmanager
def make_gemini_retriever(
    config: RunnableConfig,
) -> Generator[VectorStoreRetriever, None, None]:
    """Create a retriever for the agent using Gemini embeddings."""
    configuration = GeminiConfiguration.from_runnable_config(config)
    embedding_model = make_gemini_text_encoder(configuration.embedding_model)
    match configuration.retriever_provider:
        case "milvus":
            with make_milvus_retriever(configuration, embedding_model) as retriever:
                yield retriever
        case _:
            raise ValueError(
                f"Unrecognized retriever_provider: {configuration.retriever_provider}"
            )