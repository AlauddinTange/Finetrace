"""
FINTRACE — Detection Pipeline (DEBUG VERSION)
Usage:  python scripts/run_detection.py
"""
import sys
import traceback
from pathlib import Path

print(">>> START", flush=True)

ROOT = Path(__file__).resolve().parents[1]
print(f">>> ROOT = {ROOT}", flush=True)

GEN = ROOT / "data" / "generated"
GEN.mkdir(parents=True, exist_ok=True)
print(f">>> GEN = {GEN}", flush=True)

# Check required folders/files FIRST
for p in [
    ROOT / "scripts" / "detectors" / "__init__.py",
    ROOT / "scripts" / "fusion" / "__init__.py",
    ROOT / "data" / "raw" / "transactions.csv",
]:
    print(f">>> checking {p}  ->  exists={p.exists()}", flush=True)

sys.path.insert(0, str(ROOT))

def try_import(name):
    try:
        mod = __import__(name, fromlist=["*"])
        print(f">>> imported {name} OK", flush=True)
        return mod
    except Exception as e:
        print(f">>> IMPORT FAILED for {name}:", flush=True)
        traceback.print_exc()
        sys.exit(1)

try_import("scripts.detectors.splitting")
try_import("scripts.detectors.circular")
try_import("scripts.detectors.isolation_forest_emp")
try_import("scripts.detectors.permission_mismatch")
try_import("scripts.detectors.recon")
try_import("scripts.fusion.risk_fusion")

from scripts.detectors.splitting import detect_splitting
from scripts.detectors.circular import detect_circular
from scripts.detectors.isolation_forest_emp import detect_iforest
from scripts.detectors.permission_mismatch import detect_permission_mismatch
from scripts.detectors.recon import detect_recon
from scripts.fusion.risk_fusion import fuse

print("=" * 60, flush=True)
print("FINTRACE — Detection Pipeline", flush=True)
print("=" * 60, flush=True)


def run_step(name, fn, outname):
    print(f"\n>>> RUNNING {name} ...", flush=True)
    try:
        df = fn()
        print(f">>> {name} returned {len(df)} rows", flush=True)
        outpath = GEN / outname
        df.to_csv(outpath, index=False)
        print(f">>> wrote {outpath}", flush=True)
    except Exception as e:
        print(f">>> ERROR in {name}: {e}", flush=True)
        traceback.print_exc()


run_step("Splitting", detect_splitting, "alerts_splitting.csv")
run_step("Circular", detect_circular, "alerts_circular.csv")
run_step("IsolationForest", detect_iforest, "alerts_iforest.csv")
run_step("PermissionMismatch", detect_permission_mismatch, "alerts_permission.csv")
run_step("Recon", detect_recon, "alerts_recon.csv")

print("\n>>> RUNNING Risk Fusion ...", flush=True)
try:
    final = fuse()
    print(f">>> Fusion returned {len(final)} alerts", flush=True)
except Exception as e:
    print(f">>> ERROR in Fusion: {e}", flush=True)
    traceback.print_exc()

print("\n" + "=" * 60, flush=True)
print("DONE.", flush=True)
print("=" * 60, flush=True)