#!/usr/bin/env python3
"""
FINTRACE — Generate 200 employees -> data/raw/employees.csv
- 10 branches (BR001-BR010), one Branch Manager each
- Deterministic seed = 42
"""
import json
import random
import pathlib
from datetime import datetime

import pandas as pd
from faker import Faker

# ---- Paths ----
ROOT = pathlib.Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "data" / "raw"
DATA_DIR.mkdir(parents=True, exist_ok=True)
ROLES_PATH = ROOT / "config" / "roles.json"

BRANCH_IDS = [f"BR{str(i).zfill(3)}" for i in range(1, 11)]
START_JOIN = datetime(2015, 1, 1)
END_JOIN = datetime(2023, 12, 31)

SEED = 42
random.seed(SEED)
Faker.seed(SEED)
fake = Faker("en_IN")

# ---- Load roles ----
with open(ROLES_PATH, "r", encoding="utf-8") as fp:
    ROLES = json.load(fp)["roles"]

ROLE_NAMES = [r["name"] for r in ROLES]
# Weight: Branch Manager is rare (only 10), rest distributed
WEIGHTS = [
    0.01 if r["name"] == "Branch Manager" else 1.0
    for r in ROLES
]


def dept_of(role_name: str) -> str:
    return next((r["department"] for r in ROLES if r["name"] == role_name), "General")


def make_email(emp_id: str, name: str) -> str:
    return f"{name.lower().replace(' ', '.')}.{emp_id.lower()}@aegisbank.in"


employees = []
emp_counter = 1
branch_manager_map = {}  # branch_id -> manager employee_id

# --- Step 1: Create 10 Branch Managers (one per branch) ---
for branch in BRANCH_IDS:
    emp_id = f"E{str(emp_counter).zfill(4)}"
    name = fake.name()
    employees.append({
        "employee_id": emp_id,
        "name": name,
        "role_id": "R001",
        "role": "Branch Manager",
        "branch_id": branch,
        "join_date": fake.date_between_dates(START_JOIN, END_JOIN),
        "status": "ACTIVE",
        "manager_id": "E0000",
        "department": "Management",
        "email": make_email(emp_id, name),
    })
    branch_manager_map[branch] = emp_id
    emp_counter += 1

# --- Step 2: Create 190 more employees, distributed across branches ---
while emp_counter <= 200:
    branch = random.choice(BRANCH_IDS)
    role_name = random.choices(ROLE_NAMES, weights=WEIGHTS, k=1)[0]
    # Skip Branch Manager for non-manager slots
    if role_name == "Branch Manager":
        role_name = "Teller"

    emp_id = f"E{str(emp_counter).zfill(4)}"
    name = fake.name()
    employees.append({
        "employee_id": emp_id,
        "name": name,
        "role_id": next(r["role_id"] for r in ROLES if r["name"] == role_name),
        "role": role_name,
        "branch_id": branch,
        "join_date": fake.date_between_dates(START_JOIN, END_JOIN),
        "status": random.choices(["ACTIVE", "INACTIVE"], weights=[0.95, 0.05])[0],
        "manager_id": branch_manager_map[branch],
        "department": dept_of(role_name),
        "email": make_email(emp_id, name),
    })
    emp_counter += 1

# --- Save ---
df = pd.DataFrame(employees)
out = DATA_DIR / "employees.csv"
df.to_csv(out, index=False, quoting=1)
print(f"✅ Wrote {len(df)} employees -> {out}")
print(df["role"].value_counts().to_string())