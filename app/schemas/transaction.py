from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class TransactionResponse(BaseModel):
    id: str
    transaction_code: str
    source_account_id: str
    destination_account_id: str
    employee_id: Optional[str] = None
    amount: float
    currency: str
    transaction_type: str
    channel: str
    status: str
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)