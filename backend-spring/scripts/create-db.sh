#!/usr/bin/env bash
# Creates PostgreSQL database 'internal_crm' if PostgreSQL is installed.
# Usage: ./scripts/create-db.sh

set -e
DB_NAME="${DB_NAME:-internal_crm}"

if command -v createdb &>/dev/null; then
  if createdb "$DB_NAME" 2>/dev/null; then
    echo "Database '$DB_NAME' created."
  else
    # Might already exist
    if psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
      echo "Database '$DB_NAME' already exists."
    else
      echo "Failed to create '$DB_NAME'. Check PostgreSQL is running and you have permission."
      exit 1
    fi
  fi
  exit 0
fi

# Common paths on macOS (Homebrew) and Linux
for dir in /opt/homebrew/opt/postgresql@16/bin /opt/homebrew/opt/postgresql@15/bin /opt/homebrew/opt/postgresql/bin /usr/local/opt/postgresql/bin /usr/lib/postgresql/*/bin; do
  if [[ -x "$dir/createdb" ]]; then
    "$dir/createdb" "$DB_NAME" 2>/dev/null && echo "Database '$DB_NAME' created." && exit 0
    echo "Database '$DB_NAME' may already exist or PostgreSQL may not be running."
    exit 0
  fi
done

echo "PostgreSQL 'createdb' not found. Options:"
echo "  1. Install PostgreSQL and add its bin to PATH, then run: createdb $DB_NAME"
echo "  2. Run Spring Boot with H2 (no install): mvn spring-boot:run -Dspring-boot.run.profiles=dev"
exit 1
