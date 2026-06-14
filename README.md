# CollabKart MVP Backend

Spring Boot 3 REST API for the CollabKart MVP.

## Tech Stack

- Java 17
- Spring Boot 3
- Spring Security with JWT
- PostgreSQL
- Flyway
- Maven
- Lombok
- Cloudinary image storage for deployment, with local filesystem fallback for development

## Setup

1. Create a PostgreSQL database:

```sql
CREATE DATABASE collabkart;
CREATE USER collabkart WITH PASSWORD 'collabkart';
GRANT ALL PRIVILEGES ON DATABASE collabkart TO collabkart;
```

2. Configure environment variables. Use `.env.example` as a reference. You can export them in your shell or create a local `.env` file in the project root:

```bash
export DB_URL=jdbc:postgresql://localhost:5432/collabkart
export DB_USERNAME=collabkart
export DB_PASSWORD=collabkart
export JWT_SECRET=change-this-to-a-very-long-secret-with-at-least-32-characters
export JWT_EXPIRATION_MS=86400000
export SERVER_PORT=8080
export APP_UPLOAD_DIR=uploads
export APP_PUBLIC_BASE_URL=http://localhost:8080
export APP_CORS_ALLOWED_ORIGINS=http://localhost:3000
export CLOUDINARY_CLOUD_NAME=your_cloud_name
export CLOUDINARY_API_KEY=your_api_key
export CLOUDINARY_API_SECRET=your_api_secret
export CLOUDINARY_FOLDER=collabkart
```

3. Run the API:

```bash
mvn spring-boot:run
```

Flyway runs migrations automatically on startup.

## Local Backend Restart Note

If backend behavior looks stale during local QA, stop the existing backend process and restart it on port `8080` from the latest source. Avoid testing against an older process still listening on `8080`, especially if another temporary backend was started on `8081` during debugging.

## Local Network Frontend Testing

The backend reads allowed browser origins from `APP_CORS_ALLOWED_ORIGINS` / `app.cors.allowed-origins`. The default is `http://localhost:3000`. Use a comma-separated list when testing from another device on your LAN:

```bash
export SERVER_PORT=8080
export APP_PUBLIC_BASE_URL=http://192.168.1.45:8080
export APP_CORS_ALLOWED_ORIGINS=http://localhost:3000,http://192.168.1.45:3000
mvn spring-boot:run
```

Then run the frontend with a matching API URL, for example from `frontend/`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://192.168.1.45:8080 npm run dev -- --hostname 0.0.0.0 --port 3000
```

Keep CORS origins specific. Do not use wildcard origins when credentials/JWT-authenticated browser requests are enabled.

## Image Uploads

Brand campaign product images, creator profile images, and brand logos are uploaded with `multipart/form-data`. In deployed environments, configure Cloudinary so CollabKart stores durable Cloudinary URLs in PostgreSQL. Local development falls back to filesystem storage when Cloudinary variables are not configured.

Default local fallback storage:

```text
uploads/campaign-images/
```

Default local fallback public URL format:

```text
http://localhost:8080/uploads/campaign-images/<filename>
```

Allowed image uploads:

- JPG / JPEG
- PNG
- WEBP
- Maximum size: 5MB

Campaign drafts can be created without an image, but a product image is required before publishing.

Cloudinary stores new deployment uploads in `collabkart/campaign-images`, `collabkart/creator-profiles`, and `collabkart/brand-logos`. Existing local `/uploads/...` URLs can still render locally if the files are present; this task does not bulk-migrate old local images.

## API

### Register

```http
POST /api/v1/auth/register
Content-Type: application/json
```

```json
{
  "name": "Creator User",
  "email": "creator@example.com",
  "password": "password123",
  "role": "CREATOR"
}
```

Allowed public registration roles: `CREATOR`, `BRAND`. `ADMIN` users cannot be created from this public API.

### Login

```http
POST /api/v1/auth/login
Content-Type: application/json
```

```json
{
  "email": "creator@example.com",
  "password": "password123"
}
```

### Current User

```http
GET /api/users/me
Authorization: Bearer <jwt>
```

### Create Campaign With Product Image

```bash
curl -X POST http://localhost:8080/api/v1/brand/campaigns \
  -H "Authorization: Bearer <brand-jwt>" \
  -F "title=Summer skincare launch" \
  -F "productName=Glow Serum" \
  -F "description=Create short-form content for the product launch." \
  -F "category=Beauty" \
  -F "commissionType=PERCENTAGE" \
  -F "commissionValue=12" \
  -F "productImage=@/path/to/product.webp"
```

### Create Campaign Draft Without Image

```bash
curl -X POST http://localhost:8080/api/v1/brand/campaigns \
  -H "Authorization: Bearer <brand-jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Summer skincare launch",
    "productName": "Glow Serum",
    "description": "Create short-form content for the product launch.",
    "category": "Beauty",
    "commissionType": "PERCENTAGE",
    "commissionValue": 12
  }'
```

### Update Campaign With New Product Image

If no `productImage` file is sent in the multipart request, the existing `productImageUrl` is kept. If a new file is sent, the backend stores it locally and replaces `productImageUrl` with the new URL.

```bash
curl -X PUT http://localhost:8080/api/v1/brand/campaigns/<campaign-id> \
  -H "Authorization: Bearer <brand-jwt>" \
  -F "title=Updated skincare launch" \
  -F "productName=Glow Serum" \
  -F "description=Updated campaign brief." \
  -F "category=Beauty" \
  -F "commissionType=PERCENTAGE" \
  -F "commissionValue=15" \
  -F "productImage=@/path/to/new-product.png"
```

### Publish Campaign

```http
PATCH /api/v1/brand/campaigns/{id}/publish
Authorization: Bearer <brand-jwt>
```

A campaign must have a `productImageUrl` before it can be published.

## Project Structure

```text
src/main/java/com/collabkart
├── config
├── controller
├── dto
├── entity
├── exception
├── repository
└── service
```

## Dev Admin

To seed a local admin user, run the backend with the `dev` profile:

```bash
SPRING_PROFILES_ACTIVE=dev mvn spring-boot:run
```

Default dev admin credentials:

```text
Email: admin@collabkart.local
Password: Admin@12345
```

Override with `DEV_ADMIN_EMAIL`, `DEV_ADMIN_PASSWORD`, and `DEV_ADMIN_NAME`.
