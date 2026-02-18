import json
import logging

import anthropic
from django.conf import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a support ticket classifier for a software company.
Your job is to analyze a support ticket description and return ONLY a JSON object with two fields.

Rules:
- "category" must be exactly one of: billing, technical, account, general
- "priority" must be exactly one of: low, medium, high, critical

Priority guidelines:
- critical: system down, data loss, security breach, complete inability to work
- high: major feature broken, significant productivity impact, affects many users
- medium: feature partially broken, workaround exists, single user impacted
- low: cosmetic issue, question, minor inconvenience, feature request

Category guidelines:
- billing: payments, invoices, subscriptions, refunds, pricing questions
- technical: bugs, errors, crashes, performance issues, API problems
- account: login, password, permissions, profile, 2FA, account access
- general: everything else

Respond ONLY with valid JSON. No explanation. No markdown. Example:
{"category": "technical", "priority": "high"}"""


def classify_ticket(description: str) -> dict:
    if not settings.ANTHROPIC_API_KEY:
        return _fallback()

    try:
        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        message = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=64,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": f"Classify this support ticket:\n\n{description}",
                }
            ],
        )

        raw = message.content[0].text.strip()
        parsed = json.loads(raw)

        valid_categories = {"billing", "technical", "account", "general"}
        valid_priorities = {"low", "medium", "high", "critical"}

        category = parsed.get("category", "").lower()
        priority = parsed.get("priority", "").lower()

        if category not in valid_categories or priority not in valid_priorities:
            return _fallback()

        return {"suggested_category": category, "suggested_priority": priority}

    except (
        json.JSONDecodeError,
        anthropic.APIConnectionError,
        anthropic.AuthenticationError,
        Exception,
    ):
        return _fallback()


def _fallback() -> dict:
    return {"suggested_category": "general", "suggested_priority": "medium"}
