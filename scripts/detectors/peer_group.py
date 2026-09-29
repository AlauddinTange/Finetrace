"""
DET-4: K-Means Peer-Group Clustering (no sklearn — pure numpy)
Groups employees by behavioral features, flags >3σ deviations from cluster centroid.
Second ML model in FINTRACE.
"""
import numpy as np
import pandas as pd
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TXN_CSV = ROOT / "data" / "raw" / "transactions.csv"
ACC_CSV = ROOT / "data" / "raw" / "access_logs.csv"
EMP_CSV = ROOT / "data" / "raw" / "employees.csv"

SEED = 42
N_CLUSTERS = 5
SIGMA_THRESHOLD = 3.0
MAX_ITER = 100


def _safe_read(path):
    if not path.exists():
        return pd.DataFrame()
    return pd.read_csv(path, low_memory=False)


def _kmeans(X, k, seed=42, max_iter=100):
    """Minimal K-Means. X: (n_samples, n_features) numpy array."""
    rng = np.random.default_rng(seed)
    n = X.shape[0]
    # K-Means++ init
    idx = rng.choice(n, 1, replace=False)
    centers = X[idx]
    for _ in range(k - 1):
        d2 = np.min(
            np.sum((X[:, None, :] - centers[None, :, :]) ** 2, axis=2), axis=1
        )
        probs = d2 / d2.sum()
        idx = rng.choice(n, 1, p=probs)
        centers = np.vstack([centers, X[idx]])

    labels = np.zeros(n, dtype=int)
    for _ in range(max_iter):
        dists = np.sum((X[:, None, :] - centers[None, :, :]) ** 2, axis=2)
        new_labels = np.argmin(dists, axis=1)
        if np.array_equal(new_labels, labels):
            break
        labels = new_labels
        for i in range(k):
            pts = X[labels == i]
            if len(pts):
                centers[i] = pts.mean(axis=0)
    return labels, centers


def _standardize(X):
    mu = X.mean(axis=0)
    sd = X.std(axis=0)
    sd[sd == 0] = 1.0
    return (X - mu) / sd


def detect_peer_group():
    txn = _safe_read(TXN_CSV)
    acc = _safe_read(ACC_CSV)
    emp = _safe_read(EMP_CSV)

    if txn.empty or acc.empty or emp.empty:
        print("   missing input CSVs")
        return pd.DataFrame()

    txn_feat = txn.groupby("employee_id").agg(
        txn_count=("transaction_id", "count"),
        txn_total=("amount", "sum"),
        txn_avg=("amount", "mean"),
        txn_max=("amount", "max"),
    ).reset_index()

    acc_feat = acc.groupby("employee_id").agg(
        access_count=("log_id", "count"),
        distinct_accounts=("account_id", "nunique"),
        distinct_customers=("customer_id", "nunique"),
    ).reset_index()

    feat = txn_feat.merge(acc_feat, on="employee_id", how="outer").fillna(0)
    feat = feat.merge(emp[["employee_id", "role"]], on="employee_id", how="left")
    feat["role"] = feat["role"].fillna("Unknown")

    features = ["txn_count", "txn_total", "txn_avg", "txn_max",
                "access_count", "distinct_accounts", "distinct_customers"]

    X = feat[features].values.astype(float)
    X_std = _standardize(X)

    k = min(N_CLUSTERS, max(2, len(feat) // 10))
    labels, _ = _kmeans(X_std, k, seed=SEED, max_iter=MAX_ITER)
    feat["cluster"] = labels

    anomalies = []
    for cluster_id in feat["cluster"].unique():
        cluster_df = feat[feat["cluster"] == cluster_id]
        if len(cluster_df) < 5:
            continue
        cluster_mean = cluster_df[features].mean()
        cluster_std = cluster_df[features].std().replace(0, 1)

        for _, row in cluster_df.iterrows():
            z_scores = (row[features] - cluster_mean) / cluster_std
            max_z = float(z_scores.abs().max())
            worst_feature = features[int(z_scores.abs().values.argmax())]

            if max_z >= SIGMA_THRESHOLD:
                anomalies.append({
                    "alert_type": "PEER_GROUP_DEVIATION",
                    "entity_type": "EMPLOYEE",
                    "entity_id": row["employee_id"],
                    "risk_score": 30,
                    "cluster": int(cluster_id),
                    "max_z_score": round(max_z, 2),
                    "worst_feature": worst_feature,
                    "role": row["role"],
                    "evidence_ids": "",
                })

    return pd.DataFrame(anomalies)


if __name__ == "__main__":
    out = detect_peer_group()
    print(f"[PEER_GROUP] Found {len(out)} deviations")
    if len(out):
        print(out.head().to_string())
    out.to_csv(ROOT / "data" / "generated" / "alerts_peer_group.csv", index=False)