from fastapi import APIRouter, HTTPException
from pathlib import Path
import ast
import pandas as pd

router = APIRouter()

ROOT = Path(__file__).resolve().parents[2]
ALERTS_CSV = ROOT / "data" / "generated" / "alerts_final.csv"


def _load():
    if not ALERTS_CSV.exists():
        return pd.DataFrame()
    try:
        return pd.read_csv(ALERTS_CSV)
    except Exception:
        return pd.DataFrame()


def _parse_signals(value):
    if not isinstance(value, str):
        return "UNKNOWN"
    try:
        parsed = ast.literal_eval(value)
        if isinstance(parsed, list):
            return ", ".join(str(x) for x in parsed)
        return str(parsed)
    except Exception:
        return value.strip("[]").replace("'", "")


def _row_to_alert(row, idx):
    risk_level = str(row.get("risk_level", "LOW"))
    entity_type = str(row.get("entity_type", "ENTITY"))
    entity_id = str(row.get("entity_id", ""))

    return {
        "id": idx + 1,
        "alert_code": str(row.get("alert_id", f"ALERT-{idx + 1:04d}")),
        "alert_type": _parse_signals(row.get("signals", "")),
        "severity": risk_level,
        "risk_score": int(row.get("risk_score", 0)),
        "risk_level": risk_level,
        "title": f"{entity_type} {entity_id} — {int(row.get('signal_count', 0))} signal(s)",
        "summary": str(row.get("explanation", "")),
        "counterfactual": str(row.get("counterfactual", "")),
        "evidence_ids": str(row.get("evidence_ids", "")),
        "signal_count": int(row.get("signal_count", 0)),
        "signals": str(row.get("signals", "")),
        "status": "NEW",
        "primary_transaction_id": None,
        "primary_employee_id": entity_id if entity_type == "EMPLOYEE" else None,
        "primary_customer_id": None,
        "created_at": "2026-09-28T10:00:00",
    }


@router.get("/")
def list_alerts():
    df = _load()
    if df.empty:
        return []
    return [_row_to_alert(row, i) for i, row in df.iterrows()]


@router.get("/{alert_id}")
def get_alert(alert_id: str):
    df = _load()
    if df.empty:
        raise HTTPException(status_code=404, detail="No alerts available")
    for i, row in df.iterrows():
        code = str(row.get("alert_id", ""))
        if code == alert_id or str(i + 1) == alert_id:
            return _row_to_alert(row, i)
    raise HTTPException(status_code=404, detail="Alert not found")


@router.post("/{alert_id}/explain")
def explain_alert(alert_id: str):
    from app.services.llm_service import generate_explanation

    df = _load()
    if df.empty:
        raise HTTPException(status_code=404, detail="No alerts available")

    target = None
    for i, row in df.iterrows():
        code = str(row.get("alert_id", ""))
        if code == alert_id or str(i + 1) == alert_id:
            target = _row_to_alert(row, i)
            break

    if not target:
        raise HTTPException(status_code=404, detail="Alert not found")

    explanation = generate_explanation(target)
    return {"alert_id": target["alert_code"], "explanation": explanation}