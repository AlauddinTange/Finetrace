"""Plant 5 fraud scenarios into existing CSVs."""
import random
import pandas as pd
from pathlib import Path
from datetime import datetime, timedelta

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
random.seed(42)


def load_all():
    return {
        "txn": pd.read_csv(RAW / "transactions.csv"),
        "acc": pd.read_csv(RAW / "access_logs.csv"),
        "ben": pd.read_csv(RAW / "beneficiary_changes.csv"),
        "acct": pd.read_csv(RAW / "accounts.csv"),
    }


def save(df, name):
    df.to_csv(RAW / name, index=False)
    print(f"   wrote {name}: {len(df)} rows")


def main():
    print("=" * 50)
    print("Planting fraud scenarios")
    print("=" * 50)

    # Backup
    backup = RAW / "_backup"
    if not backup.exists():
        backup.mkdir()
        for f in ["transactions.csv", "access_logs.csv", "beneficiary_changes.csv"]:
            src = RAW / f
            if src.exists():
                pd.read_csv(src).to_csv(backup / f, index=False)
        print(f"   backed up to {backup}")

    data = load_all()
    accounts = data["acct"]["account_id"].astype(str).tolist()
    base = datetime(2026, 9, 25, 10, 15, 0)

    # S1: E004 structuring + cycle
    print("\n[S1] Structuring — E004")
    s1_txn = []
    for i, amt in enumerate([180000, 170000, 140000]):
        s1_txn.append({
            "transaction_id": f"TXN-S1-{i+1:03d}",
            "timestamp": (base + timedelta(minutes=i * 2)).strftime("%Y-%m-%d %H:%M:%S"),
            "from_account": accounts[10], "to_account": accounts[20],
            "amount": amt, "transaction_type": "TRANSFER",
            "channel": "ONLINE", "employee_id": "E0004", "status": "SUCCESS",
        })
    s1_txn.append({
        "transaction_id": "TXN-S1-CYCLE",
        "timestamp": (base + timedelta(minutes=10)).strftime("%Y-%m-%d %H:%M:%S"),
        "from_account": accounts[20], "to_account": accounts[10],
        "amount": 490000, "transaction_type": "TRANSFER",
        "channel": "ONLINE", "employee_id": "E0004", "status": "SUCCESS",
    })
    data["txn"] = pd.concat([data["txn"], pd.DataFrame(s1_txn)], ignore_index=True)

    s1_ben = [{
        "change_id": "BC-S1-001",
        "timestamp": (base - timedelta(minutes=4)).strftime("%Y-%m-%d %H:%M:%S"),
        "employee_id": "E0004", "account_id": accounts[10],
        "old_beneficiary": "BEN-001", "new_beneficiary": "BEN-UNKNOWN",
        "reason": "customer_request",
    }]
    data["ben"] = pd.concat([data["ben"], pd.DataFrame(s1_ben)], ignore_index=True)
    print(f"   injected 4 txns + 1 beneficiary change")

    # S3: E0052 slow-burn (20 txns over 20 days)
    print("\n[S3] Slow-burn — E0052")
    s3_txn = []
    start = datetime(2026, 9, 5, 11, 0, 0)
    for day in range(20):
        ts = start + timedelta(days=day, hours=random.randint(0, 3))
        s3_txn.append({
            "transaction_id": f"TXN-S3-{day+1:03d}",
            "timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
            "from_account": accounts[30], "to_account": accounts[31 + (day % 6)],
            "amount": random.randint(40000, 90000),
            "transaction_type": "TRANSFER", "channel": "NEFT",
            "employee_id": "E0052", "status": "SUCCESS",
        })
    data["txn"] = pd.concat([data["txn"], pd.DataFrame(s3_txn)], ignore_index=True)
    print(f"   injected 20 txns")

    # S4: E0078 privilege escalation
    print("\n[S4] Privilege escalation — E0078")
    s4_txn = [{
        "transaction_id": "TXN-S4-001",
        "timestamp": "2026-09-26 22:45:00",
        "from_account": accounts[50], "to_account": accounts[51],
        "amount": 480000, "transaction_type": "TRANSFER",
        "channel": "ONLINE", "employee_id": "E0078", "status": "SUCCESS",
    }]
    data["txn"] = pd.concat([data["txn"], pd.DataFrame(s4_txn)], ignore_index=True)
    print(f"   injected 1 txn")

    # S5: E0102 reconnaissance
    print("\n[S5] Reconnaissance — E0102")
    s5_acc = []
    rbase = datetime(2026, 9, 24, 14, 0, 0)
    for i in range(55):
        s5_acc.append({
            "log_id": f"LOG-S5-{i+1:03d}",
            "timestamp": (rbase + timedelta(seconds=i * 20)).strftime("%Y-%m-%d %H:%M:%S"),
            "employee_id": "E0102",
            "customer_id": f"C{(i % 100) + 1:05d}",
            "account_id": accounts[i % len(accounts)],
            "action": "VIEW", "device_id": "DEV-999", "ip_address": "10.0.0.99",
        })
    data["acc"] = pd.concat([data["acc"], pd.DataFrame(s5_acc)], ignore_index=True)
    print(f"   injected 55 access logs")

    # Save
    print()
    save(data["txn"], "transactions.csv")
    save(data["acc"], "access_logs.csv")
    save(data["ben"], "beneficiary_changes.csv")

    print("\nDONE. Now run: python scripts\\run_detection.py")


if __name__ == "__main__":
    main()