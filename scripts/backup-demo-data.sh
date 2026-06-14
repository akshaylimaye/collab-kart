#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${DEMO_BACKUP_DIR:-$ROOT_DIR/seed-data/demo-backup}"
DB_DUMP="$BACKUP_DIR/db/collabkart-demo.dump"
UPLOAD_BACKUP_DIR="$BACKUP_DIR/uploads"
MANIFEST="$BACKUP_DIR/manifest.txt"

PGADMIN_PG_BIN="/Applications/pgAdmin 4.app/Contents/SharedSupport"
if [[ -d "$PGADMIN_PG_BIN" ]]; then
  PATH="$PATH:$PGADMIN_PG_BIN"
fi

if [[ -f "$ROOT_DIR/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.env"
  set +a
fi

DB_URL="${DB_URL:-jdbc:postgresql://localhost:5432/collabKartdb}"
DB_USERNAME="${DB_USERNAME:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-abc@1234}"
UPLOAD_DIR="${APP_UPLOAD_DIR:-$ROOT_DIR/uploads}"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

parse_jdbc_url() {
  local clean="${DB_URL#jdbc:postgresql://}"
  clean="${clean%%\?*}"
  DB_HOST="${clean%%/*}"
  DB_NAME="${clean#*/}"
  if [[ "$DB_HOST" == *:* ]]; then
    DB_PORT="${DB_HOST##*:}"
    DB_HOST="${DB_HOST%:*}"
  else
    DB_PORT="5432"
  fi
}

assert_local_dev_db() {
  parse_jdbc_url
  local db_name_lc
  db_name_lc="$(printf '%s' "$DB_NAME" | tr '[:upper:]' '[:lower:]')"

  if [[ "$DB_HOST" != "localhost" && "$DB_HOST" != "127.0.0.1" && "$DB_HOST" != "::1" ]]; then
    echo "Refusing to back up a non-local database host: $DB_HOST" >&2
    exit 1
  fi

  if [[ ! "$db_name_lc" =~ (collab|local|dev|test|demo) ]]; then
    echo "Refusing to back up database '$DB_NAME' because it does not look local/dev/test/demo." >&2
    exit 1
  fi
}

require_command pg_dump
parse_jdbc_url
assert_local_dev_db

mkdir -p "$BACKUP_DIR/db"
rm -rf "$UPLOAD_BACKUP_DIR"
mkdir -p "$UPLOAD_BACKUP_DIR"

cat <<INFO
Creating CollabKart local demo backup
DB URL: $DB_URL
DB name: $DB_NAME
Upload dir: $UPLOAD_DIR
Backup dir: $BACKUP_DIR
INFO

PGPASSWORD="$DB_PASSWORD" pg_dump \
  --host "$DB_HOST" \
  --port "$DB_PORT" \
  --username "$DB_USERNAME" \
  --format custom \
  --no-owner \
  --no-privileges \
  --file "$DB_DUMP" \
  "$DB_NAME"

if [[ -d "$UPLOAD_DIR" ]]; then
  mkdir -p "$UPLOAD_BACKUP_DIR"
  cp -R "$UPLOAD_DIR"/. "$UPLOAD_BACKUP_DIR"/
else
  echo "Upload directory does not exist yet; creating empty upload backup."
fi

cat > "$MANIFEST" <<INFO
CollabKart demo backup
Created at: $(date -u +%Y-%m-%dT%H:%M:%SZ)
DB URL: $DB_URL
DB name: $DB_NAME
Upload source: $UPLOAD_DIR
DB dump: $DB_DUMP
Uploads backup: $UPLOAD_BACKUP_DIR
Includes full local dev database plus local uploads tree.
INFO

echo "Backup complete: $BACKUP_DIR"
