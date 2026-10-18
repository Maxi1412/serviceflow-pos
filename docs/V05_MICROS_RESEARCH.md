# MICROS Simphony research → ServiceFlow design decisions

Reviewed 18 October 2026. Original ServiceFlow design and code; *not* a copy of Oracle interfaces, logos, icons or source.

## Primary references (official Oracle documentation)

1. [Workstation Touchscreen Pages](https://docs.oracle.com/en/industries/food-beverage/simphony/19.7/simcg/c_workstation_touchscreen.htm): tabbed workplace-specific pages, roles, dynamic buttons, contextual menu levels.
2. [Menu Item Screen Lookup](https://docs.oracle.com/en/industries/food-beverage/simphony/19.8/simcg/c_menu_items_screen_lookups.htm): grouping items into efficient, paged touch keys; sorts/colors/fonts.
3. [Hold Items](https://docs.oracle.com/en/industries/food-beverage/simphony-essentials/simsl/t_check_func_hold_items.htm): keep items off order devices until ready.
4. [Fire Items](https://docs.oracle.com/en/industries/food-beverage/simphony-essentials/simsl/t_check_func_fire_now.htm): send pending items by seat / family / individual selection.
5. [Edit Seat](https://docs.oracle.com/en/industries/food-beverage/simphony-essentials/simsl/t_check_func_edit_seat.htm): assign, move, and share seat-linked items.
6. [Configuring a Printer Order Device](https://docs.oracle.com/en/industries/food-beverage/simphony/19.8/simcg/t_printers_config_printer_order_device.htm): routing groups, course headers, seat numbers, primary and backup devices, order chits.
7. [Configuring Menu Item Definitions](https://docs.oracle.com/en/industries/food-beverage/simphony/19.8/simcg/t_menu_items_configure_mi_definitions.htm): touchscreen sort priority, menu levels, kitchen output configuration.
8. [Restaurant table-management gestures](https://docs.oracle.com/en/industries/food-beverage/simphony/19.6/sipou/r_tms_gestures.htm): table gestures / context commands, host mode, room status.
9. [Simphony POS user guide](https://docs.oracle.com/en/industries/food-beverage/simphony/sipou/index.html): check handling, dining rooms, payment, modifiers, shift operations.

## What we implemented in v0.5

| Pattern | ServiceFlow implementation | Status |
|---|---|---|
| Full work area for tills | Full-width original order workspace, avoiding standard analytics sidebar | Working demo |
| Guest-check visibility | Fixed check panel with clear live total and item details | Working demo |
| SLU-like family buttons | Large colored categories, subcategories and menu search | Working demo |
| Manager-controlled button presentation | Individual product color and 0–99 ordering priority | Working demo |
| Seat handling | New items can be assigned to 0/shared or a cover/seat number; unsent items can be reassigned | Working demo |
| Hold & fire | Hold unsent line, send unheld lines, fire held lines separately | Working demo |
| Station order routing | Only newly sent lines create logical kitchen/bar jobs; ticket includes course and seat | Test server and demo queue, NO physical printer |
| Existing table plan | Floor-plan home, area tabs and drag editor preserved | Working demo |

### Details and deliberate constraints

* Existing demo state migrated in place; new product properties are added at normalization. Existing check lines gain `seat=0` and `held=false` when absent.
* An order line can only be held or reassigned before sending to a station. Sending held items requires a distinct Fire action.
* In the standalone HTML, logical tickets are stored locally. The connected test server constructs print tickets from newly sent lines and does not let the browser author the printer queue.
* Check display uses **no Oracle artwork or assets**. Styling is custom and consistent with previously approved ServiceFlow brand and colours.
* Product color and sort priority are stored in the product record, so they are carried by the same demo local state / test backend as prices and station routing.

## Prioritized next-stage MICROS-derived requirements (NOT implemented)

**P1 — transaction core:** per-line and per-course firing, course sequencing, split bills by seat/item/equal value, guest check transfers, staff PIN permission checks, atomic order submissions, cash/void/discount audit log, server-side pricing and tax calculation.

**P1 — kitchen device layer:** individual station printer mapping, fallback printer and spool queue, acknowledgements, duplicate/void tickets, send/refire audit, device failure monitoring, original tickets with course/seat/notes, configurable content per printer.

**P2 — operations:** waiter sections and table ownership, waitlist/reservations, 86'd items and stock availability, recipe-level inventory decrement, smart quick keys, configurable page templates for breakfast/lunch/dinner, multilingual ES/EN UI, more touch gestures.

**P2 — management:** restaurant/site profiles, cashier drawer shifts, granular reporting on hourly revenue / labour / stock / discounts, multi-site management, staff access and backup/restore.

**Spain-specific release gate:** legal review of the fiscal invoice/receipt flow (relevant AEAT rules and final effective dates), VAT, payment integration, privacy/security, immutable audit history. No commercial processing until validated.
