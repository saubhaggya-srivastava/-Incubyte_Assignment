# Database Setup Guide

## PostgreSQL Installation

### Windows

1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Default port is 5432

### macOS

```bash
# Using Homebrew
brew install postgresql@14
brew services start postgresql@14
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Database Creation

1. Open PostgreSQL command line (psql):

```bash
# Windows: Use SQL Shell (psql) from Start Menu
# macOS/Linux:
psql -U postgres
```

2. Create the database:

```sql
CREATE DATABASE sweet_shop;
```

3. Create a user (optional, for better security):

```sql
CREATE USER sweet_shop_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE sweet_shop TO sweet_shop_user;
```

4. Exit psql:

```sql
\q
```

## Environment Configuration

1. Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

2. Update the `DATABASE_URL` in `.env`:

```env
# If using default postgres user:
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/sweet_shop?schema=public"

# If using custom user:
DATABASE_URL="postgresql://sweet_shop_user:your_password@localhost:5432/sweet_shop?schema=public"
```

## Running Migrations

1. Install dependencies:

```bash
npm install
```

2. Generate Prisma Client:

```bash
npm run prisma:generate
```

3. Run migrations:

```bash
npm run migrate:dev
```

This will:

- Create the database tables (users, sweets)
- Apply all migrations
- Automatically run the seed script

## Seed Data

The seed script creates:

- **Admin user**:

  - Email: `admin@sweetshop.com`
  - Password: `admin123456`
  - Role: admin

- **Regular user**:

  - Email: `user@sweetshop.com`
  - Password: `user123456`
  - Role: user

- **Sample sweets**: 8 different sweets across various categories

To run the seed manually:

```bash
npm run seed
```

## Prisma Studio

To view and edit your database visually:

```bash
npm run prisma:studio
```

This opens a web interface at http://localhost:5555

## Troubleshooting

### Connection refused

- Make sure PostgreSQL is running
- Check if the port (5432) is correct
- Verify the username and password

### Permission denied

- Make sure the user has proper permissions on the database
- Try using the `postgres` superuser

### Migration failed

- Check if the database exists
- Verify the DATABASE_URL is correct
- Try resetting the database:
  ```bash
  npx prisma migrate reset
  ```

### Port already in use

- Change the PostgreSQL port in the connection string
- Or stop the process using port 5432

## Useful Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create a new migration
npm run migrate:dev -- --name migration_name

# Apply migrations in production
npm run migrate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio
npm run prisma:studio

# Run seed script
npm run seed
```
