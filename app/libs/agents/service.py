"""Serviço de agentes CrewAI - pipeline com dois agentes especializados."""

import os

from crewai import Agent, Crew, Process, Task
from langchain_openai import ChatOpenAI

from app.prompts.agents import (
    RESEARCHER_ROLE, RESEARCHER_GOAL, RESEARCHER_BACKSTORY, RESEARCHER_TASK,
    WRITER_ROLE, WRITER_GOAL, WRITER_BACKSTORY, WRITER_TASK,
)


class AgentsService:
    """
    Pipeline CrewAI com dois agentes de responsabilidades distintas:

    1. Pesquisador — lê o contexto RAG, extrai e estrutura os dados relevantes
    2. Redator     — transforma a análise em resposta clara e profissional

    O Redator depende do Pesquisador: pipeline sequencial real.
    """

    def __init__(self):
        self._llm = ChatOpenAI(
            model="gpt-4o-mini",
            api_key=os.getenv("OPENAI_API_KEY"),
            temperature=0.3,
        )

    def run(self, question: str, context: str | None = None) -> str:
        """
        Executa o pipeline de 2 agentes para responder à pergunta.

        Args:
            question: Pergunta do usuário
            context:  Contexto recuperado do RAG (opcional)

        Returns:
            Resposta final gerada pelo Redator
        """
        ctx = context or "Nenhum documento relevante foi encontrado para esta pergunta."

        # ── Agente 1: Pesquisador ─────────────────────────────────────────────
        researcher = Agent(
            role=RESEARCHER_ROLE,
            goal=RESEARCHER_GOAL,
            backstory=RESEARCHER_BACKSTORY,
            llm=self._llm,
            verbose=False,
            allow_delegation=False,
        )

        research_task = Task(
            description=RESEARCHER_TASK.format(context=ctx, question=question),
            expected_output=(
                "Um resumo estruturado em tópicos com todas as informações relevantes "
                "encontradas no contexto, indicando explicitamente o que não foi encontrado."
            ),
            agent=researcher,
        )

        # ── Agente 2: Redator ─────────────────────────────────────────────────
        writer = Agent(
            role=WRITER_ROLE,
            goal=WRITER_GOAL,
            backstory=WRITER_BACKSTORY,
            llm=self._llm,
            verbose=False,
            allow_delegation=False,
        )

        writing_task = Task(
            description=WRITER_TASK.format(question=question),
            expected_output=(
                "Uma resposta final em português, clara, profissional e bem formatada "
                "em markdown, pronta para ser exibida ao usuário."
            ),
            agent=writer,
            context=[research_task],  # Redator recebe o output do Pesquisador
        )

        # ── Crew: pipeline sequencial ─────────────────────────────────────────
        crew = Crew(
            agents=[researcher, writer],
            tasks=[research_task, writing_task],
            process=Process.sequential,
            verbose=False,
        )

        result = crew.kickoff()
        return str(result.raw) if hasattr(result, "raw") else str(result)
