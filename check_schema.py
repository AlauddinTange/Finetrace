import pandas as pd
from pathlib import Path

files = [
    'data/raw/employees.csv',
    'data/raw/customers.csv',
    'data/raw/accounts.csv',
    'data/raw/devices.csv',
    'data/raw/transactions.csv',
    'data/raw/access_logs.csv',
    'data/raw/login_events.csv',
    'data/raw/permissions.csv',
    'data/raw/beneficiary_changes.csv',
    'data/ground_truth/scenario_labels.csv',
]

for f in files:
    p = Path(f)
    if p.exists():
        df = pd.read_csv(p, nrows=1)
        print(f)
        print(f'  cols: {list(df.columns)}')
        print()
    else:
        print(f'{f}  <- MISSING')
        print()