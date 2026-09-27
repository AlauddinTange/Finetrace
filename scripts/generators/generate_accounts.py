#!/usr/bin/env python3
"""
FINTRACE — Generate 8000 accounts -> data/raw/accounts.csv
Guarantees every customer gets at least 1 account.
"""
import random
from datetime import datetime
from pathlib import Path

import pandas as pd
from faker import Faker

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "data" / "raw"
CUSTOMERS_CSV = DATA_DIR / "customers.csv"

SEED = 42
random.seed(SEED)
Faker.seed(SEED)
fake = Faker("en_IN")

BRANCH_IDS = [f"BR{str(i).zfill(3)}" for i in range(1, 11)]
ACCOUNT_TYPES = ["SAVINGS", "CURRENT", "CORPORATE"]


def load_customers() -> pd.DataFrame:
    return pd.read_csv(CUSTOMERS_CSV, dtype=str)


def pick_type(cust_type: str) -> str:
    if cust_type == "Corporate":
        return random.choices(["CORPORATE", "CURRENT"], weights=[0.8, 0.2])[0]
    return random.choices(["SAVINGS", "CURRENT"], weights=[0.85, 0.15])[0]


def make_account(account_id: str, customer_id: str, cust_type: str) -> dict:
    return {
        "account_id": account_id,
        "customer_id": customer_id,
        "account_type": pick_type(cust_type),
        "opened_date": fake.date_between_dates(datetime(2015, 1, 1), datetime(2025, 12, 31)),
        "branch_id": random.choice(BRANCH_IDS),
        "status": random.choices(["ACTIVE", "FROZEN", "CLOSED"], weights=[0.92, 0.04, 0.04])[0],
        "balance": round(random.uniform(5000, 5_000_000), 2),
        "currency": "INR",
        "daily_limit": round(random.uniform(50000, 1_000_000), 2),
        "owner_employee_id": f"E{str(random.randint(1, 200)).zfill(4)}",
    }


customers = load_customers()
TOTAL_ACCOUNTS = 8000
accounts = []
counter = 1

# --- Step 1: give every customer exactly 1 account (5000 accounts) ---
for _, row in customers.iterrows():
    acc_id = f"A{str(counter).zfill(6)}"
    accounts.append(make_account(acc_id, row["customer_id"], row["customer_type"]))
    counter += 1

# --- Step 2: distribute remaining 3000 accounts, corporates get more ---
remaining = TOTAL_ACCOUNTS - len(accounts)
corp_customers = customers[customers["customer_type"] == "Corporate"]["customer_id"].tolist()
indiv_customers = customers[customers["customer_type"] == "Individual"]["customer_id"].tolist()

while remaining > 0:
    # 60% go to corporates, 40% to individuals
    if random.random() < 0.6:
        cid = random.choice(corp_customers)
        ctype = "Corporate"
    else:
        cid = random.choice(indiv_customers)
        ctype = "Individual"
    acc_id = f"A{str(counter).zfill(6)}"
    accounts.append(make_account(acc_id, cid, ctype))
    counter += 1
    remaining -= 1

df = pd.DataFrame(accounts)
out = DATA_DIR / "accounts.csv"
df.to_csv(out, index=False, quoting=1)
print(f"✅ Wrote {len(df)} accounts -> {out}")
print(f"   Unique customers covered: {df['customer_id'].nunique()}")
print(df["account_type"].value_counts().to_string())