# CollabKart Project Context

Last updated: 2026-06-12

## Product Overview

CollabKart is a marketplace-style collaboration platform for small brands and nano/micro creators. Brands create product-based commission campaigns, creators discover live campaigns, apply with a short message, and brands accept or reject applicants.

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
- Local filesystem image storage for campaign product images

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

## Current Core Flows

### Brand Flow

- Register/login as BRAND.
- Create/update brand profile.
- Create campaign as DRAFT.
- Upload product image from device.
- Edit campaign using `/brand/campaigns/{id}/edit`.
- Preview own campaign using `/brand/campaigns/{id}`.
- Publish campaign directly from DRAFT to LIVE.
- Archive DRAFT or LIVE campaign.
- View applications for own campaigns.
- Accept/reject APPLIED applications.
- Processed applications cannot be changed again for now.

### Creator Flow

- Register/login as CREATOR.
- Create/update creator profile.
- Browse LIVE campaigns.
- View campaign details with brand display details.
- Apply once to a LIVE campaign.
- View all applications on `/creator/applications`.
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
- Campaign product images are stored locally for now and served publicly under `/uploads/**`.
- A creator can apply only once to the same campaign.
- New applications default to APPLIED.
- Brand accept/reject is allowed only from APPLIED.
- Creator edit/withdraw is allowed only from APPLIED.
- Current campaign statuses: DRAFT, LIVE, ARCHIVED.
- Current application statuses: APPLIED, ACCEPTED, REJECTED, WITHDRAWN.

## Existing Major APIs

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

### Creator Profile

- `POST /api/v1/creator/profile`
- `GET /api/v1/creator/profile`
- `PUT /api/v1/creator/profile`

### Brand Profile

- `POST /api/v1/brand/profile`
- `GET /api/v1/brand/profile`
- `PUT /api/v1/brand/profile`

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
- `PATCH /api/v1/brand/applications/{applicationId}/accept`
- `PATCH /api/v1/brand/applications/{applicationId}/reject`

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
