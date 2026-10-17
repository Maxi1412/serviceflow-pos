# ServiceFlow POS — restaurant prototype v0.2

**Prototype date:** 17 October 2026. **Target market:** bars and restaurants in Spain. **Product name:** provisional, not trademark-cleared.

> **DEVELOPMENT DEMO ONLY.** This system cannot issue compliant fiscal invoices, settle real card transactions, connect to physical printers, enforce employee roles, or safely host restaurant data on the public internet. The server has no login/authentication and intentionally listens only on loopback (`127.0.0.1`). Do **not** use this with real customer, payment or sensitive business records.

## What is already working

The **same application** has three visually separated workspaces using tabs above the sidebar:

| Workspace | Used by | Working prototype functionality |
| --- | --- | --- |
| **Waiter / tables** | waitstaff | Floor plans by area, cover counts, order taking, cooking temperatures, substitutions, surcharge modifiers, special instructions, course selection, send order, simulated payment |
| **Kitchen** | chef / bar / preparation station | Live-style preparation tickets, filter by kitchen/bar station, show modifiers and cooking notes, mark items prepared |
| **Back Office** | restaurant manager | Edit menu item names, selling prices, ingredient/unit cost, family, subcategory, photograph, modifier rules and kitchen station; category routing; inspect test printer queue; stocktake, hourly sales charts, and shift cash-up |

### Two operation modes

**Standalone preview (browser-only):** Open `demo-standalone.html` on a desktop or Android browser. Browser storage contains the sample restaurant. Changes stay on that device and the displayed kitchen tickets are simulated locally. No server is running behind a downloaded HTML file.

**Connected local test server:** From the folder containing `package.json`, run `npm start` using Node.js 20+ (the tested environment was Node.js 22.16.0). The server listens at **http://127.0.0.1:4317/** on the machine running Node. The browser detects the `/api/state` endpoint and uses a shared, persistent JSON data store. Pages opened from this same server automatically retrieve newer data every ~2.5 seconds. This proves the manager → waiter → kitchen flow; it does **not** implement industrial-grade transactional concurrency, offline reconciliation or security.

Use `npm test` for the automated backend tests (they have been run successfully with Node.js 22.16.0). The browser interface was also tested with headless Chromium.

### Sample test procedure

1. Back Office → Menu editor → edit Sirloin steak selling price or station, and save.
2. Waiter / tables → seat an empty table → Waiter POS → add Sirloin steak, chips substitution and sauce.
3. Send to kitchen.
4. Kitchen → choose **Hot kitchen**, observe the item and preparation notes.
5. Back Office → Kitchen routing → review the job created for the hot kitchen. **A job in the list is not proof that a printer has printed it.**

## Restaurant routing model

- `family`: overall grouping such as Food or Beverages.
- `category`: clickable waiter menu section such as Starters, Mains, Desserts or Drinks.
- `subcategory`: optional further menu organization such as Meat / Grill.
- `stationId`: per-product preparation destination, overridable by the manager.
- `routes`: default category → station mapping; initially Starters → Cold kitchen, Mains → Hot kitchen, Desserts → Dessert station, Drinks → Bar.
- `stations`: logical output endpoints and intended physical printer labels.
- `printJobs`: *virtual* server-side print queue; new server jobs are created only for previously unsent order line IDs. Jobs are grouped by destination, table and send action.

Actual print device discovery, ESC/POS or driver integration, paper status, retries and confirmations are later milestones. Printer selection and kitchen-display permissions have not been secured.

## Source tree

- `index.html`, `app.js`, `style.css` — original responsive three-workspace frontend.
- `server/server.mjs` — dependency-free Node HTTP shared-state prototype server.
- `data/seed.json` — fictional sample restaurant dataset. Test writes go to the Git-ignored `data/runtime.json`.
- `demo-standalone.html` — portable single-file offline demo.
- `manifest.webmanifest`, `sw.js`, icons — installability assets; `/api/` is deliberately never cached by the service worker.
- `docs/ARCHITECTURE.md`, `docs/FEATURES.md`, `docs/ROADMAP.md`, `docs/SPAIN_COMPLIANCE.md` — research and intended later production design.
- `docs/V02_IMPLEMENTATION.md` — current trade-offs, architecture and unfinished safety work.
- `tests/backend.test.mjs` — automated persistence/conflict/ticket-generation tests.
- `tests/test_interface.py` — optional local Chromium interaction checks, requires Playwright/Chromium installed separately.

## Hosting and what GitHub Pages can and cannot do

The public GitHub Pages site serves **only the static standalone demo**. GitHub Pages cannot host `server/server.mjs` or share its local JSON data between devices. The real multi-device integration will require an authenticated backend on another host. Do not try to use the demo to process real orders or payments.

**Repository visibility:** If you intend to commercially license ServiceFlow as proprietary software, make the repository **Private** in GitHub Settings → General → Danger Zone → Change repository visibility. Publishing from a private repo may require a separate deployment arrangement, depending on your GitHub plan. The current repository may be public.

## Engineering status / next milestones

**Implemented:** coherent navigation, editable product metadata/costs, logical station routing, split kitchen queue simulation, shared local demo server, server revision checks and read-only state sync, simple persistent local storage, API tests.

**Not implemented:** secure login, server-issued roles, table transactional mutation endpoints and merges, durable reliable offline queue, restaurant isolation/multi-tenancy, PostgreSQL, photo object storage, secure LAN/mobile setup, actual printer dispatch, payment providers, stock deduction using recipes, refunds, split bill, Spanish tax and fiscal ticket compliance, audit immutability, backups, monitoring, production hosting. See `docs/V02_IMPLEMENTATION.md`.

All artwork and code are original to this prototype; competitor features are used as functional research, not source-code copies. No open-source license has been granted.
