"""
DET-2: Circular Money-Flow Detector
Builds a directed graph of account -> account transfers, finds cycles A->B->C->A.
Works with columns: from_account, to_account, amount, timestamp, transaction_id
"""
import pandas as pd
import networkx as nx
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TXN_CSV = ROOT / "data" / "raw" / "transactions.csv"

MIN_AMOUNT = 50000  # ignore tiny txns
MAX_CYCLE_LEN = 5


def detect_circular():
    df = pd.read_csv(TXN_CSV, parse_dates=["timestamp"])
    df = df[df["status"].astype(str).str.upper() == "SUCCESS"]
    df = df[df["amount"] >= MIN_AMOUNT]

    G = nx.DiGraph()
    for _, row in df.iterrows():
        G.add_edge(row["from_account"], row["to_account"],
                   txn_id=row["transaction_id"],
                   amount=row["amount"],
                   ts=row["timestamp"])

    alerts = []
    seen = set()
    try:
        cycles = list(nx.simple_cycles(G))
    except Exception:
        cycles = []

    for cycle in cycles:
        if len(cycle) < 3 or len(cycle) > MAX_CYCLE_LEN:
            continue
        key = tuple(sorted(cycle))
        if key in seen:
            continue
        seen.add(key)

        # collect evidence
        ev_ids = []
        total = 0
        for i in range(len(cycle)):
            a = cycle[i]
            b = cycle[(i + 1) % len(cycle)]
            if G.has_edge(a, b):
                ev_ids.append(str(G[a][b]["txn_id"]))
                total += float(G[a][b]["amount"])

        alerts.append({
            "alert_type": "CIRCULAR_FLOW",
            "entity_type": "ACCOUNT",
            "entity_id": cycle[0],
            "risk_score": 25,
            "cycle": " -> ".join(cycle + [cycle[0]]),
            "cycle_length": len(cycle),
            "total_amount": total,
            "evidence_ids": ",".join(ev_ids),
        })

    return pd.DataFrame(alerts)


if __name__ == "__main__":
    out = detect_circular()
    print(f"[CIRCULAR] Found {len(out)} alerts")
    if len(out):
        print(out.head().to_string())
    out.to_csv(ROOT / "data" / "generated" / "alerts_circular.csv", index=False)