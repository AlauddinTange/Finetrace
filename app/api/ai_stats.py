from fastapi import APIRouter
from pathlib import Path
import json

router = APIRouter()

ROOT = Path(__file__).resolve().parents[2]
BENCHMARK = ROOT / "data" / "generated" / "benchmark.json"


@router.get("/")
def get_ai_stats():
    bench = {}
    if BENCHMARK.exists():
        try:
            with open(BENCHMARK, "r", encoding="utf-8") as f:
                bench = json.load(f)
        except Exception:
            bench = {}

    return {
        "models": [
            {
                "name": "Isolation Forest",
                "type": "Unsupervised ML",
                "purpose": "Employee behavioral anomaly detection",
                "library": "scikit-learn",
            },
            {
                "name": "K-Means Peer Clustering",
                "type": "Unsupervised ML",
                "purpose": "Peer-group deviation detection (3σ threshold)",
                "library": "custom numpy implementation",
            },
            {
                "name": "Qwen 2.5 Coder 7B",
                "type": "Large Language Model",
                "purpose": "Evidence-grounded investigation narratives",
                "library": "Ollama (local)",
            },
            {
                "name": "LLM Fact-Verification",
                "type": "Deterministic validator",
                "purpose": "Rejects hallucinated claims in LLM output",
                "library": "custom regex + evidence cross-check",
            },
        ],
        "detectors": [
            "Transaction Splitting",
            "Circular Flow",
            "Isolation Forest",
            "Permission Mismatch",
            "Reconnaissance",
            "Peer-Group Deviation",
        ],
        "benchmark": bench.get("metrics", {}),
        "ground_truth_total": bench.get("ground_truth_total", 0),
    }