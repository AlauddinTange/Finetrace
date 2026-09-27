from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def list_cases():
    return []


@router.get("/{case_id}")
def get_case(case_id: str):
    return {"id": case_id}