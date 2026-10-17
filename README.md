# ServiceFlow POS — Restaurant operations prototype v0.3

**Development/demo software only · 17 October 2026 · EUR · Sample restaurant: Marina Bistro**

This project explores a future commercial restaurant point-of-sale system for restaurants and bars in Spain. The visual theme is original and retains the first approved v0.2 service interface. It separates three workspaces:

| Workspace | What you can try |
| --- | --- |
| **Waiter / Tables** | Select restaurant area/table, seat covers, browse categories and subcategories, choose a dish, add cooking preferences, side substitutions, extras and kitchen notes, send to station, simulate payment |
| **Kitchen** | Review tickets and modifiers filtered by hot kitchen, cold kitchen, dessert or bar; mark food prepared |
| **Back Office** | Individual product/menu/photo/cost setup, bulk product CSV import with preview, table/area management, preparation station routing, stocktake, hourly dashboard, simulated cash-up |

## Preview and source

- **GitHub Pages (standalone local-data demo):** `https://maxi1412.github.io/serviceflow-pos/` (works once the owner activates the Pages deployment successfully; not verified remotely from the build environment).
- **Portable standalone demo:** open `demo-standalone.html` in a browser. No server needed; every browser has its own demo data in localStorage.
- **Connected local prototype:** `npm start` on Node.js 20+ and open `http://127.0.0.1:4317/` from that same computer. Tested with Node.js 22.16.0. It stores data at the ignored `data/runtime.json` and shares changes between browser sessions on that LOCAL loopback host. Do not expose this unauthenticated server to a network or internet.
- **Tests:** `npm test` (Node backend), `python tests/test_interface.py`, `python tests/test_v03_interface.py` (optional Playwright+Chromium environment).

**GitHub Pages does not execute the Node backend.** A product edited in the static online demo appears to the same browser's waiter view, but not on other phones. Shared deployment awaits a secure backend.

## Changes in v0.3

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
- `tests/backend-patch.test.mjs`, `tests/backend.test.mjs`: backend integration tests.
- `tests/test_v03_interface.py`, `tests/test_interface.py`: optional headless browser tests.
- `docs/V03_IMPLEMENTATION.md`: precise new features, test scope, limitations and next development tasks.
- `docs/ARCHITECTURE.md`, `docs/FEATURES.md`, `docs/ROADMAP.md`, `docs/SPAIN_COMPLIANCE.md`: research and roadmap (earlier documents may reflect original plans).

The provisional ServiceFlow name has not been trademark-cleared. Code is not licensed for public redistribution. A public GitHub repository is visible to everyone; do not store secrets or actual client/customer data here.
