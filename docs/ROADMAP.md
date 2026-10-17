# Delivery plan — approval gates and acceptance criteria

## Phase 0 — research and first demonstrator (THIS PACKAGE)

- [x] Benchmark the main POS features and Spanish restaurant workflows against official vendor documentation.
- [x] Build an original responsive layout for floor plan, waiter, kitchen, reporting, menu editing, stocktake and cash-up.
- [x] Prototype visual table/cover states, required choices/extras, kitchen flow, simulated payments, report changes.
- [x] Include editable modifier groups, menu photos and sample stock adjustment actions.
- [x] Run browser smoke test (desktop and mobile); source `tests/test_smoke.py`.
- [ ] Owner review of initial interface; mark approved sections before changing design.
- [ ] Create private GitHub repository; publish initial source and README there.
- [ ] Deploy safely labeled demo at an accessible public URL (host to be approved).

## Phase 1 — product design decisions

- Confirm brand/name, restaurant type (full-service, bar, cafe, multi-venue), minimum number of waiter terminals, kitchen stations, printer devices and languages.
- Approve a table layout editor; seat-level ordering, merging tables, reservations, favorites and rapid checkout.
- Approve configurable modifier editor (visual), course timing, allergens, tax profile UI, fixed/menu pricing and discounts.
- Choose test devices and validated printer/payment integrations; do not assume hardware support.

## Phase 2 — shared backend foundation

- Database migrations, tenant+venue separation, users and role permissions, back-office API, image storage, transaction ledger, audit trail, server validation.
- Replace localStorage demo with authenticated backend and terminal device enrollment.
- Unit/integration test: reprice never changes existing ordered item amount; unauthorized actions rejected.

## Phase 3 — production service workflow

- Multi-waiter concurrent orders, kitchen stations and acknowledgments, seat/course lifecycle, split tenders and bills, refunds/voids with permissions, responsible cash-up.
- Real offline queue, idempotent sync, outage recovery, data export and backups.
- Test with at least two active waiter devices and one kitchen display.

## Phase 4 — Spain regulatory/hardware verification

- Live invoice/receipt data models, legally validated compliance integration, correct tax matrices, traceable corrections, fiscal certificate/declaration as applicable.
- Test receipt and kitchen printing; provider-approved physical payment flows.
- Conduct external security/privacy and fiscal review before restaurant pilot.

## Phase 5 — pilot and commercialization

- Controlled pilot in one partner restaurant; capture training time, order throughput, bugs and cash discrepancies.
- Multi-venue plans, licensing/subscriptions, remote support, onboarding and support boundaries.

## Critical workflow acceptance checks

1. Adding one €23.50 steak + €2 chips substitution + €1.50 sauce equals €27.00; quantity two equals €54.00 before any later discounts or taxes.
2. A waiter can seat a table and send complete modifier notes to the KDS in a few clear steps.
3. Each line shows its course; ticket cannot be lost/reprinted twice after a retry in the eventual backend.
4. Product-price edits do not change price already captured on open/closed orders.
5. A fresh shift excludes receipts from the previous shift.
6. Stock counts record a reason and maintain movement history rather than deleting prior movement.
7. Real reports are computed server-side; demo financial statistics must never be mislabeled as factual revenue.
8. Product manager can change images/menu without writing code.
9. No production rollout before applicable Spanish invoice and fiscal requirements are verified.

## Open decisions for owner (do not assume)

- Commercial brand, UI style direction and whether current look is approved.
- Which restaurant type should be the initial launch target.
- Private repository name and deployment host; do not publish proprietary source publicly.
- Required offline duration and list of actual target devices/peripherals.
- Commercial pricing/licensing and support geography/languages.
