# Archived planning document. See V03_IMPLEMENTATION.md for implemented v0.3 state.
# Proposed architecture — not yet deployed or configured

## Architectural principles

1. One secure transactional source of truth for money, staff actions, tables and inventory.
2. Distinct interfaces for waiter service, kitchen operation and managers (not three separate databases).
3. A PWA is the initial cross-platform client, with optional Android app wrapper and Windows install experience after device testing.
4. Offline mode must be intentionally modeled and reconciled, never delegated to a naive `localStorage` database.
5. Functional workflow first, visual design iteration with owner approval.
6. No real payments/receipts until fiscal and payment integrations are validated.

## Suggested components (owner approval required before configuration)

- **Touch client:** React + TypeScript with adaptive layouts. Tablet/desktop show table map and check; mobile shows compact navigation and list.
- **Admin client:** Same frontend project but secured RBAC routes; menu/photo editor, floor designer, inventory, employees, reports, taxes and venue settings.
- **Kitchen client:** Optimized KDS interface filtered by kitchen station, with course firing, acknowledgement and audible/visual status.
- **API:** TypeScript Fastify or other vetted web framework with schema validation, realtime event broadcast (WebSocket), permission gates, audit logging and idempotent write commands.
- **Database:** PostgreSQL relational transactions; database migrations and controlled backups.
- **Local cache/outbox:** IndexedDB, durable action IDs, offline optimistic UI, automatic retry with exponential backoff and collision handling.
- **Media:** controlled upload endpoint/object storage, resizing, MIME validation, file size limits, private access where appropriate.
- **Authorization:** separate tenant/venue, named users/PIN or secure tokens, least privilege roles (owner/manager/waiter/kitchen/accountant), terminal enrollment/revocation.
- **Fiscal service:** dedicated Spanish SIF/VERI*FACTU-capable issuance subsystem and immutable archive under expert review.
- **Hardware adapter:** vetted local/remote printer protocols, payment processors with compliant SDKs; POS is never the card-data processor.

## Minimum data entities

- `tenants`, `venues`, `terminals`, `areas`, `tables`, `table_layouts`
- `users`, `roles`, `permissions`, `shifts`, `cash_drawers`, `cash_movements`
- `menu_versions`, `categories`, `products`, `tax_classes`, `modifier_groups`, `modifier_values`, `product_modifier_links`
- `orders`, `order_lines`, `order_line_options`, `order_events`, `kitchen_tickets`, `course_calls`
- `payments`, `payment_allocations`, `refunds`, `receipts`, `invoices`, `fiscal_records`, `fiscal_events`
- `ingredients`, `recipes`, `recipe_lines`, `inventory_movements`, `stocktakes`, `stocktake_lines`, `suppliers`, `purchase_orders`
- `audit_events`, `integration_connections`, `sync_events`

All tenant-specific entities must reference tenant and venue. Money uses integer cents (not binary floating point), tax components recorded precisely, immutable price/tax snapshots on sold order lines. The v0.1 UI holds floating values **for demo only**.

## Workflow examples

### Steak with upgrades

`select_table → seat(3) → add_item(product, qty, options[{doneness:medium},{side:chips,+€2},{sauce:pepper,+€1.50}]) → confirm → send_to_kitchen → prepare → ready → serve → split_check → settle → fiscal_issue → close_table`

`add_item`, `send_to_kitchen`, `settle` and `fiscal_issue` are separate idempotent, auditable commands. Kitchen acknowledges receipt or retry without duplicate.

### Cash-up

`open_shift(float) → payments + in/out events → calculate_expected → physically_count → reconcile_variance → authorized_close → issue_applicable_reports`.

`shift_id` defines the transaction window; do not include previous shift's cash in the new shift even if it is still the same day. Audit both attempted/approved voids.

### Stock movement

`purchase_received → stock_in` and `kitchen_consume(recipe_snapshot) → stock_out`. Record wastage as an explicit movement. Inventory should support counts without rewriting ledger history.

## API contract (draft, NOT running)

- `GET /api/v1/venues/{venueId}/tables`
- `POST /api/v1/orders` (`idempotencyKey` required)
- `POST /api/v1/orders/{id}/items` (`idempotencyKey`)
- `POST /api/v1/orders/{id}/send-kitchen`
- `POST /api/v1/payments` (`idempotencyKey`)
- `POST /api/v1/shift/{id}/cash-count`
- `POST /api/v1/stocktakes`
- `GET /api/v1/reports/sales-hourly`
- `WS /api/v1/venues/{venueId}/events`

All routes are provisional names to illustrate future service boundaries, NOT available endpoints.

## Testing requirements prior to pilot

- Complete table service with multiple waiters, kitchen stations and network interruptions.
- Cents-accurate totals for tips, discounts, partial/split payments, returns and fiscal tax allocation.
- Proper user permissions and reversal trails; tenant isolation and authorization tests.
- Idempotent order kitchen submission under retries and concurrency, conflict resolution when two waiters edit the same table.
- Offline 8-hour shift endurance on supported hardware with queue recovery and nonduplicate kitchen slips.
- Hardware certification per printer model, terminal model, Windows/Android/browser combination.
- Security tests, encrypted transport, secure backups, disaster recovery and GDPR processing compliance.
