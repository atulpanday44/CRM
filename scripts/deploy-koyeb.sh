#!/usr/bin/env bash
# Deploy CRM backend to Koyeb from here.
#
# 1. Get KOYEB_TOKEN: https://app.koyeb.com/account/api
# 2. Create DB at app.koyeb.com → Create → Database → PostgreSQL, copy Connection URI
# 3. Run: KOYEB_TOKEN=xxx DATABASE_URL=postgresql://... SUPERADMIN_EMAIL=you@x.com SUPERADMIN_PASSWORD=secret ./scripts/deploy-koyeb.sh

set -e
cd "$(dirname "$0")/.."

if [ -z "$KOYEB_TOKEN" ]; then
  echo "Error: KOYEB_TOKEN required. Get it from https://app.koyeb.com/account/api"
  exit 1
fi
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL required. Create Postgres at app.koyeb.com, copy Connection URI"
  exit 1
fi
if [ -z "$SUPERADMIN_EMAIL" ] || [ -z "$SUPERADMIN_PASSWORD" ]; then
  echo "Error: SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD required"
  exit 1
fi

APP_NAME="crm"
GIT_REPO="https://github.com/atulpanday44/CRM"

echo "=== Deploying backend to Koyeb ==="
koyeb apps init "$APP_NAME" \
  --git "$GIT_REPO" \
  --git-branch main \
  --git-workdir backend-spring \
  --git-builder buildpack \
  --ports 8080:http \
  --env "DATABASE_URL=$DATABASE_URL" \
  --env "SPRING_PROFILES_ACTIVE=pg" \
  --env "SUPERADMIN_EMAIL=$SUPERADMIN_EMAIL" \
  --env "SUPERADMIN_PASSWORD=$SUPERADMIN_PASSWORD" \
  --token "$KOYEB_TOKEN" \
  --wait

echo ""
echo "=== Done. Get your backend URL at app.koyeb.com → crm app → Domains ==="
echo "Then: Deploy frontend on Vercel with VITE_API_URL=https://YOUR-BACKEND-URL/api"
