from fastapi import APIRouter, HTTPException, Body
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


def _save(cases):
    CASES_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(CASES_FILE, "w", encoding="utf-8") as f:
        json.dump(cases, f, indent=2)


@router.get("/")
def list_cases():
    return _load()


@router.get("/{case_id}")
def get_case(case_id: str):
    for c in _load():
        if str(c.get("case_id")) == case_id or str(c.get("id")) == case_id:
            return c
    raise HTTPException(status_code=404, detail="Case not found")


@router.patch("/{case_id}")
def update_case_status(case_id: str, payload: dict = Body(...)):
    cases = _load()
    updated = False

    for c in cases:
        if str(c.get("case_id")) == case_id or str(c.get("id")) == case_id:
            if "status" in payload:
                c["status"] = payload["status"]
            # Allow updating other arbitrary fields if passed
            for key, val in payload.items():
                c[key] = val
            updated = True
            break

    if not updated:
        raise HTTPException(status_code=404, detail="Case not found")

    _save(cases)
    return {"success": True, "message": f"Case {case_id} updated successfully"}