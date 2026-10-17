# Feature research and POS functional catalogue

**Research date:** 17 October 2026. This is a feature benchmark rather than a claim that every competitor offers every feature or that features are free at each tier. Official supplier pages were checked.

## Competitor benchmark

### Loyverse POS
Source: https://loyverse.com/features and https://loyverse.com/en-us/restaurants-pos and https://help.loyverse.com/help/shift-management-loyverse-pos

- Smartphone/tablet till, open tickets, discounts, returns, split/merge open checks, predefined table tickets, dining modes, printed/email receipts, modifiers, variants.
- Multi-location management, offline sales (synchronization on reconnect), cash drawer/shift tracking, customer display, kitchen display/printer routing, staff performance/access rights.
- Inventory with ingredient/composite items, low-stock alerts, purchase orders, stock transfers, counts, stock corrections, historical valuation, export.
- Reporting: sales trends by period, peak workload hours, popular items, sales by employee, cash discrepancies.
- Important: some advanced inventory and employee functions are paid add-ons; do not present the entire catalogue as free.

### HowToPay POS
Source: https://www.howtopay.com/ and https://news.howtopay.com/news/posmanualoct2025

- Android, Windows, iOS/web, cloud-based remote setup/control, offline-supported core till, configurable items, receipts, multi-terminal options and kitchen support.
- Its website's Basic plan advertises one terminal and basic reports as free; the Pro plan lists kitchen display, inventory and staff accounts as paid features; Enterprise lists multi-location analytics/integrations.
- Use as inspiration for easy initial setup and cross-device compatibility, not its code or appearance.

### Cegid Revo XEF (Spain-specific reference)
Source: https://revo.works/software-gestion-restaurantes-hosteleria and https://support.revoretail.works/es/articles/604 and https://apps.apple.com/es/app/revo-xef-pos-tpv-restaurantes/id942396398

- Room/table plans, real-time occupancy colors, covers, waiter assignment, seating and movement; dining room, bar, takeaway/delivery service modes.
- Detailed kitchen instructions, dish/course order, seat assignment, kitchen screens; item modifiers, dishes, allergens, pricing tiers.
- Split bill per item/diner, tips, refunds, discount, varied payments; X and Z reporting, cashier opening/closing, remote management; reservations, inventory, loyalty, delivery integrations.
- Particularly useful reference for typical Spanish restaurant processes and terminology.

### Square for Restaurants (Spain)
Source: https://squareup.com/es/es/point-of-sale/restaurants/features and https://squareup.com/es/es/point-of-sale/restaurants/kitchen-display-system

- Drag-and-drop floor plans, quick restaurant order entry, kitchen station routing, KDS timers, payment options, employee schedules, inventory links, QR ordering.
- Advanced features vary by subscription and hardware/integration availability.

## Feature backlog taxonomy — full target vision

| Domain | Requirements | v0.1 status |
| --- | --- | --- |
| Menu/catalogue | Categories, courses, photos, price lists, favorites, variants, allergens, availability, time-limited menus, multilingual names | Categories, photo, price, course, options demo; rest planned |
| Table service | Custom floor-plan editor, dining areas, table status, covers, table merge/move, per-seat items, waiter assignment, reservations | Areas, covers, status, move demo; other items planned |
| Ordering | Touch tile layout, search, barcode optional, quantities, detailed modifiers and prices, mandatory doneness, free-text notes, item/course routing | Core demo implemented |
| Kitchen | Printing/KDS by station, courses fire/hold, prepare/ready/served stages, timers, priority, cancellation alerts | Basic sent/ready demo |
| Bill/payment | Guest checks, split by person/item, shared payment, cash/card/contactless integration, discounts, tips, partial payments, refunds, receipt reprint | Single simulated full payment; rest planned |
| Cash-up | Shift opening, paid-in/out, cash drawer expected vs counted, X/Z reporting, employee accountability, lock/approval | Basic demo implemented; fiscal reports planned |
| Inventory | Ingredient recipes, yields/units, purchase orders, suppliers, wastage, recipe cost, stock counts, variance, low stock, multi-site transfers | Manual counts and thresholds demo |
| Reporting | Revenue by hour/day/menu/section/waiter, covers, average per cover, payment mix, VAT, discounts/voids, COGS, margins, exports | Simple per-hour and by-method demo |
| Staff | PIN login, roles, check-in/out, permissions, accountability, handovers, audit trail | Not yet (manager label is not an auth role) |
| Channels | In-house, bar, terrace, takeaway, delivery, online ordering, QR self-order, reservations | Basic in-house/bar/terrace demo |
| Devices | Windows/PWA/Android, printer/terminal pairing, cash drawer, kitchen terminals, offline resilience | Responsive PWA shell; no peripherals |
| Administration | Remote multi-venue management, tax profiles, images, menu versioning, backups, licenses, onboarding wizard | Basic menu/settings demo |
| Spain | Appropriate invoices/receipts, applicable tax rules, immutable fiscal record logging, correct statutory certificates, GDPR | Research only; not implemented |

## Usability priorities

1. A waiter should not need to open long menus to add common products; large tiles, favorites and quick search should support fast operation.
2. All mandatory choices, especially steak cooking preference and side dish, must be obvious at ordering time.
3. Managers should be able to change extras, dish names, prices, photos and table layouts without code changes.
4. Staff actions should be attributable and reversible only under controlled, logged workflows (especially voids and refunds).
5. Kitchen screens should convey the full requested specification; modifier/notes cannot be lost on send/retry.
6. There must be clear online/offline status and **no duplicate orders** on reconnection.
7. Only legally valid receipt flows may be enabled for live restaurants.

## Feature differentiation worth evaluating

- One-click setup from a menu spreadsheet or photographed menu, with review before publication.
- Bilingual/Multilingual waiter interface (Spanish, English, German) and dish display names per language.
- Price-specific side dish substitutions, inclusive/modifier groups and enforced allergy acknowledgment.
- Local venue ownership of customer data, export tools, and transparent support/subscription licensing.
