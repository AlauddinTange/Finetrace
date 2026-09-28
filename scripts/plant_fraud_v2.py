"""Fix 2 gaps: circular cycle (add C node) + recon baseline for E0102."""
import random
import pandas as pd
from pathlib import Path
from datetime import datetime, timedelta

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
random.seed(42)


def main():
    print("=" * 50)
    print("Planting fraud v2 — fixing circular + recon")
    print("=" * 50)

    txn = pd.read_csv(RAW / "transactions.csv")
    acc = pd.read_csv(RAW / "access_logs.csv")
    acct = pd.read_csv(RAW / "accounts.csv")
    accounts = acct["account_id"].astype(str).tolist()

    # --- Fix 1: Proper 3-hop cycle A -> B -> C -> A ---
    print("\n[CIRCULAR] 3-hop cycle for E0004")
    base = datetime(2026, 9, 25, 10, 30, 0)
    a, b, c = accounts[10], accounts[20], accounts[30]

    cycle_txns = [
        {"transaction_id": "TXN-CYC-01", "from_account": a, "to_account": b,
         "amount": 300000, "timestamp": (base).strftime("%Y-%m-%d %H:%M:%S")},
        {"transaction_id": "TXN-CYC-02", "from_account": b, "to_account": c,
         "amount": 290000, "timestamp": (base + timedelta(minutes=2)).strftime("%Y-%m-%d %H:%M:%S")},
        {"transaction_id": "TXN-CYC-03", "from_account": c, "to_account": a,
         "amount": 280000, "timestamp": (base + timedelta(minutes=4)).strftime("%Y-%m-%d %H:%M:%S")},
    ]

    rows = []
    for t in cycle_txns:
        rows.append({
            "transaction_id": t["transaction_id"],
            "timestamp": t["timestamp"],
            "from_account": t["from_account"],
            "to_account": t["to_account"],
            "amount": t["amount"],
            "transaction_type": "TRANSFER",
            "channel": "ONLINE",
            "employee_id": "E0004",
            "status": "SUCCESS",
        })
    txn = pd.concat([txn, pd.DataFrame(rows)], ignore_index=True)
    print(f"   injected 3 txns forming A->B->C->A")

    # --- Fix 2: Baseline days for E0102 (normal behavior) ---
    print("\n[RECON] Adding 5 baseline days for E0102")
    baseline_rows = []
    for day in range(5):
        d = datetime(2026, 9, 18 + day, 10, 0, 0)
        for i in range(4):
            baseline_rows.append({
                "log_id": f"LOG-BASE-E0102-{day}-{i}",
                "timestamp": (d + timedelta(minutes=i * 30)).strftime("%Y-%m-%d %H:%M:%S"),
                "employee_id": "E0102",
                "customer_id": f"C{(i * 5 + 1):05d}",
                "account_id": accounts[(i * 13) % len(accounts)],
                "action": "VIEW",
                "device_id": "DEV-102",
                "ip_address": "10.0.0.10",
            })
    acc = pd.concat([acc, pd.DataFrame(baseline_rows)], ignore_index=True)
    print(f"   injected 20 baseline logs (4 views/day × 5 days)")

    # Save
    txn.to_csv(RAW / "transactions.csv", index=False)
    acc.to_csv(RAW / "access_logs.csv", index=False)
    print(f"\n   wrote transactions.csv: {len(txn)} rows")
    print(f"   wrote access_logs.csv: {len(acc)} rows")
    print("\nDONE. Now run: python scripts\\run_detection.py")


if __name__ == "__main__":
    main()