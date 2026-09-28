from fastapi import APIRouter, HTTPException
from pathlib import Path
import json

router = APIRouter()

ROOT = Path(__file__).resolve().parents[2]
CASES_FILE = ROOT / "data" / "generated" / "cases.json"


def _load():
    if not CASES_FILE.exists():
        return []
    try:
        with open(CASES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


@router.get("/")
def list_cases():
    return _load()


@router.get("/{case_id}")
def get_case(case_id: str):
    for c in _load():
        if str(c.get("case_id")) == case_id or str(c.get("id")) == case_id:
            return c
    raise HTTPException(status_code=404, detail="Case not found")