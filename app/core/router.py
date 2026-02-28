"""Router - decide como responder: DIRETO, RAG ou AGENTE."""

import os

from openai import OpenAI

from app.prompts.router import ROUTER_SYSTEM, ROUTER_USER


def route(question: str, client: OpenAI | None = None) -> str:
    """
    Decide a estratégia de resposta.

    Returns:
        "DIRETO" | "RAG" | "AGENTE"
    """
    openai_client = client or OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": ROUTER_SYSTEM},
            {"role": "user", "content": ROUTER_USER.format(question=question)},
        ],
        temperature=0,
        max_tokens=10,
    )
    result = response.choices[0].message.content.strip().upper()

    if "RAG" in result:
        return "RAG"
    if "AGENTE" in result:
        return "AGENTE"
    return "DIRETO"
