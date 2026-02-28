"""Serviço RAG - carrega documentos, gera embeddings, armazena e recupera contexto."""

import os
from pathlib import Path

from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import (
    DirectoryLoader,
    TextLoader,
    PyPDFLoader,
)

from app.prompts.rag import RAG_SYSTEM, RAG_USER


class RAGService:
    """Pipeline RAG: loader → chunking → embeddings → Qdrant → retrieval."""

    COLLECTION_NAME = "documents"
    CHUNK_SIZE = 512
    CHUNK_OVERLAP = 50
    TOP_K = 5

    def __init__(
        self,
        host: str | None = None,
        port: int | None = None,
    ):
        self._host = host or os.getenv("QDRANT_HOST", "localhost")
        self._port = int(port or os.getenv("QDRANT_PORT", "6333"))
        self._embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

    def _get_loaders(self, docs_path: str | Path) -> list:
        """Retorna loaders para txt, md e pdf."""
        path = Path(docs_path)
        loaders = []

        if path.is_file():
            suffix = path.suffix.lower()
            if suffix in (".txt", ".md"):
                loaders.append(TextLoader(str(path), encoding="utf-8"))
            elif suffix == ".pdf":
                loaders.append(PyPDFLoader(str(path)))
        else:
            for ext in ("**/*.txt", "**/*.md"):
                loaders.append(
                    DirectoryLoader(
                        str(path),
                        glob=ext,
                        loader_cls=TextLoader,
                        loader_kwargs={"encoding": "utf-8"},
                    )
                )
            loaders.append(
                DirectoryLoader(
                    str(path),
                    glob="**/*.pdf",
                    loader_cls=PyPDFLoader,
                )
            )

        return loaders

    def load_and_index(self, docs_path: str | Path) -> int:
        """
        Carrega documentos, faz chunking, gera embeddings e indexa no Qdrant.

        Returns:
            int: Número de chunks indexados
        """
        documents = []
        for loader in self._get_loaders(docs_path):
            try:
                documents.extend(loader.load())
            except Exception:
                continue

        if not documents:
            return 0

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.CHUNK_SIZE,
            chunk_overlap=self.CHUNK_OVERLAP,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""],
        )
        chunks = splitter.split_documents(documents)

        url = f"http://{self._host}:{self._port}"

        QdrantVectorStore.from_documents(
            documents=chunks,
            embedding=self._embeddings,
            url=url,
            prefer_grpc=False,
            collection_name=self.COLLECTION_NAME,
        )

        return len(chunks)

    def retrieve(self, question: str, top_k: int | None = None) -> str:
        """
        Busca contexto relevante no Qdrant.

        Returns:
            str: Contexto concatenado dos chunks mais relevantes
        """
        k = top_k or self.TOP_K
        url = f"http://{self._host}:{self._port}"
        vector_store = QdrantVectorStore.from_existing_collection(
            embedding=self._embeddings,
            url=url,
            prefer_grpc=False,
            collection_name=self.COLLECTION_NAME,
        )
        docs = vector_store.similarity_search(question, k=k)
        return "\n\n---\n\n".join(doc.page_content for doc in docs)

    def query(self, question: str, context: str, client=None) -> str:
        """
        Gera resposta usando o contexto recuperado.
        """
        from openai import OpenAI

        openai_client = client or OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        system = f"{RAG_SYSTEM}\n\n{context}"
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": RAG_USER.format(question=question)},
            ],
            temperature=0.3,
        )
        return response.choices[0].message.content
