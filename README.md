# FINTRACE

**Financial Crime & Insider Risk Intelligence Platform**

---

## What It Is

FINTRACE is a hybrid investigation platform that connects fragmented banking
events — employees, permissions, customers, accounts, transactions, devices,
and access logs — into a single investigation graph.

It runs 5 detection engines (transaction splitting, circular flow, employee
anomaly, permission mismatch, reconnaissance) and fuses their outputs into
explainable, tiered alerts backed by evidence IDs.

**Core design principle:**
> Pattern → Context → Correlation → Evidence → Priority → Explanation → Human decides.
> The platform assists. The investigator makes the final call.

Built for a fictional demo bank (**Aegis Bank**). No real customer or bank
data is used at any point.

---

## The 10 Unique Differentiators

1. **Counterfactual explanations** — "What would have cleared this alert?"
2. **Collusion detection** — Employee↔employee graph
3. **Pre-attack reconnaissance** — Fires BEFORE money moves
4. **Missing controls** — Approval bypass detection (audit-grade)
5. **Legitimate-pattern library** — 15 known-legit banking patterns
6. **Dual-role workflow** — Fraud view + Insider-risk view
7. **LLM fact-verification** — Every claim tied to an evidence_id
8. **Live bank simulator** — Real-time event stream
9. **SAR auto-drafting** — PMLA / FinCEN format ready
10. **Ground-truth benchmark** — 10,000 labeled scenarios

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11 · FastAPI · SQLAlchemy |
| Database | SQLite (dev) · PostgreSQL (prod-ready) |
| ML | scikit-learn (Isolation Forest) |
| Graph | NetworkX |
| Frontend | React 18 · TypeScript · Tailwind CSS · Recharts · ReactFlow |
| LLM | RAG-grounded explanations (Ollama- Qwen2.5-coder:7b compatible) |

---

## Repo Structure
Finetrace/
├── app/ # FastAPI backend
│ ├── api/ # Route handlers
│ ├── core/ # Config, security, logging
│ ├── database/ # SQLAlchemy setup
│ ├── detection/ # Detection algorithms
│ ├── graph/ # Graph engine
│ ├── models/ # ORM models
│ ├── schemas/ # Pydantic schemas
│ ├── services/ # Business logic
│ └── main.py # App entrypoint
│
├── scripts/
│ ├── detectors/ # Standalone detector scripts
│ ├── fusion/ # Risk fusion engine
│ ├── generators/ # Synthetic data generators
│ ├── seed_user.py # Seed test login
│ └── run_detection.py # Run full pipeline
│
├── frontend/ # React + Vite + Tailwind
│ ├── src/
│ │ ├── api/ # Axios client
│ │ ├── components/ # Reusable UI
│ │ ├── pages/ # Route pages
│ │ └── types/ # TS types
│ └── package.json
│
├── data/ # Not committed (see below)
├── config/
│ └── roles.json # 12 role definitions
├── requirements.txt
└── README.md

text

---

## Setup & Run

### Prerequisites

- Python 3.11+
- Node.js 18+
- Git

### 1. Clone

```bash
git clone https://github.com/AlauddinTange/Finetrace.git
cd Finetrace
2. Python dependencies
bash
pip install -r requirements.txt
pip install python-multipart python-jose[cryptography] passlib[bcrypt] bcrypt==4.0.1 email-validator uvicorn
3. Generate the synthetic dataset
The dataset is not committed to the repo (see Note on data below).
Regenerate it in ~30 seconds:

bash
python scripts/generators/generate_employees.py
python scripts/generators/generate_customers.py
python scripts/generators/generate_accounts.py
python scripts/generators/generate_devices.py
python scripts/generators/generate_beneficiaries.py
This creates ~50K rows across data/raw/.

4. Seed the login user
bash
python scripts/seed_user.py
Creates admin@aegisbank.in / admin123.

5. Run the detection pipeline
bash
python scripts/run_detection.py
Output lands in data/generated/:

alerts_splitting.csv

alerts_circular.csv

alerts_iforest.csv

alerts_permission.csv

alerts_recon.csv

alerts_final.csv ← unified alerts

alerts_final.json

6. Start the backend
bash
python -m uvicorn app.main:app --reload --port 8000
API docs: http://127.0.0.1:8000/docs

7. Start the frontend
In a new terminal:

bash
cd frontend
npm install
npm run dev
Open http://localhost:5173

8. Login
text
Email:    admin@aegisbank.in
Password: admin123
Note on Data
The data/ folder (raw CSVs + generated alerts) is not included in this
repository.

Reason: the synthetic dataset is large (~250 MB across 10 CSVs) and would
exceed GitHub's per-file and total-repo soft limits, slow down cloning, and
trip the platform's large-file warnings. 

All data is 100% reproducible. Every CSV is generated deterministically
by the scripts in scripts/generators/ with a fixed random seed (SEED=42).
Running the commands in Step 3 above reconstructs the exact dataset used
in our demo — same employees, same transactions, same anomaly patterns.

If a reviewer needs the pre-generated CSVs for evaluation without running the
scripts, they are available on request via the project's Google Drive folder
or by re-running the generators.

Detection Engine
Detector	Method	Output
Transaction Splitting	15-min sliding window, ≥3 txns, ₹3L+ combined	alerts_splitting.csv
Circular Flow	NetworkX simple_cycles, up to length 5	alerts_circular.csv
Employee Anomaly	Isolation Forest on 7 features per employee-day	alerts_iforest.csv
Permission Mismatch	Role vs action + 5× peer-average amount	alerts_permission.csv
Reconnaissance	40+ accounts viewed without transactions	alerts_recon.csv
Risk Fusion	Weighted evidence combination → tiers	alerts_final.json
Risk tiers: LOW · MEDIUM · HIGH · CRITICAL

API Endpoints
Method	Path	Purpose
POST	/api/v1/auth/login	JWT login
GET	/api/v1/auth/me	Current user
GET	/api/v1/alerts/	List alerts
GET	/api/v1/alerts/{id}	Alert detail
GET	/api/v1/employees/	List employees
GET	/api/v1/customers/	List customers
GET	/api/v1/accounts/	List accounts
GET	/api/v1/transactions/	List transactions
GET	/api/v1/cases/	List cases
GET	/api/v1/dashboard/	Dashboard KPIs
Full interactive docs at /docs after starting the backend.

Team

Sushmita Kirar — Backend

Alauddin Tange — AI & ML

Sarthak Rasal — Frontend

Ravikisan Sharma — Data & Benchmarking

License
Built for personal use.

No real customer, employee, or banking data was used in the making of this
project. "Aegis Bank" is a fictional entity created solely for the demo.

Credits every team member

