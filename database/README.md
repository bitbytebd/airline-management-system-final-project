# Database Setup

## Database

- Name: `airway`
- Engine: MySQL
- Tested dump source: MySQL 8.0.45

## GitHub-Safe Files

- `schema.sql`: schema-only export with tables, keys, indexes, and constraints where present.

The original local dump `airway-database.sql` is intentionally excluded from Git because it contains exported data, including user, passenger, payment, booking, profile, and operational records.

## Import Order

1. Create the database:

```sql
CREATE DATABASE airway;
```

2. Import the schema:

```bash
mysql -u your_mysql_username -p airway < database/schema.sql
```

3. Optionally add safe fictional demo data locally.

4. Configure backend database environment variables:

```text
DB_URL=jdbc:mysql://localhost:3306/airway?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
JWT_SECRET=change_me_to_a_long_random_secret
```

Do not commit full production dumps, personal passenger data, payment records, password hashes, generated invoices, generated vouchers, generated tickets, or local MySQL internal files.
