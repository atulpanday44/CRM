#!/usr/bin/env bash
# Run the CRM backend with PostgreSQL (profile=pg).
# Prerequisites: PostgreSQL installed (e.g. brew install postgresql@16).
# Creates DB if missing. On Homebrew, DB user is usually your Mac username (whoami).

set -e
cd "$(dirname "$0")/.."

export PATH="/opt/homebrew/opt/postgresql@16/bin:/opt/homebrew/opt/postgresql@15/bin:/opt/homebrew/opt/postgresql/bin:$PATH"
script_dir="$(dirname "$0")"
[ -f "$script_dir/create-db.sh" ] && "$script_dir/create-db.sh" || true

DB_URL="${DB_URL:-jdbc:postgresql://localhost:5432/internal_crm}"
DB_USERNAME="${DB_USERNAME:-$(whoami)}"
DB_PASSWORD="${DB_PASSWORD:-}"
JWT_SECRET="${JWT_SECRET:-your-256-bit-secret-change-in-production-must-be-at-least-32-chars}"

echo "Using DB: $DB_URL (user: $DB_USERNAME)"
DB_URL="$DB_URL" DB_USERNAME="$DB_USERNAME" DB_PASSWORD="$DB_PASSWORD" JWT_SECRET="$JWT_SECRET" mvn spring-boot:run -Dspring-boot.run.profiles=pg
