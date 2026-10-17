# ServiceFlow POS 0.4 — visual floor plans

17 October 2026. Demo-only release.

## Waiter interface
- App opens in Waiter / tables mode, displaying a full-width, touch-friendly, correctly positioned floor plan instead of revenue cards.
- Area tabs show Inside (internally Main room), Outside · Terrace (internally Terrace), Bar, plus custom areas. Previous table IDs and names remain compatible.
- Click a table to open a slide-out inspector with existing covers / open-check / seat / order controls. The inspector disappears when closed; waiter canvas retains maximum area.
- Full screen button uses the browser Fullscreen API and requires a user tap. On unsupported browsers it may do nothing; the app still fills the tab width.

## Management Back Office
- New Floor designer workspace with drag-and-drop position saving for table x/y percentages; mouse, pen and touch pointer events are supported.
- Edit name/number, zone, shape and seating capacity, or add a table / new area. Deletion is allowed only for an empty table; sending an occupied table to a different zone retains its order.
- Keyboard position adjustment for accessibility: arrow moves 1%, Shift+arrow moves 5%.
- Existing Back Office → Settings form remains compatible.

## Data / backend integration
- Each table gains x/y (percentage center), shape (rect/round/square) and seats. Legacy tables without the new fields are migrated in memory to deterministic default positions. Existing browser localStorage key is intentionally unchanged.
- New areas singleton array is synchronized by the demo /api/patch API. Existing server validates geometry ranges, names and capacities before persisting.
- Still a demonstration backend only, binding to loopback; no auth, proper tenant separation, card processing, fiscal receipts, or actual printer integrations. GitHub Pages hosts standalone per-browser data only, not the Node server.

## Testing
- Node backend API tests exercise saving table geometry, renaming, creating an area, validating invalid geometry, and persistence to disk, as well as prior kitchen routing / concurrent changes.
- Chromium tests cover opening floor view, switching areas, tapping tables, dragging a table, editing its name and shape, adding a room and table, seating covers and opening the order screen, and mobile layout.
- The current code preserves old waiter order/cooking modifier and Back Office menu upload features.

## Next production steps
- Secure role-based authentication and route authorization for manager-only layout mutations.
- Separate transactional order tables and event-sourced ticket delivery with reliable printer gateway.
- Harden tablet/till offline recovery and server-based multi-terminal synchronization.
