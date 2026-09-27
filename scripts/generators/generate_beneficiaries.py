#!/usr/bin/env python3
"""
FINTRACE — Generate 15000 beneficiaries -> data/raw/beneficiaries.csv
Guarantees FK integrity with customers.csv and accounts.csv.
"""
import random
from pathlib import Path

import pandas as pd
from faker import Faker

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "data" / "raw"
CUSTOMERS_CSV = DATA_DIR / "customers.csv"
ACCOUNTS_CSV = DATA_DIR / "accounts.csv"

SEED = 42
random.seed(SEED)
Faker.seed(SEED)
fake = Faker("en_IN")

TOTAL_BENEFICIARIES = 15000
BANKS = ["SBI", "HDFC", "ICICI", "Axis", "Kotak", "PNB", "BOB", "Yes", "XYZ"]
IFSC_PREFIX = {
    "SBI": "SBIN", "HDFC": "HDFC", "ICICI": "ICIC", "Axis": "UTIB",
    "Kotak": "KKBK", "PNB": "PUNB", "BOB": "BARB", "Yes": "YESB", "XYZ": "XYZB",
}


def load_data():
    customers = pd.read_csv(CUSTOMERS_CSV, dtype=str)
    accounts = pd.read_csv(ACCOUNTS_CSV, dtype=str)
    return customers, accounts


def make_ifsc(bank: str) -> str:
    return f"{IFSC_PREFIX[bank]}0{random.randint(100000, 999999)}"


def make_beneficiary(ben_idx: int, account_row, employees: list) -> dict:
    bank = random.choice(BANKS)
    return {
        "beneficiary_id": f"BEN-{str(ben_idx).zfill(4)}",
        "customer_id": account_row["customer_id"],
        "account_id": account_row["account_id"],
        "name": fake.name() if random.random() < 0.7 else fake.company(),
        "account_number": f"XXXX{random.randint(1000, 9999)}",
        "bank": bank,
        "ifsc": make_ifsc(bank),
        "added_date": fake.date_between(start_date="-2y", end_date="today"),
        "added_by_employee_id": random.choice(employees),
        "status": random.choices(
            ["ACTIVE", "INACTIVE", "PENDING"], weights=[0.85, 0.10, 0.05]
        )[0],
        "approved_by": random.choice(employees + [""]),
    }


customers, accounts = load_data()
employees = [f"E{str(i).zfill(4)}" for i in range(1, 201)]

# Every account gets 1-3 beneficiaries
accounts_list = accounts.to_dict("records")
beneficiaries = []
ben_counter = 1

while ben_counter <= TOTAL_BENEFICIARIES:
    # Pick a random account
    acc = random.choice(accounts_list)
    count = random.choices([1, 2, 3], weights=[0.5, 0.35, 0.15])[0]
    for _ in range(count):
        if ben_counter > TOTAL_BENEFICIARIES:
            break
        beneficiaries.append(make_beneficiary(ben_counter, acc, employees))
        ben_counter += 1

df = pd.DataFrame(beneficiaries)
out = DATA_DIR / "beneficiaries.csv"
df.to_csv(out, index=False, quoting=1)
print(f"✅ Wrote {len(df)} beneficiaries -> {out}")
print(f"   Unique accounts covered: {df['account_id'].nunique()}")
print(f"   Unique customers covered: {df['customer_id'].nunique()}")