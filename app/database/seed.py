from datetime import datetime, timedelta
from app.database.database import SessionLocal, engine, Base
from app.models.employee import Employee
from app.models.customer import Customer
from app.models.account import Account
from app.models.beneficiary import Beneficiary
from app.models.permission import Permission
from app.models.access_log import AccessLog
from app.models.transaction import Transaction
from app.core.security import get_password_hash

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("Seeding database with guaranteed demo & baseline data...")

    # 1. Employees
    emp_demo = Employee(
        employee_code="EMP104",
        name="Sushant Kshirsagar",
        email="sushant.k@insightx.internal",
        hashed_password=get_password_hash("Password@123"),
        department="Operations",
        role="Analyst",
        branch="Mumbai Central",
        status="ACTIVE",
        risk_level="HIGH"
    )
    db.add(emp_demo)

    admin_emp = Employee(
        employee_code="EMP001",
        name="Admin User",
        email="admin@insightx.internal",
        hashed_password=get_password_hash("Admin@123"),
        department="Compliance",
        role="Admin",
        branch="Headquarters",
        status="ACTIVE",
        risk_level="LOW"
    )
    db.add(admin_emp)
    db.commit()

    # 2. Customer
    cust_demo = Customer(
        customer_code="CUST287",
        name="Apex Traders Corp",
        customer_type="BUSINESS",
        occupation="Import Export",
        industry="Logistics",
        city="Mumbai",
        country="India",
        risk_category="MEDIUM",
        expected_monthly_volume=200000.0
    )
    db.add(cust_demo)
    db.commit()

    # 3. Accounts
    acc_source = Account(
        account_number="ACC102",
        customer_id=cust_demo.id,
        account_type="BUSINESS",
        balance=1500000.0,
        status="ACTIVE"
    )
    acc_dest = Account(
        account_number="ACC789",
        customer_id=cust_demo.id,
        account_type="CURRENT",
        balance=500000.0,
        status="ACTIVE"
    )
    db.add_all([acc_source, acc_dest])
    db.commit()

    # 4. Permissions
    perm = Permission(
        employee_id=emp_demo.id,
        permission_type="TRANSFER",
        resource_type="ACCOUNT",
        resource_id=acc_source.id,
        granted_by="EMP001",
        status="ACTIVE"
    )
    db.add(perm)
    db.commit()

    # 5. Guaranteed Scenario Timeline Sequence
    base_time = datetime.utcnow() - timedelta(hours=2)

    # 10:31 - Employee Login
    log1 = AccessLog(
        employee_id=emp_demo.id,
        action="LOGIN",
        resource_type="SYSTEM",
        ip_address="192.168.1.55",
        device_id="DEV-MAC-09",
        timestamp=base_time
    )
    db.add(log1)

    # 10:34 - Customer Access
    log2 = AccessLog(
        employee_id=emp_demo.id,
        customer_id=cust_demo.id,
        account_id=acc_source.id,
        action="VIEW_CUSTOMER",
        resource_type="CUSTOMER",
        resource_id=cust_demo.id,
        ip_address="192.168.1.55",
        device_id="DEV-MAC-09",
        timestamp=base_time + timedelta(minutes=3)
    )
    db.add(log2)
    db.commit()

    # 10:37 - Beneficiary Created
    beneficiary = Beneficiary(
        beneficiary_code="BEN777",
        account_id=acc_source.id,
        beneficiary_name="Shadow Holding LLC",
        beneficiary_account="998877665544",
        bank_name="Global Trust Bank",
        created_by_employee_id=emp_demo.id,
        created_at=base_time + timedelta(minutes=6),
        status="ACTIVE"
    )
    db.add(beneficiary)
    db.commit()

    # 10:41 - Large Transfer
    tx = Transaction(
        transaction_code="TX-DEMO-001",
        source_account_id=acc_source.id,
        destination_account_id=acc_dest.id,
        beneficiary_id=beneficiary.id,
        employee_id=emp_demo.id,
        amount=840000.0,
        currency="INR",
        transaction_type="TRANSFER",
        channel="BRANCH",
        status="COMPLETED",
        description="High value urgent business wire transfer",
        timestamp=base_time + timedelta(minutes=10)
    )
    db.add(tx)
    db.commit()

    print("Database seeding completed successfully with demo scenario.")
    db.close()

if __name__ == "__main__":
    seed_database()