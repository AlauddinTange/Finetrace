"""
FINTRACE — Benchmark
Compares detection alerts against ground-truth labels.
Outputs precision, recall, F1, FPR.
"""
import re
import json
import pandas as pd
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GT_CSV = ROOT / "data" / "ground_truth" / "scenario_labels.csv"
ALERTS_CSV = ROOT / "data" / "generated" / "alerts_final.csv"
OUT_JSON = ROOT / "data" / "generated" / "benchmark.json"


def extract_txn_ids(evidence_str):
    """Pull all transaction IDs (T####### or TXN-xxx) from an evidence string."""
    if not isinstance(evidence_str, str):
        return set()
    return set(re.findall(r"TXN-[A-Z0-9\-]+|T\d{7}", evidence_str))


def main():
    if not GT_CSV.exists():
        print(f"Missing: {GT_CSV}")
        return
    if not ALERTS_CSV.exists():
        print(f"Missing: {ALERTS_CSV}")
        return

    gt = pd.read_csv(GT_CSV)
    alerts = pd.read_csv(ALERTS_CSV)

    # Only transaction-level labels
    txn_gt = gt[gt["entity_type"] == "transaction"].copy()
    txn_gt["entity_id"] = txn_gt["entity_id"].astype(str)

    suspicious_ids = set(txn_gt[txn_gt["is_suspicious"] == 1]["entity_id"])
    legit_ids      = set(txn_gt[txn_gt["is_suspicious"] == 0]["entity_id"])

    # All txn IDs referenced in any alert's evidence
    detected_ids = set()
    for ev in alerts["evidence_ids"].fillna(""):
        detected_ids.update(extract_txn_ids(ev))

    # Also mark the alert's own entity_id if it looks like a txn
    for eid in alerts["entity_id"].fillna("").astype(str):
        if re.match(r"^T\d{7}$", eid) or eid.startswith("TXN-"):
            detected_ids.add(eid)

    # Confusion matrix (transaction level)
    TP = len(suspicious_ids & detected_ids)
    FN = len(suspicious_ids - detected_ids)
    FP = len(legit_ids & detected_ids)
    TN = len(legit_ids - detected_ids)

    precision = TP / (TP + FP) if (TP + FP) else 0.0
    recall    = TP / (TP + FN) if (TP + FN) else 0.0
    f1        = 2 * precision * recall / (precision + recall) if (precision + recall) else 0.0
    fpr       = FP / (FP + TN) if (FP + TN) else 0.0
    accuracy  = (TP + TN) / (TP + TN + FP + FN) if (TP + TN + FP + FN) else 0.0

    result = {
        "ground_truth_total":     int(len(txn_gt)),
        "suspicious_total":       len(suspicious_ids),
        "legit_total":            len(legit_ids),
        "alerts_total":           int(len(alerts)),
        "detected_txn_ids":       len(detected_ids),
        "confusion_matrix": {
            "TP": TP, "FP": FP, "FN": FN, "TN": TN,
        },
        "metrics": {
            "precision": round(precision, 4),
            "recall":    round(recall, 4),
            "f1":        round(f1, 4),
            "fpr":       round(fpr, 4),
            "accuracy":  round(accuracy, 4),
        },
    }

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    # Print
    print("=" * 60)
    print("FINTRACE — Benchmark Results")
    print("=" * 60)
    print(f"Ground truth txns:     {result['ground_truth_total']}")
    print(f"Suspicious:            {result['suspicious_total']}")
    print(f"Legit:                 {result['legit_total']}")
    print(f"Alerts generated:      {result['alerts_total']}")
    print(f"Txn IDs in alerts:     {result['detected_txn_ids']}")
    print()
    print(f"True Positives:        {TP}")
    print(f"False Positives:       {FP}")
    print(f"False Negatives:       {FN}")
    print(f"True Negatives:        {TN}")
    print()
    print(f"Precision:             {precision:.4f}")
    print(f"Recall:                {recall:.4f}")
    print(f"F1 Score:              {f1:.4f}")
    print(f"False Positive Rate:   {fpr:.4f}")
    print(f"Accuracy:              {accuracy:.4f}")
    print()
    print(f"Saved: {OUT_JSON}")


if __name__ == "__main__":
    main()