#!/usr/bin/env python3
"""
FINTRACE — Generate 5000 customers -> data/raw/customers.csv
- 4000 Individuals + 1000 Corporates
- Risk: 85% Low, 12% Medium, 3% High
"""
import random
from datetime import datetime
from pathlib import Path

import pandas as pd
from faker import Faker

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "data" / "raw"
DATA_DIR.mkdir(parents=True, exist_ok=True)

NUM_INDIV = 4000
NUM_CORP = 1000
START_DATE = datetime(2010, 1, 1)
END_DATE = datetime(2025, 12, 31)
CITIES = ["Pune", "Mumbai", "Nagpur", "Hyderabad", "Bengaluru", "Delhi", "Navi Mumbai"]

SEED = 42
random.seed(SEED)
Faker.seed(SEED)
fake = Faker("en_IN")


def make_customer(idx: int, cust_type: str) -> dict:
    return {
        "customer_id": f"C{str(idx).zfill(5)}",
        "name": fake.name() if cust_type == "Individual" else fake.company(),
        "city": random.choice(CITIES),
        "customer_type": cust_type,
        "risk_profile": random.choices(["Low", "Medium", "High"], weights=[85, 12, 3])[0],
        "created_date": fake.date_between_dates(START_DATE, END_DATE),
    }


customers = []
for i in range(1, NUM_INDIV + 1):
    customers.append(make_customer(i, "Individual"))
for i in range(NUM_INDIV + 1, NUM_INDIV + NUM_CORP + 1):
    customers.append(make_customer(i, "Corporate"))

df = pd.DataFrame(customers)
out = DATA_DIR / "customers.csv"
df.to_csv(out, index=False, quoting=1)
print(f"✅ Wrote {len(df)} customers -> {out}")
print(df["customer_type"].value_counts().to_string())