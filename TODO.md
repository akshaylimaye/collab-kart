# CollabKart TODO

Last updated: 2026-06-12

## Immediate / MVP Completion

- [x] Brand campaign edit screen: implemented at `/brand/campaigns/[id]/edit`.
- [x] Campaign response brand display details: implemented in `CampaignResponse` and frontend campaign cards/details.
- [x] Full creator applications page: implemented at `/creator/applications`.
- [x] Creator edit/withdraw application: implemented for APPLIED applications.
- [ ] Manual QA checklist: run full browser QA for brand and creator happy paths.
- [ ] Deployment preparation: decide hosting, environment variables, database provisioning, upload storage path, and production build process.
- [ ] Admin UI decision: decide whether V1 needs a frontend admin screen or keeps admin backend-only.

## Frontend Polish

- [x] Premium pastel SaaS UI theme: implemented with off-white base, teal/emerald primary, lavender secondary, and peach/coral accent.
- [x] Audit dashboard/cards/buttons for dead clickable affordances and wire existing MVP actions/routes.
- [ ] Add active campaign/application counts in more places only if backed by existing data.
- [ ] Improve duplicate-apply UX by showing applied status on campaign detail when data is available.
- [ ] Add more explicit empty states for first-time brand and creator onboarding after manual QA.
- [ ] Review mobile layouts on real device widths.
- [ ] Normalize brand campaign preview and creator campaign detail presentation where useful.
- [ ] Consider a dedicated brand campaign management route if dashboard anchors become too crowded.
- [ ] Consider application detail drawers/routes if recent application/applicant rows need deeper review beyond existing campaign/application lists.

## Backend Improvements

- [ ] Add broader service/controller tests for auth, profiles, campaign create/update/publish/archive, and creator apply flow.
- [ ] Consider returning creator application state in campaign details to prevent duplicate apply attempts from the UI.
- [ ] Consider consistent 403 vs 404 semantics for owned resources; current behavior often hides inaccessible campaigns as not found.
- [ ] Replace local image storage with Cloudinary or another object storage provider before production if needed.
- [ ] Add production-ready CORS configuration.
- [ ] Add pagination for campaign and application lists before data grows.

## Future Features

- [ ] Public brand profile pages.
- [ ] Campaign search/filtering beyond current basic browsing.
- [ ] Notifications for application status changes.
- [ ] Payments/commission tracking.
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
