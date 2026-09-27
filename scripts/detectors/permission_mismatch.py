"""
DET-5: Permission / Profile Mismatch
- Employees whose role does NOT permit beneficiary modification but did one
- Employees whose txn amount exceeds 5x their peer-role average
"""
import pandas as pd
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TXN_CSV = ROOT / "data" / "raw" / "transactions.csv"
EMP_CSV = ROOT / "data" / "raw" / "employees.csv"
BEN_CSV = ROOT / "data" / "raw" / "beneficiary_changes.csv"

# roles not allowed to modify beneficiaries
RESTRICTED_ROLES = {"Teller", "Cashier", "Customer Service Officer", "Intern",
                    "Auditor", "IT Admin", "Compliance Officer"}


def detect_permission_mismatch():
    txn = pd.read_csv(TXN_CSV, low_memory=False) if TXN_CSV.exists() else pd.DataFrame()
    emp = pd.read_csv(EMP_CSV, low_memory=False) if EMP_CSV.exists() else pd.DataFrame()
    ben = pd.read_csv(BEN_CSV, low_memory=False) if BEN_CSV.exists() else pd.DataFrame()

    alerts = []

    # Rule A: role mismatch on beneficiary change
    if not ben.empty and not emp.empty:
        merged = ben.merge(emp[["employee_id", "role"]], on="employee_id", how="left")
        bad = merged[merged["role"].isin(RESTRICTED_ROLES)]
        for _, row in bad.iterrows():
            alerts.append({
                "alert_type": "PERMISSION_MISMATCH",
                "entity_type": "EMPLOYEE",
                "entity_id": row["employee_id"],
                "risk_score": 20,
                "reason": f"Role '{row['role']}' modified beneficiary",
                "evidence_ids": str(row.get("change_id", "")),
            })

    # Rule B: txn amount > 5x peer-role average
    if not txn.empty and not emp.empty:
        t = txn.merge(emp[["employee_id", "role"]], on="employee_id", how="left")
        peer_avg = t.groupby("role")["amount"].mean().to_dict()
        t["peer_avg"] = t["role"].map(peer_avg)
        t["ratio"] = t["amount"] / t["peer_avg"].replace(0, 1)
        outsized = t[t["ratio"] > 5]
        for _, row in outsized.iterrows():
            alerts.append({
                "alert_type": "PERMISSION_MISMATCH",
                "entity_type": "EMPLOYEE",
                "entity_id": row["employee_id"],
                "risk_score": 20,
                "reason": f"Amount {row['amount']:.0f} is {row['ratio']:.1f}x peer avg ({row['peer_avg']:.0f})",
                "evidence_ids": str(row["transaction_id"]),
            })

    return pd.DataFrame(alerts)


if __name__ == "__main__":
    out = detect_permission_mismatch()
    print(f"[PERM_MISMATCH] Found {len(out)} alerts")
    if len(out):
        print(out.head().to_string())
    out.to_csv(ROOT / "data" / "generated" / "alerts_permission.csv", index=False)