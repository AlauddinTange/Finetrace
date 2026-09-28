import subprocess
import sys
import os
import time


def run_project():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(root_dir, "frontend")

    # Determine paths based on OS
    is_windows = os.name == 'nt'

    # 1. Start Backend Uvicorn Server
    print("🚀 Starting FastAPI Backend on http://127.0.0.1:8000 ...")
    uvicorn_cmd = [sys.executable, "-m", "uvicorn", "app.main:app", "--reload", "--port", "8000"]
    backend_process = subprocess.Popen(uvicorn_cmd, cwd=root_dir)

    time.sleep(2)  # Brief delay to let backend bind port

    # 2. Start Frontend Vite Server
    print("🚀 Starting Vite React Frontend on http://localhost:5173 ...")
    npm_cmd = "npm.cmd" if is_windows else "npm"
    frontend_process = subprocess.Popen([npm_cmd, "run", "dev"], cwd=frontend_dir)

    try:
        backend_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\n🛑 Stopping FINTRACE services...")
        backend_process.terminate()
        frontend_process.terminate()


if __name__ == "__main__":
    run_project()