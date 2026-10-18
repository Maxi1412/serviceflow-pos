# ServiceFlow POS — Restaurant operations prototype v0.5

**Development/demo software only · 18 October 2026 · EUR · Sample restaurant: Marina Bistro**

This project explores a future commercial restaurant point-of-sale system for restaurants and bars in Spain. The visual theme is original, preserving the approved ordering and management UI while switching the till home page to a full-size floor plan. It separates three workspaces:

| Workspace | What you can try |
| --- | --- |
| **Waiter / Tables** | Open straight to a large touch-first Inside / Outside room plan; tap a positioned table to open the details drawer; seat covers, browse categories and subcategories, choose a dish, add cooking preferences, side substitutions, extras and kitchen notes, send to station, simulate payment |
| **Kitchen** | Review tickets and modifiers filtered by hot kitchen, cold kitchen, dessert or bar; mark food prepared |
| **Back Office** | Drag-and-drop floor designer, room creation, table number/name, shape and seats; individual product/menu/photo/cost setup, bulk product CSV import with preview, table/area management, preparation station routing, stocktake, hourly dashboard, simulated cash-up |

## Preview and source

- **GitHub Pages (standalone local-data demo):** `https://maxi1412.github.io/serviceflow-pos/` (works once the owner activates the Pages deployment successfully; not verified remotely from the build environment).
- **Portable standalone demo:** open `demo-standalone.html` in a browser. No server needed; every browser has its own demo data in localStorage.
- **Connected local prototype:** `npm start` on Node.js 20+ and open `http://127.0.0.1:4317/` from that same computer. Tested with Node.js 22.16.0. It stores data at the ignored `data/runtime.json` and shares changes between browser sessions on that LOCAL loopback host. Do not expose this unauthenticated server to a network or internet.
- **Tests:** `npm test` (Node backend); `python tests/test_interface.py`; `python tests/test_v03_interface.py`; `python tests/test_v04_floor_designer.py`; `python tests/test_v05_ordering.py` (optional Playwright+Chromium environment).

**GitHub Pages does not execute the Node backend.** A product edited in the static online demo appears to the same browser's waiter view, but not on other phones. Shared deployment awaits a secure backend.

## Changes in v0.5 — MICROS-informed ergonomics (original ServiceFlow UI)

- **Waiter order entry now uses the full workstation canvas**: check detail on the left, large category/product keys on the right, persistent check total and prominent send/hold/fire/payment command strip. Floor plan still opens first.
- Assign **Seat 1…n** or Shared when adding a product to a table; unsent line seat can be changed with the check-side action.
- **Hold** any unsent item: normal **Send order** deliberately excludes held lines. **Fire held** sends those later. Routes to the existing test KDS/print queue include seat number, course, modifiers and notes.
- **Back Office → Menu editor** can set per-product POS button colour and touchscreen priority (0–99). Waiter keys sort accordingly, with menu search and category/subcategory buttons.
- Full details and primary Oracle research links in `docs/V05_MICROS_RESEARCH.md`. This is an original UI, not an Oracle replica.
- Validation: existing backend and interface regression tests, plus the new seat/hold/fire/search/presentation Playwright smoke test.

## Changes in v0.4

- The waiter till now opens directly into a room-sized, touch-oriented table layout without financial KPI cards crowding the screen. Tabs include **Inside**, **Outside · Terrace**, and any further configured rooms (the fictional seed also has a Bar area).
- Tap a positioned table to reveal the seat/order/details drawer. Click **Full screen** on compatible browsers or till terminals for an immersive view.
- Open **Back Office → Floor designer** to drag tables with mouse or touch, edit name/number, room, seating capacity and round/square/rectangle shape. Add tables and areas; delete only empty tables. Arrow keys move a focused table by 1%, Shift+arrow moves 5%.
- Floor coordinates and area definitions persist in demo browser storage or in the local prototype backend when connected; the waiter plan sees the changes. The API validates geometry and rejects concurrent conflicting updates.
- Existing menu, reporting, stock and kitchen screens are preserved.

## Earlier changes in v0.3

- Import up to 500 products using CSV from **Back Office → Menu editor → Bulk menu import**. Download the template, upload your CSV, check the preview, and confirm. Existing products are not overwritten. Assign photos and steak modifier groups with the individual editor. CSV columns: `name,price,cost,family,category,subcategory,course,station,icon`.
- **Back Office → Settings → Table & area setup:** add tables and areas; rename a table and change its area. Changes appear in the waiter table plan.
- Waiter subcategory quick filters (e.g. Mains → Steaks) where a category has several subcategories.
- Prototype server `/api/patch` supports scoped compare-and-swap changes so edits on independent tables/products no longer reject each other. Same-resource conflicts are detected and not silently overwritten. Logical kitchen tickets remain server-generated on newly sent order lines.

## Critical limitations

- **No user authentication or permissions.** Waiter and manager workspaces are UI tabs, not isolated or secured roles. No server should be exposed outside loopback.
- **No real fiscal receipts / VERI*FACTU compliance / card payment processing / printer integrations**. All prices and reports are demo values and are not suitable for real accounts.
- **No real kitchen printer jobs.** Ticket routing is an in-app simulation/queue. Physical ESC/POS, driver spooler, acknowledgements, retries and paper status require separate tested hardware integrations.
- **No multi-restaurant/tenant isolation, cloud hosting, database, offline merge, backups or secure mobile pairing.** The standalone preview is browser-local, not a shared server.
- Prices are modeled as JavaScript numbers in EUR in this demo. Production financial records require robust money and tax calculations and append-only audit history.

## Files

- `index.html`, `style.css`, `app.js`: responsive interactive frontend and manager screens.
- `demo-standalone.html`: bundled browser-only demonstration.
- `server/server.mjs`: dependency-free Node test API (`/api/state`, `/api/patch`, compatibility `/api/commit`).
- `data/seed.json`: fictional seed. Test writes go to ignored `data/runtime.json`.
- `tests/backend-floor.test.mjs`, `tests/backend-patch.test.mjs`, `tests/backend.test.mjs`: backend integration tests.
- `tests/test_v03_interface.py`, `tests/test_interface.py`: optional headless browser tests.
- `docs/V05_MICROS_RESEARCH.md`, `docs/V04_IMPLEMENTATION.md`, `docs/V03_IMPLEMENTATION.md`: feature changes, test scope, limitations and next development tasks.
- `docs/ARCHITECTURE.md`, `docs/FEATURES.md`, `docs/ROADMAP.md`, `docs/SPAIN_COMPLIANCE.md`: research and roadmap (earlier documents may reflect original plans).

The provisional ServiceFlow name has not been trademark-cleared. Code is not licensed for public redistribution. A public GitHub repository is visible to everyone; do not store secrets or actual client/customer data here.
