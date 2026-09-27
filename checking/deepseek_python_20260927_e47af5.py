import pandas as pd

txn = pd.read_csv('data/raw/transactions.csv', nrows=5)
acc = pd.read_csv('data/raw/accounts.csv', nrows=5)
emp = pd.read_csv('data/raw/employees.csv', nrows=5)

print("Transaction IDs sample:")
print(txn[['transaction_id', 'from_account', 'to_account', 'employee_id']].to_string())
print()
print("Account IDs sample:")
print(acc[['account_id', 'customer_id']].to_string())
print()
print("Employee IDs sample:")
print(emp[['employee_id', 'role']].to_string())

# Check if transaction accounts exist in accounts file
txn_all = pd.read_csv('data/raw/transactions.csv')
acc_all = pd.read_csv('data/raw/accounts.csv')

missing_from = ~txn_all['from_account'].isin(acc_all['account_id'])
missing_to = ~txn_all['to_account'].isin(acc_all['account_id'])

print()
print(f"Total transactions: {len(txn_all)}")
print(f"from_account not in accounts: {missing_from.sum()}")
print(f"to_account not in accounts:   {missing_to.sum()}")