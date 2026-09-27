from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class AccountBase(BaseModel):
    account_number: str
    customer_id: str
    account_type: str
    currency: str = "INR"
    balance: float = 0.0
    status: str = "ACTIVE"


class AccountResponse(AccountBase):
    id: str
    opened_at: datetime
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)