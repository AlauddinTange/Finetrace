"""
LLM service — talks to local Ollama instance.
Generates evidence-grounded, unique explanations per alert.
"""
import httpx
from typing import Optional
from app.services.llm_verify import verify_explanation, fallback_explanation
OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
MODEL = "qwen2.5-coder:7b"
TIMEOUT = 90


def _parse_signals(signals_raw) -> list:
    if not signals_raw or not isinstance(signals_raw, str):
        return []
    return [s.strip() for s in signals_raw.strip("[]").replace("'", "").split(",") if s.strip()]


def _parse_evidence_count(evidence_raw) -> int:
    if not evidence_raw or not isinstance(evidence_raw, str):
        return 0
    return len([x for x in evidence_raw.split(",") if x.strip()])


def _build_prompt(alert: dict) -> str:
    entity = alert.get("primary_employee_id") or alert.get("entity_id") or "unknown entity"
    signals = _parse_signals(alert.get("signals") or alert.get("alert_type", ""))
    risk_level = alert.get("risk_level", "UNKNOWN")
    risk_score = alert.get("risk_score", 0)
    signal_count = alert.get("signal_count", 0)
    counterfactual = alert.get("counterfactual", "Not available")
    evidence_count = _parse_evidence_count(alert.get("evidence_ids", ""))
    summary = alert.get("summary", "")

    signals_str = ", ".join(signals) if signals else "unspecified anomaly signals"

    # Map signal names to human-readable descriptions for richer prompt
    signal_hints = []
    for s in signals:
        su = s.upper()
        if "ML_EMPLOYEE_ANOMALY" in su:
            signal_hints.append("statistical behavioral deviation from peer baseline")
        elif "PERMISSION_MISMATCH" in su:
            signal_hints.append("action outside the employee's role-permitted scope")
        elif "TRANSACTION_SPLITTING" in su:
            signal_hints.append("multiple transfers below reporting threshold within a short window")
        elif "CIRCULAR" in su:
            signal_hints.append("funds returned to origin through connected accounts")
        elif "RECON" in su:
            signal_hints.append("unusual reconnaissance — many accounts viewed without transactions")
    hints_str = "; ".join(signal_hints) if signal_hints else "no additional hints"

    return f"""You are a senior financial crime investigator at a bank. Write a concise, professional case summary for an analyst, based ONLY on the facts below. Every sentence must reference a specific fact. Do not use generic filler phrases.

FACTS:
- Subject under review: {entity}
- Risk classification: {risk_level} (score {risk_score}/100)
- Detected signals ({signal_count}): {signals_str}
- Signal interpretation: {hints_str}
- Evidence records on file: {evidence_count}
- Counterfactual note: {counterfactual}
- Pipeline summary: {summary}

WRITE 3 SENTENCES:
1. Name the subject and the specific behavioral pattern detected (reference the signal interpretation, not the raw signal code).
2. Describe the risk classification and what supporting evidence exists.
3. State what the investigator should verify next, referencing the counterfactual.

RULES:
- Never invent amounts, dates, names, or account numbers that aren't in the facts.
- Never say "guilty" or "fraud confirmed" — use "flagged", "detected", "requires verification".
- Output only the 3 sentences. No preamble, no labels, no bullet points."""


def generate_explanation(alert: dict) -> str:
    prompt = _build_prompt(alert)

    for attempt in range(2):
        payload = {
            "model": MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.4, "num_predict": 250, "top_p": 0.9},
        }
        try:
            with httpx.Client(timeout=TIMEOUT) as client:
                r = client.post(OLLAMA_URL, json=payload)
                r.raise_for_status()
                data = r.json()
                text = (data.get("response") or "").strip()
        except Exception:
            return fallback_explanation(alert)

        if not text:
            continue

        is_valid, violations = verify_explanation(text, alert)

        if is_valid:
            return text

        # Regenerate with a stricter prompt
        print(f"   [VERIFY] attempt {attempt + 1} rejected: {violations}")
        prompt = _build_prompt(alert) + (
            "\n\nIMPORTANT: Previous attempt contained factual errors. "
            "Do not invent numbers. Use ONLY the evidence count provided."
        )

    # Both attempts failed verification
    return fallback_explanation(alert)

def _fallback(alert: dict) -> str:
    entity = alert.get("primary_employee_id") or alert.get("entity_id") or "entity"
    risk = alert.get("risk_level", "UNKNOWN")
    signals = _parse_signals(alert.get("signals") or alert.get("alert_type", ""))
    return (
        f"Entity {entity} has been flagged at {risk} tier. "
        f"Detected signals include {', '.join(signals) if signals else 'anomalous activity'}. "
        f"Investigator should review the linked evidence records before any conclusion."
    )