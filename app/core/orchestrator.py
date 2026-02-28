"""Orquestrador - fluxo principal: compliance → router → executor → resposta."""

import os

from openai import OpenAI

from app.libs.compliance import ComplianceService
from app.libs.rag import RAGService
from app.libs.agents import AgentsService
from app.core.router import route


class Orchestrator:
    """Orquestra o fluxo completo de perguntas e respostas."""

    def __init__(self):
        self._openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self._compliance = ComplianceService(client=self._openai)
        self._rag = RAGService()
        self._agents = AgentsService()

    def ask(self, question: str) -> dict:
        """
        Processa a pergunta e retorna a resposta.

        Returns:
            dict: {"answer": str, "blocked": bool, "source": "compliance"|"direct"|"rag"|"agent"}
        """
        # 1. Compliance
        allowed, block_message = self._compliance.check(question)
        if not allowed:
            return {
                "answer": block_message,
                "blocked": True,
                "source": "compliance",
            }

        # 2. Router
        strategy = route(question, client=self._openai)

        # 3. Executor
        if strategy == "DIRETO":
            answer = self._answer_direct(question)
            return {"answer": answer, "blocked": False, "source": "direct"}

        if strategy == "RAG":
            context = self._rag.retrieve(question)
            if context:
                answer = self._rag.query(question, context, client=self._openai)
            else:
                answer = self._answer_direct(question)
            return {"answer": answer, "blocked": False, "source": "rag"}

        # AGENTE
        context = self._rag.retrieve(question)
        answer = self._agents.run(question, context=context or None)
        return {"answer": answer, "blocked": False, "source": "agent"}

    def _answer_direct(self, question: str) -> str:
        """Resposta direta via LLM."""
        response = self._openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Você é um assistente útil. Responda de forma clara e objetiva. "
                    "Não invente informações. Se não souber, diga que não sabe.",
                },
                {"role": "user", "content": question},
            ],
            temperature=0.3,
        )
        return response.choices[0].message.content
