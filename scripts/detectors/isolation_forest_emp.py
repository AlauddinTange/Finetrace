"""
DET-3: Isolation Forest on Employee Daily Behaviour
Features per employee per day:
  - txns_count, avg_amount, max_amount
  - distinct_accounts_touched (from access_logs)
  - distinct_customers_touched
  - actions_count
"""
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.ensemble import IsolationForest

ROOT = Path(__file__).resolve().parents[2]
TXN_CSV = ROOT / "data" / "raw" / "transactions.csv"
ACC_CSV = ROOT / "data" / "raw" / "access_logs.csv"

CONTAMINATION = 0.05
SEED = 42


def _safe_read(path):
    if not path.exists():
        return pd.DataFrame()
    return pd.read_csv(path, parse_dates=["timestamp"], low_memory=False)


def detect_iforest():
    txn = _safe_read(TXN_CSV)
    acc = _safe_read(ACC_CSV)

    if txn.empty or acc.empty:
        return pd.DataFrame()

    txn["date"] = txn["timestamp"].dt.date
    acc["date"] = acc["timestamp"].dt.date

    txn_agg = txn.groupby(["employee_id", "date"]).agg(
        txns_count=("transaction_id", "count"),
        avg_amount=("amount", "mean"),
        max_amount=("amount", "max"),
        total_amount=("amount", "sum"),
    ).reset_index()

    acc_agg = acc.groupby(["employee_id", "date"]).agg(
        actions_count=("log_id", "count"),
        distinct_accounts=("account_id", "nunique"),
        distinct_customers=("customer_id", "nunique"),
    ).reset_index()

    feat = txn_agg.merge(acc_agg, on=["employee_id", "date"], how="outer").fillna(0)

    if len(feat) < 20:
        return pd.DataFrame()

    X = feat[["txns_count", "avg_amount", "max_amount", "total_amount",
              "actions_count", "distinct_accounts", "distinct_customers"]].values

    model = IsolationForest(contamination=CONTAMINATION, random_state=SEED)
    preds = model.fit_predict(X)
    scores = -model.score_samples(X)  # higher = more anomalous

    feat["anomaly"] = preds  # -1 = anomaly
    feat["anomaly_score"] = scores
    anomalies = feat[feat["anomaly"] == -1].copy()

    alerts = []
    for _, row in anomalies.iterrows():
        alerts.append({
            "alert_type": "ML_EMPLOYEE_ANOMALY",
            "entity_type": "EMPLOYEE",
            "entity_id": row["employee_id"],
            "risk_score": 35,
            "date": str(row["date"]),
            "anomaly_score": float(row["anomaly_score"]),
            "txns_count": int(row["txns_count"]),
            "distinct_accounts": int(row["distinct_accounts"]),
            "avg_amount": float(row["avg_amount"]),
            "evidence_ids": "",
        })

    return pd.DataFrame(alerts)


if __name__ == "__main__":
    out = detect_iforest()
    print(f"[IFOREST] Found {len(out)} anomalous employee-days")
    if len(out):
        print(out.head().to_string())
    out.to_csv(ROOT / "data" / "generated" / "alerts_iforest.csv", index=False)