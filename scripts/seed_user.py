import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

"""
Seed one test employee so you can log in.
"""
from app.database.database import SessionLocal
from app.models.employee import Employee
from app.core.security import get_password_hash


def seed():
    db = SessionLocal()
    email = "admin@aegisbank.in"
    password = "admin123"

    existing = db.query(Employee).filter(Employee.email == email).first()
    if existing:
        existing.hashed_password = get_password_hash(password)
        print(f"Updated password for {email}")
    else:
        emp = Employee(
            employee_code="E0001",
            name="Admin Investigator",
            email=email,
            hashed_password=get_password_hash(password),
            department="Compliance",
            role="Admin",
            branch="BR001",
            risk_level="LOW",
        )
        db.add(emp)
        print(f"Created {email}")

    db.commit()
    db.close()
    print("\nLogin credentials:")
    print(f"   Email:    {email}")
    print(f"   Password: {password}")


if __name__ == "__main__":
    seed()