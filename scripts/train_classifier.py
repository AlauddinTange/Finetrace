"""
FINTRACE — Supervised Classifier Training
Trains a RandomForest on employee behavioral features to predict fraud.
Uses labeled scenario data (ground truth) with proper train/test split.
Outputs real accuracy metrics.
"""
import json
import pickle
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, confusion_matrix
)

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
GT = ROOT / "data" / "ground_truth"
OUT = ROOT / "data" / "generated"
OUT.mkdir(parents=True, exist_ok=True)

SEED = 42
TEST_SIZE = 0.2


def build_features():
    """One row per employee with behavioral features + label."""
    txn = pd.read_csv(RAW / "transactions.csv", low_memory=False)
    acc = pd.read_csv(RAW / "access_logs.csv", low_memory=False)
    emp = pd.read_csv(RAW / "employees.csv")
    gt = pd.read_csv(GT / "scenario_labels.csv")

    # Employee-level transaction features
    txn_feat = txn.groupby("employee_id").agg(
        txn_count=("transaction_id", "count"),
        txn_total=("amount", "sum"),
        txn_avg=("amount", "mean"),
        txn_max=("amount", "max"),
        txn_std=("amount", "std"),
    ).reset_index()

    # Employee-level access features
    acc_feat = acc.groupby("employee_id").agg(
        access_count=("log_id", "count"),
        distinct_accounts=("account_id", "nunique"),
        distinct_customers=("customer_id", "nunique"),
    ).reset_index()

    feat = txn_feat.merge(acc_feat, on="employee_id", how="outer").fillna(0)
    feat = feat.merge(emp[["employee_id", "role"]], on="employee_id", how="left")

    # Label: 1 if the employee appears in ground truth as suspicious
    suspicious_emp = set(
        gt[(gt["entity_type"] == "EMPLOYEE") & (gt["is_suspicious"] == 1)]["entity_id"]
    )
    # Also mark employees who appear as evidence in suspicious transactions
    # (transactions.csv employees involved in suspicious txn IDs)
    suspect_txns = set(
        gt[(gt["entity_type"] == "transaction") & (gt["is_suspicious"] == 1)]["entity_id"]
    )
    txn_emp = txn[txn["transaction_id"].isin(suspect_txns)]["employee_id"].dropna().unique()
    suspicious_emp.update(txn_emp)

    feat["label"] = feat["employee_id"].isin(suspicious_emp).astype(int)

    return feat


def train():
    print("=" * 60)
    print("FINTRACE — Training Supervised Classifier")
    print("=" * 60)

    feat = build_features()
    print(f"\nDataset: {len(feat)} employees")
    print(f"Positive (suspicious): {feat['label'].sum()}")
    print(f"Negative (normal):     {(feat['label'] == 0).sum()}")

    feature_cols = [
        "txn_count", "txn_total", "txn_avg", "txn_max", "txn_std",
        "access_count", "distinct_accounts", "distinct_customers",
    ]

    X = feat[feature_cols].values
    y = feat["label"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=SEED, stratify=y
    )

    print(f"\nTrain set: {len(X_train)}   Test set: {len(X_test)}")

    model = RandomForestClassifier(
        n_estimators=200, max_depth=10, random_state=SEED, class_weight="balanced"
    )
    model.fit(X_train, y_train)

    # Predictions on test set
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    # Cross-validation on full set
    cv_scores = cross_val_score(model, X, y, cv=5, scoring="accuracy")

    metrics = {
        "dataset_size": int(len(feat)),
        "train_size": int(len(X_train)),
        "test_size": int(len(X_test)),
        "positive_class": int(y.sum()),
        "negative_class": int((y == 0).sum()),
        "model": "RandomForestClassifier",
        "hyperparameters": {
            "n_estimators": 200,
            "max_depth": 10,
            "class_weight": "balanced",
        },
        "test_metrics": {
            "accuracy":  round(float(accuracy_score(y_test, y_pred)), 4),
            "precision": round(float(precision_score(y_test, y_pred, zero_division=0)), 4),
            "recall":    round(float(recall_score(y_test, y_pred, zero_division=0)), 4),
            "f1":        round(float(f1_score(y_test, y_pred, zero_division=0)), 4),
            "roc_auc":   round(float(roc_auc_score(y_test, y_proba)), 4),
        },
        "cross_validation": {
            "folds": 5,
            "accuracy_mean": round(float(cv_scores.mean()), 4),
            "accuracy_std":  round(float(cv_scores.std()), 4),
        },
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
        "feature_importances": {
            col: round(float(imp), 4)
            for col, imp in zip(feature_cols, model.feature_importances_)
        },
    }

    # Save
    metrics_path = OUT / "model_metrics.json"
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    model_path = OUT / "fintrace_classifier.pkl"
    with open(model_path, "wb") as f:
        pickle.dump({"model": model, "features": feature_cols}, f)

    print("\n" + "=" * 60)
    print("RESULTS")
    print("=" * 60)
    print(f"Accuracy:   {metrics['test_metrics']['accuracy']}")
    print(f"Precision:  {metrics['test_metrics']['precision']}")
    print(f"Recall:     {metrics['test_metrics']['recall']}")
    print(f"F1:         {metrics['test_metrics']['f1']}")
    print(f"ROC-AUC:    {metrics['test_metrics']['roc_auc']}")
    print(f"CV Accuracy (5-fold): {metrics['cross_validation']['accuracy_mean']} ± {metrics['cross_validation']['accuracy_std']}")
    print(f"\nSaved: {metrics_path}")
    print(f"Saved: {model_path}")


if __name__ == "__main__":
    train()