from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class AlertResponse(BaseModel):
    id: str
    alert_code: str
    alert_type: str
    severity: str
    risk_score: float
    risk_level: str
    title: str
    summary: str
    status: str
    primary_transaction_id: Optional[str] = None
    primary_employee_id: Optional[str] = None
    primary_customer_id: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)