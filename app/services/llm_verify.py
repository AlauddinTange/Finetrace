"""
LLM Fact-Verification Layer.
Checks every claim in an LLM explanation against the alert's actual evidence.
Rejects hallucinated numbers/entities and triggers regeneration.
"""
import re
from typing import Tuple, List


def _extract_numbers(text: str) -> List[int]:
    """Pull every number from the text."""
    return [int(x) for x in re.findall(r"\d+", text)]


def _extract_entities(text: str) -> List[str]:
    """Find entity IDs like E0001, A001, C12345, T0000001 in the text."""
    patterns = [
        r"\bE\d{3,}\b",
        r"\bC\d{3,}\b",
        r"\bA\d{3,}\b",
        r"\bT\d{6,}\b",
        r"\bALERT-\d+\b",
    ]
    found = []
    for pat in patterns:
        found.extend(re.findall(pat, text))
    return found


def verify_explanation(explanation: str, alert: dict) -> Tuple[bool, List[str]]:
    """
    Returns (is_valid, violations).
    A violation means the LLM invented a fact not supported by the alert data.
    """
    violations = []

    # 1. Verify all entity IDs mentioned actually exist in the alert
    allowed_entities = {
        str(alert.get("primary_employee_id") or ""),
        str(alert.get("primary_customer_id") or ""),
        str(alert.get("primary_transaction_id") or ""),
        str(alert.get("entity_id") or ""),
        str(alert.get("alert_code") or ""),
    }
    allowed_entities = {e for e in allowed_entities if e}

    mentioned = _extract_entities(explanation)
    for ent in mentioned:
        if ent not in allowed_entities:
            violations.append(f"Entity '{ent}' not present in alert data")

    # 2. Verify evidence count claim
    real_evidence_count = len([
        x for x in str(alert.get("evidence_ids", "")).split(",") if x.strip()
    ])
    numbers = _extract_numbers(explanation)
    for n in numbers:
        # If a number looks like an evidence count claim (>5 but <1000)
        # and it doesn't match reality, flag it
        if 5 < n < 1000 and n != real_evidence_count:
            # Only flag if it appears next to "evidence" or "records"
            context_pattern = rf"\b{n}\s+(evidence|records|items)"
            if re.search(context_pattern, explanation, re.IGNORECASE):
                violations.append(
                    f"Claimed {n} evidence records, actual count is {real_evidence_count}"
                )

    # 3. Verify risk score claim
    real_score = int(alert.get("risk_score", 0))
    score_claims = re.findall(r"(\d+)\s*/\s*100", explanation)
    for claim in score_claims:
        if int(claim) != real_score:
            violations.append(
                f"Claimed risk score {claim}/100, actual is {real_score}/100"
            )

    # 4. Reject forbidden words (guilt declarations)
    forbidden = ["confirmed fraud", "guilty", "definitely fraud", "proven fraud"]
    for word in forbidden:
        if word in explanation.lower():
            violations.append(f"Contains forbidden assertion: '{word}'")

    return (len(violations) == 0, violations)


def fallback_explanation(alert: dict) -> str:
    """If verification fails twice, use this safe template."""
    entity = alert.get("primary_employee_id") or alert.get("entity_id") or "entity"
    risk = alert.get("risk_level", "UNKNOWN")
    signals = str(alert.get("signals", "")).strip("[]").replace("'", "")
    return (
        f"Entity {entity} was flagged at {risk} tier based on detected signals: {signals}. "
        f"Investigator should review the linked evidence records before drawing conclusions."
    )