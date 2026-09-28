from fastapi import APIRouter
from pathlib import Path
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


@router.get("/")
def get_dashboard():
    df = _load()
    if df.empty:
        return {
            "total_alerts": 0,
            "high_risk_alerts": 0,
            "active_cases": 0,
            "employees_flagged": 0,
        }

    total = int(len(df))
    high = int(df["risk_level"].isin(["HIGH", "CRITICAL"]).sum())
    employees = int(
        df[df["entity_type"] == "EMPLOYEE"]["entity_id"].nunique()
    ) if "entity_type" in df.columns else 0

    return {
        "total_alerts": total,
        "high_risk_alerts": high,
        "active_cases": 0,
        "employees_flagged": employees,
    }