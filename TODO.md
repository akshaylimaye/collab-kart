# CollabKart TODO

Last updated: 2026-06-18

## Immediate / MVP Completion

- [x] Brand campaign edit screen: implemented at `/brand/campaigns/[id]/edit`.
- [x] Campaign response brand display details: implemented in `CampaignResponse` and frontend campaign cards/details.
- [x] Full creator applications page: implemented at `/creator/applications`.
- [x] Creator edit/withdraw application: implemented for APPLIED applications.
- [ ] Manual QA checklist: run full browser QA for brand and creator happy paths.
- [ ] Deployment preparation: decide hosting, environment variables, database provisioning, and production build process.
- [x] Add safe local script to migrate existing local `/uploads/...` demo image URLs to Cloudinary before public testing.
- [ ] Manually verify Cloudinary uploads in deployed backend with real Cloudinary credentials.
- [ ] Run actual local image migration after configuring real Cloudinary credentials.
- [ ] Admin UI decision: decide whether V1 needs a frontend admin screen or keeps admin backend-only.

## Frontend Polish

- [x] Premium pastel SaaS UI theme: implemented with off-white base, teal/emerald primary, lavender secondary, and peach/coral accent.
- [x] Update landing page positioning copy for performance-based creator campaigns.
- [x] Add interactive public landing page campaign lifecycle section for Before, During, and After Campaign storytelling.
- [x] Audit dashboard/cards/buttons for dead clickable affordances and wire existing MVP actions/routes.
- [ ] Add active campaign/application counts in more places only if backed by existing data.
- [ ] Improve duplicate-apply UX by showing applied status on campaign detail when data is available.
- [ ] Add more explicit empty states for first-time brand and creator onboarding after manual QA.
- [ ] Browser-check creator sticky application card behavior on mobile widths after the latest layout pass.
- [x] Fix mobile overlap/alignment issues in shared buttons, app header, campaign cards, applicant drawer, profile upload controls, and campaign action areas.
- [ ] Review mobile layouts on real device widths.
- [ ] Normalize brand campaign preview and creator campaign detail presentation where useful.
- [x] Add dedicated brand campaign management route at `/brand/campaigns`.
- [x] Move brand applicant review into a selected campaign drawer on `/brand/campaigns`.
- [ ] Consider application detail drawers/routes if recent application/applicant rows need deeper review beyond existing campaign/application lists.
- [ ] Improve creator campaign detail applied-state UX when backend returns current application state.
- [x] Improve creator product image fallbacks with category placeholders and invalid-image detection.
- [x] Standardize product images, creator avatars, and brand logos through shared image components.
- [ ] Add real browser QA for invalid/broken product image fallbacks on creator campaign and application cards.
- [x] Improve creator dashboard recommendation cards and compact application card density.
- [x] Fix creator campaign marketplace search/filter alignment and dropdown behavior.
- [x] Ensure creator campaign category dropdown stacks above result and empty-state cards.
- [x] Add creator campaign marketplace status chips for All, Open, Applied, and Accepted campaigns.
- [ ] Review creator card density on mobile after the next visual QA pass.
- [ ] Run real browser QA for brand campaign management, Needs review filter, applicant drawer, and mobile/desktop widths.
- [x] Deep-link brand dashboard applicant CTA to `/brand/campaigns?filter=needs-review` and auto-open the drawer when exactly one campaign needs review.
- [x] Add brand application review lifecycle: optional rejection reason, required accept coupon code, creator instructions, and creator-visible outcome details.
- [ ] Consider a reusable applicant card component if brand application UI appears in more places.
- [x] Add dismissible, deduplicated toast messages with success auto-dismiss.
- [x] Add brand dashboard next-action guidance.
- [x] Remove generic brand dashboard next-action card when campaigns exist; keep only compact pending-review alert.
- [x] Improve brand campaign form scrolling with sticky preview/actions and validation error scroll.
- [x] Polish brand campaign preview placeholders and replace category free text with a fixed dropdown.
- [x] Fix brand campaign form category dropdown layering, width, spacing, sticky preview, and upload affordance.
- [x] Add friendly creator/brand onboarding dashboard states for missing profiles.
- [x] Add dedicated creator and brand first-time onboarding routes after registration/login.
- [x] Gate creator/brand dashboard and role actions until required profile fields are complete.
- [x] Add missing-profile onboarding states for creator applications and brand campaign pages.
- [x] Replace native dropdowns with reusable custom Select component for predictable overlay behavior.
- [x] Add creator avatar and brand logo upload to profile create/update flows.
- [x] Replace creator/brand profile category free text with fixed dropdowns.
- [x] Compact creator and brand profile page layouts.
- [x] Show profile view by default for existing creator and brand profiles; edit forms open from Edit profile.
- [x] Confirm creator dashboard hides Profile readiness/Profile ready cards once profile is complete.
- [x] Add local stale-backend restart note for dev QA.
- [x] Confirm brand campaign Needs review filter keeps applicants scoped inside the selected campaign drawer.
- [x] Confirm brand dashboard does not show Create your first campaign when campaigns exist.
- [x] Show campaign archived and coupon inactive sub-state badges on creator accepted applications.

## P2 Backlog

- [ ] Notification bell: derive simple brand/creator notifications from existing pending applicant, accepted/rejected application, and coupon active/inactive data. Do not add websocket, push, or email notifications yet.
- [ ] Compact creator applications layout: replace large full-width application cards with compact rows and a right-side detail drawer/modal; avoid 3-column application tiles because status details need readability.
- [ ] Landing page positioning and product name revisit: keep performance-based creator campaign positioning and consider product rename later.
- [ ] Demo data backup/restore: maintain local/dev scripts to backup and restore database records plus uploaded images safely.
- [x] Cloudinary migration: move new campaign images, creator avatars, and brand logos to Cloudinary when env vars are configured.
- [ ] Mobile visual QA: verify drawer/modal behavior, campaign cards, creator application cards, and brand campaign management on mobile widths.
- [ ] Inline coupon validation polish: show coupon validation errors inline inside the accept dialog instead of only through toast.

## Backend Improvements

- [ ] Add broader service/controller tests for auth, profiles, campaign create/update/publish/archive, and creator apply flow.
- [x] Require creator and brand profile categories in backend validation.
- [x] Use generic upload-size error copy for campaign, profile, and logo images.
- [ ] Consider returning creator application state in campaign details to prevent duplicate apply attempts from the UI.
- [ ] Consider consistent 403 vs 404 semantics for owned resources; current behavior often hides inaccessible campaigns as not found.
- [x] Add Cloudinary image storage with local filesystem fallback for development.
- [x] Add configurable backend CORS origins for localhost/LAN frontend testing.
- [x] Add dev-only local seed data for test brands, creators, profiles, and DRAFT campaigns.
- [x] Add local demo data backup/restore scripts for PostgreSQL data and uploaded files.
- [x] Add campaign application coupon/rejection fields and validation for brand accept/reject flow.
- [x] Add backend guard so archived campaigns lock application accept/reject actions.
- [ ] Add pagination for campaign and application lists before data grows.

## Future Features

- [ ] Public brand profile pages.
- [ ] Campaign search/filtering beyond current basic browsing.
- [ ] Notifications for application status changes.
- [ ] Payments/commission tracking.
- [ ] Store and reconcile sales/order events against assigned coupon codes.
- [ ] Chat or structured collaboration handoff after acceptance.
- [ ] Creator ratings/reviews.
- [ ] KYC/GST verification.
- [ ] Social login.
- [ ] Advanced analytics.
- [ ] Saved campaigns.
- [ ] Mobile app using the existing API-first backend.

## Not Now

- [ ] Do not add admin approval workflow to V1.
- [ ] Do not add PENDING_REVIEW, APPROVED, or REJECTED campaign statuses.
- [ ] Do not add microservices.
- [ ] Do not add payments, chat, ratings, KYC/GST, social login, advanced analytics, or saved campaigns without a product decision.
- [ ] Do not replace the premium pastel SaaS direction without discussion.
