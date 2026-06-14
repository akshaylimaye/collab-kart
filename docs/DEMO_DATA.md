# CollabKart Demo Data Backup and Restore

This document describes the local-only demo data backup system for CollabKart.

## Scope

The scripts are intended only for local/dev data. They do not run in production and do not change application runtime behavior.

A backup includes:

- Full local PostgreSQL database dump, including `users`, `creator_profiles`, `brand_profiles`, `campaigns`, `campaign_applications`, and schema metadata.
- Local uploaded files under `uploads/`, including:
  - `uploads/campaign-images`
  - `uploads/profile-images`
  - `uploads/brand-logos`

Backups are written to:

```bash
seed-data/demo-backup/
```

The backup folder is git-ignored because it can contain password hashes and local uploaded files.

## Safety Checks

Both scripts parse `DB_URL` from `.env` or the shell environment. Defaults match the local app config:

```bash
jdbc:postgresql://localhost:5432/collabKartdb
```

The scripts refuse to run unless:

- The database host is `localhost`, `127.0.0.1`, or `::1`.
- The database name looks local/dev/test/demo, such as containing `collab`, `local`, `dev`, `test`, or `demo`.

Restore also requires this exact confirmation:

```text
RESTORE_DEMO_DATA
```

## Backup Current Demo Data

From the repository root:

```bash
scripts/backup-demo-data.sh
```

Optional environment overrides:

```bash
DB_URL=jdbc:postgresql://localhost:5432/collabKartdb \
DB_USERNAME=postgres \
DB_PASSWORD=abc@1234 \
APP_UPLOAD_DIR=uploads \
scripts/backup-demo-data.sh
```

## Restore Demo Data

From the repository root:

```bash
scripts/restore-demo-data.sh
```

The restore script will:

1. Print the target DB URL/name and upload directory.
2. Ask for `RESTORE_DEMO_DATA` confirmation.
3. Restore the database from `seed-data/demo-backup/db/collabkart-demo.dump` using `pg_restore --clean --if-exists`.
4. Replace local upload directories from `seed-data/demo-backup/uploads`.
5. Verify DB image URLs that contain `/uploads/` point to files that exist locally.

## Important Notes

- Stop the Spring Boot backend before restoring, especially if it is connected to the same database.
- The restored database image URLs must use the same public upload path convention as the current local app, for example `http://localhost:8080/uploads/campaign-images/file.png`.
- If `APP_PUBLIC_BASE_URL` changes later, existing restored URLs may still point to the previous base URL. Keep local demo backups and local backend URL aligned.
- The database backup is a full local database dump, not a production migration.

## Test Credentials

All test users use:

```text
Test@12345
```

### Brands

1. `brewbeans.brand@test.com` / `Test@12345`
2. `glowveda.brand@test.com` / `Test@12345`
3. `fitfuel.brand@test.com` / `Test@12345`
4. `urbanthread.brand@test.com` / `Test@12345`

### Creators

1. `vaishnavi.creator@test.com` / `Test@12345`
2. `aarav.creator@test.com` / `Test@12345`
3. `nisha.creator@test.com` / `Test@12345`
4. `kabir.creator@test.com` / `Test@12345`
5. `meera.creator@test.com` / `Test@12345`
6. `rohan.creator@test.com` / `Test@12345`
