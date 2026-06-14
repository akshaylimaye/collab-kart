# CollabKart Deployment Notes

## Cloudinary Image Storage

Cloud deployment should use Cloudinary for uploaded campaign product images, creator profile images, and brand logos. Local server uploads under `uploads/` are not reliable on Render/Vercel-style deployments because files may disappear after restart or redeploy.

### Setup

1. Create a Cloudinary account.
2. In the Cloudinary dashboard, copy the cloud name, API key, and API secret.
3. Add these variables to the backend environment, for example in Render:

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=collabkart
```

Do not add real Cloudinary secrets to code, frontend variables, or committed files. Only the backend should receive `CLOUDINARY_API_SECRET`.

### Folders

New uploaded images are stored in Cloudinary under:

- `collabkart/campaign-images`
- `collabkart/creator-profiles`
- `collabkart/brand-logos`

The backend saves only the returned public secure URL in PostgreSQL. It does not store image binary data in the database.

### Local Development

If Cloudinary variables are not configured, the backend falls back to local filesystem storage under `uploads/`. This is fine for local development only. For deployed friends/family testing, configure Cloudinary and restart the backend after setting the variables.

### Stale Backend Warning

If image upload behavior looks stale during local QA, stop the existing backend process and restart the latest backend on port `8080`. Avoid testing against an older process on `8080` while another temporary backend is running on `8081`.

## Existing Local Image Migration

If local demo records already point to `/uploads/...` or `http://localhost:8080/uploads/...`, use `docs/IMAGE_MIGRATION.md` before public testing to migrate those files to Cloudinary and update DB image URLs.
