# CollabKart Decisions

Last updated: 2026-06-12

## Product Decisions

- 2026-06-12: CollabKart starts as a responsive web app, not a mobile app.
- 2026-06-12: The backend should be API-first so a mobile app can be added later.
- 2026-06-12: The core MVP loop is brand creates campaign, creator applies, brand accepts/rejects, creator tracks status.
- 2026-06-12: Campaign approval by admin is not part of V1.
- 2026-06-12: Brands can publish campaigns directly in V1.
- 2026-06-12: Campaign statuses are DRAFT, LIVE, ARCHIVED.
- 2026-06-12: Application statuses are APPLIED, ACCEPTED, REJECTED, WITHDRAWN.
- 2026-06-12: Product image upload should be used instead of asking brands for an image URL.
- 2026-06-12: Uploaded campaign images are public because they are product marketing assets.
- 2026-06-12: Payments, chat, ratings, KYC/GST verification, social login, advanced analytics, and saved campaigns are not part of V1.
- 2026-06-12: Public brand profile pages are not part of the current MVP.

## Technical Decisions

- 2026-06-12: Use Spring Boot, Java 17, PostgreSQL, Maven, Flyway, and JWT for the backend.
- 2026-06-12: Use Next.js, TypeScript, Tailwind CSS, and local shadcn-style UI components for the frontend.
- 2026-06-12: Use a monolith architecture for now, not microservices.
- 2026-06-12: Use Flyway migrations and keep JPA `ddl-auto` as validate.
- 2026-06-12: Use local filesystem storage for campaign images during MVP development; move to Cloudinary/object storage later if needed.
- 2026-06-12: Keep ADMIN creation out of public registration; use dev seed for local admin access.
- 2026-06-12: Keep campaign approval logic isolated around publish behavior so review can be added later if the product decision changes.

## UI Decisions

- 2026-06-12: Preferred UI direction is premium pastel SaaS: white/off-white base, teal/emerald primary, lavender/purple secondary, peach/coral accent.
- 2026-06-12: Keep the UI clean, professional, responsive, and product-image-focused.
- 2026-06-12: Avoid dark neon, childish/cartoon-heavy visuals, fake analytics, and excessive gradients.

## What Should Not Change Without Discussion

- Do not add admin campaign approval to V1.
- Do not add new campaign statuses beyond DRAFT, LIVE, ARCHIVED without a product decision.
- Do not add payments, chat, ratings, KYC/GST, social login, advanced analytics, or saved campaigns without discussion.
- Do not change away from the API-first monolith direction without discussion.
- Do not replace the current UI direction without discussion.

## How to Update These Files

- Whenever a major feature is added, update `PROJECT_CONTEXT.md`.
- Whenever a task is completed or discovered, update `TODO.md`.
- Whenever a product or architecture decision is made, update `DECISIONS.md`.
- Keep entries concise but useful.
- Use dates for decisions where possible.
- Do not let these files become stale.
