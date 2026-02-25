#!/bin/sh
# Convert DATABASE_URL (postgresql://user:pass@host:port/db) to Spring DB_* vars
if [ -n "$DATABASE_URL" ] && [ -z "$DB_URL" ]; then
  # postgresql://user:password@host:port/database -> jdbc:postgresql://host:port/database
  # Extract host:port/database part (after @)
  PART=$(echo "$DATABASE_URL" | sed -n 's|postgresql://[^@]*@\(.*\)|\1|p')
  export DB_URL="jdbc:postgresql://$PART"
  # Extract user (before first :)
  export DB_USERNAME=$(echo "$DATABASE_URL" | sed -n 's|postgresql://\([^:]*\):.*|\1|p')
  # Extract password (between first : and @)
  export DB_PASSWORD=$(echo "$DATABASE_URL" | sed -n 's|postgresql://[^:]*:\([^@]*\)@.*|\1|p')
fi
exec java -jar app.jar
