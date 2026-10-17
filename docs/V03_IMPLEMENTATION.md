# ServiceFlow POS v0.3 — connected-demo increment

17 October 2026. The interface is an original demo and is NOT production-ready restaurant, payment, invoicing or cash software.

## Improvements since v0.2

### Back Office
- Import a menu CSV into the manager menu screen. Includes downloadable CSV template, parsed preview, row validation, duplicate detection on category + name, and an explicit import step. Import adds records only; it never overwrites existing product edits. At most 500 rows / 300 KB per import. CSV includes name, price, cost, family, category, subcategory, course, station and optional icon; use the product editor for photographs and modifier groups after import.
- Create and rename table names/areas from Back Office → Settings. These immediately appear in the waiter floor plan in standalone mode, and on other browsers connected to the same local server after synchronization. No table deletion or geometric drag-and-drop editor yet.
- Existing product photo uploads, individual pricing, cost, modifier groups, preparation-station selection, inventory and dashboard remain unchanged.

### Waiter
- Menu has optional subcategory filters, shown when more than one subcategory exists within a category. A new product from CSV is visible after import without changing the waiter UI architecture.
- Existing order line modifiers, course and notes are copied into queued station tickets.

### Shared local server
- `POST /api/patch` applies optimistic changes per touched table/product/inventory item/station, and compares base snapshots for singleton objects (routes, categories, ledger, shift, restaurant, etc.). Edits to different tables no longer collide just because the overall database revision advanced.
- Conflicting edits to the SAME item return 409; the UI refreshes from the server and tells the user to review and retry. No silent overwrite. This is not a full conflict-free or offline merge system.
- Request IDs are de-duplicated (last 300 requests). Server, not client, generates one logical kitchen/bar ticket per group of newly sent order lines.
- Legacy `/api/commit` remains for v0.2 compatibility and regression testing but v0.3 frontends use `/api/patch`.
- Persistence is an atomic local JSON rename. There is no database, tenant segregation, authentication, HTTPS, rate limiting, durable journal, remote hosting, backup policy or production-grade money ledger.

## Deployment modes (do not confuse them)

1. **GitHub Pages**: static files from the repository root. It is an installable standalone demonstration. Every browser has its own local data; changes DO NOT synchronize across remote phones/computers.
2. **Local Node test server**: start it on a development computer running Node 20+ with `npm start`. Verified with Node 22.16.0. It listens ONLY on 127.0.0.1:4317 by default. Browsers on that same machine share menu, tables and logical station tickets. No remote access. Changing the bind address or allowing other computers/phones onto the endpoint is NOT supported for production because the server is unauthenticated.

Physical printer routing means **logical printer queue ONLY**. No job has been physically printed. A production print bridge must use confirmed ESC/POS/native driver/device-specific APIs, a durable spooler, retries, status confirmation and station-by-station mapping.

## Tests performed
- `npm test`: 2 Node tests; old global revision conflict / station routing and new scoped update concurrency / duplicate ticket handling / persistence / access control for local runtime JSON.
- `python tests/test_interface.py` and `python tests/test_v03_interface.py`: headless local Chromium smoke tests, using a standalone browser and mocked `/api/`. They test the original UI and v0.3 CSV, floor editing, menu subcategories and station ticket generation.
- **Limitations**: browser-to-server end-to-end testing was attempted but Chromium access to a loopback HTTP page was blocked by the test environment administrator. The API has separate integration coverage; never claim an unverified full multi-device production scenario was tested.

## Next priorities
1. Dedicated authentication/authorization with manager/waiter/kitchen roles and tenant/venue isolation.
2. Transactional backend using PostgreSQL (or approved production database), monetary cents and auditable append-only receipts.
3. Menu modifier builder with visual group editor and safe price overrides; advanced restaurant order flows: split bills, seat assignments, course firing, refunds/voids.
4. Managed printer-agent service and live station device tests; receipt printer distinguished from kitchen tickets.
5. Spanish tax, invoice and fiscal requirements validated against legislation in force before pilot.
6. Secure remote hosting, backups, health monitoring and end-to-end mobile testing with approved hardware.
