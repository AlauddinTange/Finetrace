from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class CustomerBase(BaseModel):
    customer_code: str
    name: str
    customer_type: str
    occupation: Optional[str] = None
    industry: Optional[str] = None
    city: str
    country: str
    risk_category: str = "LOW"
    expected_monthly_volume: float = 100000.0


class CustomerResponse(CustomerBase):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)