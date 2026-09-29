from fastapi import APIRouter
from pathlib import Path
import json

router = APIRouter()

ROOT = Path(__file__).resolve().parents[2]
BENCHMARK = ROOT / "data" / "generated" / "benchmark.json"
MODEL_METRICS = ROOT / "data" / "generated" / "model_metrics.json"


def _read_json(path):
    if not path.exists():
        return {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


@router.get("/")
def get_ai_stats():
    bench = _read_json(BENCHMARK)
    model = _read_json(MODEL_METRICS)

    return {
        "models": [
            {
                "name": "Random Forest Classifier",
                "type": "Supervised ML",
                "purpose": "Employee fraud prediction (trained)",
                "library": "scikit-learn",
            },
            {
                "name": "Isolation Forest",
                "type": "Unsupervised ML",
                "purpose": "Employee behavioral anomaly detection",
                "library": "scikit-learn",
            },
            {
                "name": "K-Means Peer Clustering",
                "type": "Unsupervised ML",
                "purpose": "Peer-group deviation detection (3σ)",
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
        "trained_model": model,
    }