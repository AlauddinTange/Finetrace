from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def get_dashboard():
    return {
        "total_alerts": 0,
        "high_risk_alerts": 0,
        "active_cases": 0,
        "employees_flagged": 0,
    }