"""
Multi-Agent AI Platform - API REST
"""
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router, init_orchestrator
from app.libs.rag import RAGService

app = FastAPI(
    title="Multi-Agent AI Platform",
    description="Assistente Inteligente com compliance, RAG e agentes especializados",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.on_event("startup")
async def startup() -> None:
    """
    Inicializa o Orchestrator uma única vez (singleton) e indexa os documentos.
    O Orchestrator fica em memória e é reutilizado em todas as requisições.
    """
    # 1. Cria o Orchestrator singleton — carrega OpenAI, RAG e CrewAI uma só vez
    init_orchestrator()

    # 2. Indexa documentos no Qdrant ao subir
    base = Path("/app/documents")
    if not base.exists():
        return

    try:
        rag = RAGService()
        rag.load_and_index(base)
    except Exception:
        # Evita quebrar o startup por falha no index.
        return


@app.get("/")
async def root():
    """Health check."""
    return {"status": "ok", "message": "Multi-Agent API running"}


@app.get("/health")
async def health():
    """Health check para Docker e load balancers."""
    return {"status": "healthy"}
