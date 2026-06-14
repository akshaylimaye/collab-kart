#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${DEMO_BACKUP_DIR:-$ROOT_DIR/seed-data/demo-backup}"
DB_DUMP="$BACKUP_DIR/db/collabkart-demo.dump"
UPLOAD_BACKUP_DIR="$BACKUP_DIR/uploads"

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
    echo "Refusing to restore to a non-local database host: $DB_HOST" >&2
    exit 1
  fi

  if [[ ! "$db_name_lc" =~ (collab|local|dev|test|demo) ]]; then
    echo "Refusing to restore database '$DB_NAME' because it does not look local/dev/test/demo." >&2
    exit 1
  fi
}

validate_backup_exists() {
  if [[ ! -f "$DB_DUMP" ]]; then
    echo "Backup dump not found: $DB_DUMP" >&2
    echo "Run scripts/backup-demo-data.sh first." >&2
    exit 1
  fi
}

confirm_restore() {
  cat <<WARN
This will restore CollabKart local demo data.

Target DB URL: $DB_URL
Target DB name: $DB_NAME
Upload directory to replace: $UPLOAD_DIR
Backup source: $BACKUP_DIR

The restore will drop/recreate database objects from the backup dump and replace local upload files.
This is intended for local/dev use only.
WARN
  printf 'Type RESTORE_DEMO_DATA to continue: '
  read -r answer
  if [[ "$answer" != "RESTORE_DEMO_DATA" ]]; then
    echo "Restore cancelled."
    exit 1
  fi
}

restore_uploads() {
  mkdir -p "$UPLOAD_DIR"
  rm -rf "$UPLOAD_DIR/campaign-images" "$UPLOAD_DIR/profile-images" "$UPLOAD_DIR/brand-logos"
  mkdir -p "$UPLOAD_DIR"
  if [[ -d "$UPLOAD_BACKUP_DIR" ]]; then
    cp -R "$UPLOAD_BACKUP_DIR"/. "$UPLOAD_DIR"/
  fi
}

verify_image_paths() {
  local sql="
WITH image_urls AS (
  SELECT product_image_url AS url FROM campaigns WHERE product_image_url IS NOT NULL AND product_image_url <> ''
  UNION ALL SELECT profile_image_url FROM creator_profiles WHERE profile_image_url IS NOT NULL AND profile_image_url <> ''
  UNION ALL SELECT logo_image_url FROM brand_profiles WHERE logo_image_url IS NOT NULL AND logo_image_url <> ''
)
SELECT url FROM image_urls;
"
  local missing=0
  while IFS= read -r url; do
    [[ -z "$url" ]] && continue
    local relative="${url#*\/uploads\/}"
    if [[ "$relative" == "$url" ]]; then
      echo "Warning: image URL does not contain /uploads/: $url" >&2
      missing=1
      continue
    fi
    if [[ ! -f "$UPLOAD_DIR/$relative" ]]; then
      echo "Missing restored upload file for DB image URL: $url" >&2
      missing=1
    fi
  done < <(PGPASSWORD="$DB_PASSWORD" psql --host "$DB_HOST" --port "$DB_PORT" --username "$DB_USERNAME" --dbname "$DB_NAME" --tuples-only --no-align --command "$sql")

  if [[ "$missing" -ne 0 ]]; then
    echo "Restore completed, but some DB image URLs do not have matching local files." >&2
    exit 1
  fi
}

require_command pg_restore
require_command psql
parse_jdbc_url
assert_local_dev_db
validate_backup_exists
confirm_restore

PGPASSWORD="$DB_PASSWORD" pg_restore \
  --host "$DB_HOST" \
  --port "$DB_PORT" \
  --username "$DB_USERNAME" \
  --dbname "$DB_NAME" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  "$DB_DUMP"

restore_uploads
verify_image_paths

echo "Restore complete."
