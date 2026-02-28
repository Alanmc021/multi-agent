"""Rotas da API."""

import shutil
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel

from app.core.orchestrator import Orchestrator

DOCUMENTS_DIR = Path("/app/documents")
ALLOWED_EXTENSIONS = {".txt", ".md", ".pdf"}

router = APIRouter(prefix="/api", tags=["api"])

# Instância única do Orchestrator — inicializada no startup da aplicação.
# Evita recriar conexões com OpenAI e Qdrant a cada requisição.
_orchestrator: Orchestrator | None = None


def init_orchestrator() -> None:
    """Inicializa o Orchestrator singleton. Chamado uma vez no startup."""
    global _orchestrator
    _orchestrator = Orchestrator()


def get_orchestrator() -> Orchestrator:
    """Retorna o Orchestrator singleton. Cria um fallback se ainda não inicializado."""
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = Orchestrator()
    return _orchestrator


class AskRequest(BaseModel):
    """Request para pergunta."""

    question: str


class AskResponse(BaseModel):
    """Response da pergunta."""

    answer: str
    blocked: bool
    source: str


class LoadDocsRequest(BaseModel):
    """Request para carregar documentos."""

    path: str


@router.post("/ask", response_model=AskResponse)
async def ask(request: AskRequest):
    """Envia uma pergunta e recebe a resposta."""
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Pergunta não pode ser vazia")

    result = get_orchestrator().ask(request.question)
    return AskResponse(**result)


@router.post("/docs/load")
async def load_docs(request: LoadDocsRequest):
    """
    Carrega documentos de um diretório ou arquivo.
    Path relativo à pasta 'documents'. Ex: "" ou "." para carregar tudo.
    """
    base = Path("/app/documents")
    path_str = request.path.strip() or "."
    target = (base / path_str).resolve()

    if not target.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Caminho não encontrado: {request.path}",
        )

    # Garantir que está dentro de base
    try:
        target.relative_to(base)
    except ValueError:
        raise HTTPException(status_code=400, detail="Path inválido")

    from app.libs.rag import RAGService

    rag = RAGService()
    count = rag.load_and_index(target)
    return {"indexed": count, "path": request.path or "."}


@router.post("/docs/upload")
async def upload_doc(file: UploadFile = File(...)):
    """
    Recebe um arquivo (.txt, .md ou .pdf), salva em /app/documents/ e
    indexa imediatamente no Qdrant usando o parser adequado para cada formato.
    """
    suffix = Path(file.filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Formato não suportado: '{suffix}'. Use .txt, .md ou .pdf",
        )

    DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)
    dest = DOCUMENTS_DIR / file.filename

    # Salva o arquivo no disco
    with dest.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    # Indexa usando o RAGService (parser é escolhido automaticamente pela extensão)
    from app.libs.rag import RAGService

    try:
        rag = RAGService()
        count = rag.load_and_index(dest)
    except Exception as e:
        dest.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail=f"Erro ao indexar: {str(e)}")

    return {
        "filename": file.filename,
        "indexed": count,
        "message": f"'{file.filename}' indexado com sucesso ({count} chunks)",
    }
