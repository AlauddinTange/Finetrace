#!/usr/bin/env python3
"""
FINTRACE — Generate 500 devices -> data/raw/devices.csv
~30 unknown/untrusted devices for fraud scenarios.
"""
import random
from pathlib import Path

import pandas as pd
from faker import Faker

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "data" / "raw"
DATA_DIR.mkdir(parents=True, exist_ok=True)

SEED = 42
random.seed(SEED)
Faker.seed(SEED)
fake = Faker("en_IN")

DEVICE_TYPES = ["Laptop", "Desktop", "Mobile", "Tablet", "IoT"]
OS_LIST = ["Windows", "macOS", "Linux", "Android", "iOS"]
BROWSER_LIST = ["Chrome", "Firefox", "Safari", "Edge", "Brave"]


def make_device(idx: int, force_untrusted: bool = False) -> dict:
    trusted = False if force_untrusted else random.random() < 0.7
    assigned = (
        "" if force_untrusted or random.random() > 0.7
        else f"E{str(random.randint(1, 200)).zfill(4)}"
    )
    first_seen = fake.date_between(start_date="-2y", end_date="-1y")
    last_seen = fake.date_between(start_date=first_seen, end_date="today")
    return {
        "device_id": f"DEV-{str(idx).zfill(3)}",
        "device_type": random.choice(DEVICE_TYPES),
        "os": random.choice(OS_LIST),
        "browser": random.choice(BROWSER_LIST),
        "mac_address": fake.mac_address(),
        "assigned_to_employee_id": assigned,
        "first_seen": first_seen,
        "last_seen": last_seen,
        "trusted": int(trusted),
    }


devices = []
# 470 trusted devices
for i in range(1, 471):
    devices.append(make_device(i, force_untrusted=False))
# 30 untrusted
for i in range(471, 501):
    devices.append(make_device(i, force_untrusted=True))

df = pd.DataFrame(devices)
out = DATA_DIR / "devices.csv"
df.to_csv(out, index=False, quoting=1)
print(f"✅ Wrote {len(df)} devices -> {out}")
print(f"   Trusted:   {df['trusted'].sum()}")
print(f"   Untrusted: {len(df) - df['trusted'].sum()}")