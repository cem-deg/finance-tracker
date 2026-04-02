#!/usr/bin/env python
"""Migrate existing expenses to have currency_code='USD'"""

import sqlite3
from app.database import SessionLocal
from app.models.expense import Expense
from app.config import settings

# Get database path from settings
db_path = settings.DATABASE_URL.replace("sqlite:///", "")

# Connect directly to SQLite to add the column
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check if column exists
    cursor.execute("PRAGMA table_info(expenses)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if 'currency_code' not in columns:
        print("Adding currency_code column to expenses table...")
        cursor.execute("ALTER TABLE expenses ADD COLUMN currency_code VARCHAR(3) NOT NULL DEFAULT 'USD'")
        conn.commit()
        print("✓ Column added successfully")
    else:
        print("✓ currency_code column already exists")
    
    # Verify
    cursor.execute("SELECT COUNT(*) FROM expenses")
    total = cursor.fetchone()[0]
    print(f"\n✓ Total expenses in database: {total}")
    
    # Show sample
    cursor.execute("SELECT id, amount, currency_code FROM expenses LIMIT 3")
    print("\nSample expenses:")
    for row in cursor.fetchall():
        print(f"  ID: {row[0]}, Amount: {row[1]}, Currency: {row[2]}")
        
except Exception as e:
    print(f"✗ Error: {e}")
    conn.rollback()
finally:
    cursor.close()
    conn.close()

