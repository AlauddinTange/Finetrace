"""
LLM service — talks to local Ollama instance.
Generates evidence-grounded explanations for alerts.
"""
import httpx
from typing import Optional

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
MODEL = "qwen2.5-coder:7b"
TIMEOUT = 60


def _build_prompt(alert: dict) -> str:
    entity = alert.get("primary_employee_id") or alert.get("entity_id") or "unknown"
    signals = alert.get("alert_type") or alert.get("signals", "")
    risk_level = alert.get("risk_level", "UNKNOWN")
    risk_score = alert.get("risk_score", 0)
    counterfactual = alert.get("counterfactual", "")
    evidence_count = len(str(alert.get("evidence_ids", "")).split(",")) if alert.get("evidence_ids") else 0

    return f"""You are a financial crime investigator assistant. Write a short, factual explanation of this alert for a bank investigator.

Alert data:
- Entity under review: {entity}
- Detected signals: {signals}
- Risk tier: {risk_level} (score {risk_score}/100)
- Evidence records: {evidence_count}
- Counterfactual note: {counterfactual}

Rules:
- Exactly 3 sentences.
- Do NOT invent facts. Only describe what is listed above.
- Do NOT assign guilt. Use "flagged", "detected", "requires review".
- Keep tone professional, factual, and brief.
- End with a recommended next step for the investigator.

Output: only the 3-sentence explanation. No preamble."""


def generate_explanation(alert: dict) -> str:
    prompt = _build_prompt(alert)
    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.2, "num_predict": 200},
    }

    try:
        with httpx.Client(timeout=TIMEOUT) as client:
            r = client.post(OLLAMA_URL, json=payload)
            r.raise_for_status()
            data = r.json()
            text = (data.get("response") or "").strip()
            return text if text else _fallback(alert)
    except Exception:
        return _fallback(alert)


def _fallback(alert: dict) -> str:
    entity = alert.get("primary_employee_id") or alert.get("entity_id") or "entity"
    signals = alert.get("alert_type") or "multiple signals"
    risk = alert.get("risk_level", "UNKNOWN")
    return (
        f"Entity {entity} was flagged with risk tier {risk}. "
        f"Detected signals: {signals}. "
        f"Investigator should review the linked evidence records and confirm the legitimacy of the activity."
    )