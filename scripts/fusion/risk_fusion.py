"""
Risk Fusion — merges all signals into unified alerts.
Skips empty detector outputs gracefully.
"""
import pandas as pd
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GEN = ROOT / "data" / "generated"


def tier(score):
    if score >= 85: return "CRITICAL"
    if score >= 60: return "HIGH"
    if score >= 30: return "MEDIUM"
    return "LOW"


def _safe_read(p: Path) -> pd.DataFrame:
    """Read a CSV, return empty df if missing or empty."""
    if not p.exists():
        return pd.DataFrame()
    if p.stat().st_size < 10:  # effectively empty
        return pd.DataFrame()
    try:
        return pd.read_csv(p)
    except Exception:
        return pd.DataFrame()


def fuse():
    files = [
        "alerts_splitting.csv",
        "alerts_circular.csv",
        "alerts_iforest.csv",
        "alerts_permission.csv",
        "alerts_recon.csv",
    ]
    frames = []
    for f in files:
        df = _safe_read(GEN / f)
        if len(df):
            print(f"   loaded {f}: {len(df)} rows")
            frames.append(df)
        else:
            print(f"   skipped {f}: empty or missing")

    if not frames:
        print("No signal files found.")
        return pd.DataFrame()

    all_signals = pd.concat(frames, ignore_index=True)

    grouped = all_signals.groupby(["entity_type", "entity_id"]).agg(
        signals=("alert_type", lambda x: list(set(x))),
        total_score=("risk_score", "sum"),
        evidence_ids=("evidence_ids", lambda x: ",".join(
            sorted(set(",".join(x.dropna().astype(str)).split(",")) - {""})
        )),
    ).reset_index()

    grouped["risk_score"] = grouped["total_score"].clip(upper=100)
    grouped["risk_level"] = grouped["risk_score"].apply(tier)
    grouped["signal_count"] = grouped["signals"].apply(len)
    grouped["explanation"] = grouped.apply(
        lambda r: f"{r['signal_count']} signal(s): " + ", ".join(r["signals"]),
        axis=1
    )
    grouped["alert_id"] = ["ALERT-" + str(i + 1).zfill(4) for i in range(len(grouped))]

    def counterfactual(row):
        if row["signal_count"] <= 1:
            return "Single-signal alert — removing it drops risk to LOW."
        per = row["total_score"] / row["signal_count"]
        return f"Removing any 1 signal drops score by ~{per:.0f} points."
    grouped["counterfactual"] = grouped.apply(counterfactual, axis=1)

    out = grouped[["alert_id", "entity_type", "entity_id", "risk_level",
                   "risk_score", "signal_count", "signals", "explanation",
                   "counterfactual", "evidence_ids"]]

    order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    out = out.sort_values(by="risk_level", key=lambda s: s.map(order)).reset_index(drop=True)

    out.to_csv(GEN / "alerts_final.csv", index=False)
    out.to_json(GEN / "alerts_final.json", orient="records", indent=2)
    return out


if __name__ == "__main__":
    out = fuse()
    print(f"\n[FUSION] Total unified alerts: {len(out)}")
    if len(out):
        print(out[["alert_id", "entity_type", "entity_id", "risk_level", "signal_count"]].head(15).to_string())