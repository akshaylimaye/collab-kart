# Local Image Migration to Cloudinary

Use this only for local/dev demo data when existing database records still point to local `/uploads/...` image URLs. New uploads already use Cloudinary when Cloudinary environment variables are configured.

This migration uploads existing local image files to Cloudinary and updates these database fields:

- `campaigns.product_image_url` -> `collabkart/campaign-images`
- `creator_profiles.profile_image_url` -> `collabkart/creator-profiles`
- `brand_profiles.logo_image_url` -> `collabkart/brand-logos`

The script is idempotent. Records already using `https://res.cloudinary.com/...` are skipped.

## Before You Run

Back up the local database and uploads folder first.

Example PostgreSQL backup:

```bash
pg_dump --format=custom --file=seed-data/demo-backup/db-before-image-migration.dump "$DB_URL"
```

Example uploads backup:

```bash
mkdir -p seed-data/demo-backup
cp -R uploads seed-data/demo-backup/uploads-before-image-migration
```

## Required Environment Variables

Set these in your shell or local `.env` file:

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=collabkart
```

Do not commit real Cloudinary secrets. The script prints the cloud name and folder, but never prints the API secret.

## Dry Run

Dry run lists records that would be migrated and missing files. It does not upload images or update the database.

```bash
scripts/migrate-local-images-to-cloudinary.sh --dry-run
```

## Actual Migration

The actual migration requires typing the exact confirmation phrase.

```bash
scripts/migrate-local-images-to-cloudinary.sh
```

Confirmation phrase:

```text
MIGRATE_IMAGES_TO_CLOUDINARY
```

## Safety Checks

The migration:

- Refuses to run if Cloudinary variables are missing.
- Prints the database URL/name it will use, without printing the password separately.
- Verifies the uploads directory exists.
- Refuses non-local-looking database URLs unless `app.image-migration.allow-non-local-db=true` is explicitly provided.
- Skips blank image URLs.
- Skips records already using Cloudinary URLs.
- Warns and skips missing local files instead of crashing the entire migration.
- Does not delete local files.

## Verify After Migration

Check migrated rows:

```sql
select product_image_url from campaigns where product_image_url is not null;
select profile_image_url from creator_profiles where profile_image_url is not null;
select logo_image_url from brand_profiles where logo_image_url is not null;
```

Migrated URLs should start with:

```text
https://res.cloudinary.com/
```

Then restart the backend and verify the frontend still renders campaign images, creator avatars, and brand logos.
