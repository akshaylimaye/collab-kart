#!/usr/bin/env bash
set -euo pipefail

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
elif [[ "${1:-}" != "" ]]; then
  echo "Usage: $0 [--dry-run]" >&2
  exit 64
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

: "${DB_URL:=jdbc:postgresql://localhost:5432/collabKartdb}"
: "${APP_UPLOAD_DIR:=uploads}"

missing=0
for key in CLOUDINARY_CLOUD_NAME CLOUDINARY_API_KEY CLOUDINARY_API_SECRET; do
  if [[ -z "${!key:-}" ]]; then
    echo "Missing required environment variable: $key" >&2
    missing=1
  fi
done
if [[ "$missing" -ne 0 ]]; then
  echo "Set Cloudinary variables in your shell or local .env file before running migration." >&2
  exit 2
fi

if [[ ! -d "$APP_UPLOAD_DIR" ]]; then
  echo "Uploads directory does not exist: $APP_UPLOAD_DIR" >&2
  exit 3
fi

echo "CollabKart local image migration to Cloudinary"
echo "Mode: $([[ "$DRY_RUN" == "true" ]] && echo "DRY RUN" || echo "UPLOAD AND UPDATE")"
SAFE_DB_URL="$(printf '%s' "$DB_URL" | sed -E 's#(//[^:/@]+):[^@/]+@#\1:****@#')"
echo "Database URL: $SAFE_DB_URL"
echo "Uploads directory: $APP_UPLOAD_DIR"
echo "Cloudinary cloud: ${CLOUDINARY_CLOUD_NAME}"
echo "Cloudinary folder: ${CLOUDINARY_FOLDER:-collabkart}"
echo "Cloudinary API secret: [hidden]"

if [[ "$DRY_RUN" != "true" ]]; then
  echo
  echo "Please backup your database and uploads folder before continuing."
  echo "This will upload local images to Cloudinary and update local database image URL fields."
  read -r -p "Type MIGRATE_IMAGES_TO_CLOUDINARY to continue: " confirmation
  if [[ "$confirmation" != "MIGRATE_IMAGES_TO_CLOUDINARY" ]]; then
    echo "Migration cancelled."
    exit 0
  fi
fi

ARGS="--app.image-migration.enabled=true --app.image-migration.dry-run=${DRY_RUN} --spring.main.web-application-type=none"

mvn spring-boot:run -Dspring-boot.run.arguments="$ARGS"
