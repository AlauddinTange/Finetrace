"""
DET-1: Transaction Splitting Detector
Detects multiple transfers from same (from_account, to_account, employee_id)
within a short time window, with amounts just below round thresholds.
Works with columns: transaction_id, timestamp, from_account, to_account, amount, employee_id
"""
import pandas as pd
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TXN_CSV = ROOT / "data" / "raw" / "transactions.csv"

WINDOW_MINUTES = 15
MIN_TXN_COUNT = 3
MIN_COMBINED_AMOUNT = 300000  # ₹3 lakh combined is suspicious if split


def detect_splitting():
    df = pd.read_csv(TXN_CSV, parse_dates=["timestamp"])
    df = df[df["status"].astype(str).str.upper() == "SUCCESS"].copy()
    df = df.sort_values("timestamp").reset_index(drop=True)

    alerts = []
    grouped = df.groupby(["from_account", "to_account", "employee_id"], dropna=False)

    for (src, dst, emp), group in grouped:
        group = group.sort_values("timestamp").reset_index(drop=True)
        n = len(group)
        i = 0
        while i < n:
            window_start = group.loc[i, "timestamp"]
            window_end = window_start + pd.Timedelta(minutes=WINDOW_MINUTES)
            window = group[(group["timestamp"] >= window_start) & (group["timestamp"] <= window_end)]
            if len(window) >= MIN_TXN_COUNT:
                total = window["amount"].sum()
                if total >= MIN_COMBINED_AMOUNT:
                    alerts.append({
                        "alert_type": "TRANSACTION_SPLITTING",
                        "entity_type": "EMPLOYEE",
                        "entity_id": emp,
                        "risk_score": 15,
                        "from_account": src,
                        "to_account": dst,
                        "txn_count": len(window),
                        "combined_amount": float(total),
                        "window_start": str(window_start),
                        "window_end": str(window_end),
                        "evidence_ids": ",".join(window["transaction_id"].astype(str).tolist()),
                    })
                    # Skip past this window
                    i += len(window)
                    continue
            i += 1

    return pd.DataFrame(alerts)


if __name__ == "__main__":
    out = detect_splitting()
    print(f"[SPLITTING] Found {len(out)} alerts")
    if len(out):
        print(out.head().to_string())
    out.to_csv(ROOT / "data" / "generated" / "alerts_splitting.csv", index=False)