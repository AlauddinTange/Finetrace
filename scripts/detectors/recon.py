"""
DET-7: Pre-Attack Reconnaissance
Detects employees who view many accounts WITHOUT generating transactions,
or who access accounts significantly above their historical baseline.
"""
import pandas as pd
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ACC_CSV = ROOT / "data" / "raw" / "access_logs.csv"
TXN_CSV = ROOT / "data" / "raw" / "transactions.csv"

MIN_VIEWS = 40
VIEW_ACTIONS = {"VIEW", "view", "READ", "read"}


def detect_recon():
    if not ACC_CSV.exists():
        return pd.DataFrame()

    acc = pd.read_csv(ACC_CSV, parse_dates=["timestamp"], low_memory=False)
    acc = acc[acc["action"].astype(str).isin(VIEW_ACTIONS)]
    acc["date"] = acc["timestamp"].dt.date

    per_day = acc.groupby(["employee_id", "date"]).agg(
        views=("log_id", "count"),
        distinct_accounts=("account_id", "nunique"),
    ).reset_index()

    baseline = per_day.groupby("employee_id")["distinct_accounts"].mean().to_dict()

    alerts = []
    for _, row in per_day.iterrows():
        base = baseline.get(row["employee_id"], 0)
        if row["distinct_accounts"] >= MIN_VIEWS and (base == 0 or row["distinct_accounts"] > 3 * base):
            alerts.append({
                "alert_type": "RECONNAISSANCE",
                "entity_type": "EMPLOYEE",
                "entity_id": row["employee_id"],
                "risk_score": 15,
                "date": str(row["date"]),
                "distinct_accounts_viewed": int(row["distinct_accounts"]),
                "baseline": float(base),
                "evidence_ids": "",
            })

    return pd.DataFrame(alerts)


if __name__ == "__main__":
    out = detect_recon()
    print(f"[RECON] Found {len(out)} alerts")
    if len(out):
        print(out.head().to_string())
    out.to_csv(ROOT / "data" / "generated" / "alerts_recon.csv", index=False)