"""Serviço de compliance - classifica se a pergunta pode ser respondida."""

import os
from openai import OpenAI

from app.prompts.compliance import COMPLIANCE_SYSTEM, COMPLIANCE_USER


class ComplianceService:
    """Verifica se a pergunta está em conformidade com tópicos permitidos."""

    BLOCKED_MESSAGE = (
        "Não posso responder a essa pergunta. O tópico abordado está fora do escopo "
        "permitido para este assistente."
    )

    def __init__(self, client: OpenAI | None = None):
        self._client = client or OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    def check(self, question: str) -> tuple[bool, str]:
        """
        Verifica se a pergunta pode ser respondida.

        Returns:
            tuple[bool, str]: (permitido, mensagem)
            - Se permitido: (True, "")
            - Se bloqueado: (False, BLOCKED_MESSAGE)
        """
        response = self._client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": COMPLIANCE_SYSTEM},
                {"role": "user", "content": COMPLIANCE_USER.format(question=question)},
            ],
            temperature=0,
            max_tokens=10,
        )
        result = response.choices[0].message.content.strip().upper()

        if "BLOQUEADO" in result:
            return False, self.BLOCKED_MESSAGE
        return True, ""
