# CollabKart Project Context

Last updated: 2026-06-14

## Product Overview

CollabKart is a performance-based creator campaign platform for small brands and nano/micro creators. Brands create product-based commission campaigns, creators discover live campaigns, apply with a short message, and brands accept or reject applicants.

The core MVP loop is:

Brand creates campaign -> Creator applies -> Brand accepts/rejects -> Creator tracks application status.

## Target Users

- Small brands that want lightweight creator-led product promotion without complex agency workflows.
- Nano and micro creators who want to discover brand campaigns and track application outcomes.

## Core MVP Goal

Build a simple, usable web MVP that proves the collaboration loop:

1. Brand registers and creates a profile.
2. Brand creates a product campaign with an uploaded product image.
3. Brand publishes the campaign directly.
4. Creator registers and creates a profile.
5. Creator browses live campaigns and applies.
6. Brand reviews applications and accepts/rejects.
7. Creator tracks application status and can edit/withdraw while still APPLIED.

## Current Tech Stack

### Backend

- Java 17
- Spring Boot 3
- Maven
- Spring Web
- Spring Data JPA / Hibernate
- Spring Security with JWT
- BCrypt password hashing
- Lombok
- Flyway
- PostgreSQL
- Cloudinary image storage for deployed uploads, with local filesystem fallback for development
- Configurable CORS via `app.cors.allowed-origins` / `APP_CORS_ALLOWED_ORIGINS`

### Frontend

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style local UI primitives
- lucide-react icons
- JWT stored in browser localStorage
- API client layer in `frontend/lib/api.ts`

### Database / Migrations

- PostgreSQL is the target database.
- Flyway migrations live in `src/main/resources/db/migration`.
- JPA uses `ddl-auto: validate`, so schema changes should go through Flyway.
- Current migrations include users, profiles, campaigns, applications, restored V1 campaign statuses, and WITHDRAWN application status.

### Authentication

- Public auth endpoints: register and login.
- JWT protects API routes.
- Roles: CREATOR, BRAND, ADMIN.
- Public registration allows CREATOR and BRAND only.
- ADMIN is seeded only in dev profile using `DevAdminSeeder`.
- Local sample brands, creators, profiles, and DRAFT campaigns are seeded only in the `dev` profile using `DevSampleDataSeeder`.
- Local demo data can be backed up/restored with `scripts/backup-demo-data.sh` and `scripts/restore-demo-data.sh`; backups include PostgreSQL data and the local `uploads/` tree.

## Current Core Flows

### Brand Flow

- Register/login as BRAND.
- New brands without a profile see friendly onboarding states on dashboard, campaign management, and campaign creation routes.
- Brand profile tab opens a read-only profile view by default after setup; the edit form opens only after clicking Edit profile.
- Create/update brand profile with optional brand logo upload and fixed category selection.
- Create campaign as DRAFT.
- Upload product image from device.
- Manage campaigns and applicants using `/brand/campaigns`; the page defaults to Live campaigns, supports URL filters such as `?filter=needs-review`, and opens selected campaign details/applicants in a drawer.
- Brand dashboard applicant-review CTAs navigate to the Needs review campaign filter so pending applicants are shown in campaign context. The dashboard avoids generic next-action cards once campaigns exist and shows pending review only as a compact actionable alert.
- Brand applicant review happens inside the selected campaign drawer instead of a disconnected bottom section.
- Brand can reject applications with an optional reason.
- Brand can accept APPLIED applications only by assigning a coupon code, with optional creator instructions.
- Edit campaign using `/brand/campaigns/{id}/edit`.
- Preview own campaign using `/brand/campaigns/{id}`.
- Publish campaign directly from DRAFT to LIVE.
- Archive DRAFT or LIVE campaign.
- View applications for own campaigns.
- Accept/reject APPLIED applications.
- Accepted creators receive a coupon code, coupon status, reward rule, and brand instructions when provided.
- Processed applications cannot be changed again for now.

### Creator Flow

- Register/login as CREATOR.
- New creators without a profile see friendly onboarding states on dashboard and applications routes.
- Creator profile tab opens a read-only profile view by default after setup; the edit form opens only after clicking Edit profile. The view includes application summary, recent applications, and Instagram access when available.
- Creator dashboard hides complete-profile prompts and the Profile readiness card after profile completion; the campaign marketplace supports All, Open, Applied, and Accepted creator filters.
- Create/update creator profile with optional avatar upload and fixed category selection.
- Browse LIVE campaigns.
- View campaign details with brand display details.
- Apply once to a LIVE campaign.
- View all applications on `/creator/applications`; accepted applications keep application status as ACCEPTED while showing campaign archived and coupon inactive as separate sub-states when relevant.
- Edit application message while status is APPLIED.
- Withdraw application while status is APPLIED.
- Cannot edit/withdraw ACCEPTED, REJECTED, or WITHDRAWN applications.

### Admin Flow

- Backend has simple ADMIN list APIs for users and campaigns.
- Dev admin seed exists under Spring `dev` profile.
- Frontend admin UI is not implemented yet.

## Important Business Rules

- Brand profiles and creator profiles are one-per-user.
- Brands can only manage their own campaigns.
- Creators can only manage their own applications.
- Campaigns start as DRAFT.
- Brands publish campaigns directly in V1.
- Only LIVE campaigns are visible to creators.
- Product image is required before publishing.
- Product image upload accepts JPG/JPEG, PNG, and WEBP up to 5MB.
- Campaign product images, creator profile images, and brand logos are stored in Cloudinary when Cloudinary environment variables are configured. Local filesystem `/uploads/**` remains as a development fallback only.
- Dev sample data intentionally leaves `productImageUrl`, `profileImageUrl`, and `logoImageUrl` empty/null so images can be uploaded manually later.
- Cloudinary is required for deployed friends/family testing because local server uploads are not durable across redeploys.
- Local `/uploads/...` image URLs can be migrated to Cloudinary with `scripts/migrate-local-images-to-cloudinary.sh`; the script is explicit, local/dev-only, and not part of normal app startup.
- Frontend image rendering uses shared components: product images use variant-specific sizing, creator avatars are circular cover images, and brand logos are contained rounded-square images.
- A creator can apply only once to the same campaign.
- New applications default to APPLIED.
- Brand accept/reject is allowed only from APPLIED applications on non-archived campaigns.
- Rejection reason is optional and visible to creators when provided.
- Accepting a creator requires a coupon code. Coupon codes are validated as 4-12 uppercase letters/numbers and are unique per brand across all campaigns, including archived campaigns.
- Coupon codes are not deleted or reused after archive; archiving a campaign makes active accepted coupons INACTIVE and sets `couponDisabledAt`. Archived accepted applications remain under the Accepted filter because archive is campaign state, not application state.
- Fixed reward means fixed reward per confirmed sale.
- Creator edit/withdraw is allowed only from APPLIED.
- Missing creator/brand profiles are onboarding states in the frontend, not generic errors, including dashboard and profile-dependent list/form pages.
- Current campaign statuses: DRAFT, LIVE, ARCHIVED.
- Current application statuses: APPLIED, ACCEPTED, REJECTED, WITHDRAWN.

## Existing Major APIs

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

### Creator Profile

- `POST /api/v1/creator/profile` JSON or multipart with optional `profileImage`
- `GET /api/v1/creator/profile`
- `PUT /api/v1/creator/profile` JSON or multipart with optional `profileImage`

### Brand Profile

- `POST /api/v1/brand/profile` JSON or multipart with optional `logoImage`
- `GET /api/v1/brand/profile`
- `PUT /api/v1/brand/profile` JSON or multipart with optional `logoImage`

### Brand Campaigns

- `POST /api/v1/brand/campaigns` JSON or multipart
- `GET /api/v1/brand/campaigns`
- `GET /api/v1/brand/campaigns/{id}`
- `PUT /api/v1/brand/campaigns/{id}` JSON or multipart
- `PATCH /api/v1/brand/campaigns/{id}/publish`
- `PATCH /api/v1/brand/campaigns/{id}/archive`

### Creator Campaigns / Applications

- `GET /api/v1/creator/campaigns`
- `GET /api/v1/creator/campaigns/{id}`
- `POST /api/v1/creator/campaigns/{id}/apply`
- `GET /api/v1/creator/applications`
- `PUT /api/v1/creator/applications/{applicationId}`
- `PATCH /api/v1/creator/applications/{applicationId}/withdraw`

### Brand Application Management

- `GET /api/v1/brand/campaigns/{campaignId}/applications`
- `PATCH /api/v1/brand/applications/{applicationId}/accept` with `couponCode` and optional `brandInstructions`
- `PATCH /api/v1/brand/applications/{applicationId}/reject` with optional `rejectionReason`

### Admin

- `GET /api/v1/admin/users`
- `GET /api/v1/admin/campaigns`

### Other

- `GET /api/users/me`
- `GET /uploads/**`

## Existing Major Frontend Routes

### Public / Auth

- `/`
- `/login`
- `/register`

### Creator

- `/creator/dashboard`
- `/creator/profile`
- `/creator/applications`
- `/campaigns`
- `/campaigns/[id]`

### Brand

- `/brand/dashboard`
- `/brand/profile`
- `/brand/campaigns`
- `/brand/campaigns/new`
- `/brand/campaigns/[id]`
- `/brand/campaigns/[id]/edit`

## Intentionally Not Part of V1

- Admin campaign approval flow
- Campaign statuses beyond DRAFT, LIVE, ARCHIVED
- Payment processing
- Chat or messaging beyond application message
- Notifications
- Creator ratings or reviews
- KYC/GST verification
- Social login
- Advanced analytics
- Saved campaigns
- Public brand profile pages
- Mobile app
- Microservices architecture
- Multiple campaign images
- Video upload
