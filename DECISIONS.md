# CollabKart Decisions

Last updated: 2026-06-18

## Product Decisions

- 2026-06-12: CollabKart starts as a responsive web app, not a mobile app.
- 2026-06-12: The backend should be API-first so a mobile app can be added later.
- 2026-06-12: The core MVP loop is brand creates campaign, creator applies, brand accepts/rejects, creator tracks status.
- 2026-06-12: Campaign approval by admin is not part of V1.
- 2026-06-12: Brands can publish campaigns directly in V1.
- 2026-06-12: Campaign statuses are DRAFT, LIVE, ARCHIVED.
- 2026-06-12: Application statuses are APPLIED, ACCEPTED, REJECTED, WITHDRAWN.
- 2026-06-12: Product image upload should be used instead of asking brands for an image URL.
- 2026-06-13: Creator profiles support avatar upload and brand profiles support logo upload; store only public image URLs/paths, not binaries.
- 2026-06-13: Creator and brand profile categories use the same fixed MVP dropdown list as campaign categories.
- 2026-06-12: Brand campaign categories use a fixed dropdown list for MVP: Beauty & Skincare, Fashion & Lifestyle, Food & Beverages, Fitness & Health, Travel, Technology, Finance & Investing, Comedy & Entertainment, and Other.
- 2026-06-12: Uploaded campaign images are public because they are product marketing assets.
- 2026-06-12: Payments, chat, ratings, KYC/GST verification, social login, advanced analytics, and saved campaigns are not part of V1.
- 2026-06-12: Public brand profile pages are not part of the current MVP.
- 2026-06-13: Missing creator or brand profiles should be treated as onboarding states in the frontend, not as generic errors.
- 2026-06-18: Missing or incomplete creator and brand profiles use dedicated onboarding routes after login/register, and profile-gated role actions redirect there until required MVP fields are complete.
- 2026-06-13: Profile tab shows profile view by default when profile exists. Edit form opens only after clicking Edit profile.
- 2026-06-13: Images are rendered through shared components with variant-specific rules: product cards use cover, detail hero uses controlled height with contained display, creator avatars are circular cover images, and brand logos use contained rounded-square display.
- 2026-06-13: CollabKart is positioned as a performance-based creator campaign platform for small brands and nano creators.
- 2026-06-13: Creator dashboard hides complete-profile prompts once profile is complete, and campaign list supports creator status filters.
- 2026-06-13: Creator dashboard hides Profile readiness/Profile ready card once profile is complete.
- 2026-06-14: Brand dashboard does not show generic Next action cards when campaigns already exist; pending applicant review is shown only as a compact actionable alert.
- 2026-06-14: Creator dashboard hides Profile readiness/Profile ready card once profile is complete.
- 2026-06-14: Creator applications do not get a separate Archived filter because Archived is campaign status, not application status.
- 2026-06-14: Archived accepted applications remain under the Accepted filter; campaign archived and coupon inactive are shown as sub-states.
- 2026-06-13: Brand campaign applicants are shown inside the selected campaign detail modal/drawer instead of a disconnected below-page section. Brand campaigns default to the Live tab.
- 2026-06-13: Brand dashboard Review applicants navigates to the Needs review campaign filter, and applicants are reviewed inside the selected campaign modal/drawer.
- 2026-06-13: Rejection reason is optional.
- 2026-06-13: Accepting a creator requires a coupon code.
- 2026-06-13: Coupon codes are unique per brand, not globally.
- 2026-06-13: Coupon codes are not deleted or reused after campaign archive; they become inactive for history.
- 2026-06-13: Archived campaigns can be made live again. Coupon codes become inactive when archived and active again when the campaign is made live.
- 2026-06-13: Archived campaigns lock application review actions at backend level.
- 2026-06-13: Fixed reward means fixed reward per confirmed sale.
- 2026-06-14: Cloud deployment uses Cloudinary for uploaded campaign images, creator profile images, and brand logos. Local uploads are not reliable for deployed environments.

## Technical Decisions

- 2026-06-12: Use Spring Boot, Java 17, PostgreSQL, Maven, Flyway, and JWT for the backend.
- 2026-06-12: Use Next.js, TypeScript, Tailwind CSS, and local shadcn-style UI components for the frontend.
- 2026-06-12: Use a monolith architecture for now, not microservices.
- 2026-06-12: Use Flyway migrations and keep JPA `ddl-auto` as validate.
- 2026-06-12: Use local filesystem storage as a development fallback for image uploads.
- 2026-06-12: Keep ADMIN creation out of public registration; use dev seed for local admin access.
- 2026-06-12: Keep campaign approval logic isolated around publish behavior so review can be added later if the product decision changes.
- 2026-06-13: Backend CORS origins are configurable through `app.cors.allowed-origins` / `APP_CORS_ALLOWED_ORIGINS` for local and LAN frontend testing.
- 2026-06-13: Dev sample data runs only under the `dev` profile; seeded campaigns remain DRAFT and seeded image URL fields stay empty/null.
- 2026-06-13: Local demo backups use a full local PostgreSQL custom-format dump plus the local `uploads/` tree; restore is guarded by local DB checks and an explicit confirmation phrase.

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
