# v0.2 — front-end, Back Office and shared-state backend

## Tested (17 October 2026)

- `npm test`: passes API checks: health, menu update, conflict 409, new station ticket, replayed request ID, blocking direct data access.
- Chromium browser interactions: pass offline: waiter + Back Office + kitchen tab navigation, cost and station editor controls, order with modifiers, generate virtual station ticket, no uncaught JS errors.
- Additional connected browser harness: confirmed manager-edited selling price observed on a separate waiter page and modified kitchen instructions displayed at a separate kitchen page. Full multi-terminal production testing remains outstanding.

## Architecture

- Frontend (`app.js`) starts from local demo data. If it can contact its origin `/api/state`, it switches to **Connected demo** mode and discards the local preview state for the server's current record.
- Server (`server/server.mjs`) keeps a single JSON state in a local file with atomic rename on save. It accepts `/api/commit` snapshots with the previously read integer revision and a request ID. Writes conflict with HTTP 409 if a different terminal has committed first. Clients reload the latest state rather than silently overwriting it.
- Every 2.5 seconds, an idle connected page checks `/api/state`. It skips polling while a modal or input is being edited. The shared server generates a queue ticket for each new sent order line; grouping by station avoids repeating an unchanged sent line. Request IDs provide rudimentary replay protection.
- The service worker caches the static interface but **never caches `/api/`**, so reads of server data are not silently stale.

## Important limitations

1. **Concurrency:** Full-state update means two waiters changing different tables at once can conflict; one change must be retried. This is deliberate to avoid silent data loss but not adequate for a real restaurant. Introduce atomic API commands such as `openTable`, `addOrderLine`, `sendOrder` and `settlePayment`, database transactions and idempotency keys.
2. **Network:** Server default binds only to `127.0.0.1`; devices cannot connect over the LAN until a secured multi-device server is designed and approved.
3. **Security:** No credentials, permissions or user roles. The three workspace tabs are a visual separation, **not access control**. Never expose the server on the internet.
4. **Fiscal:** No invoice or payment service; paid transactions are fictional simulated examples.
5. **Printing:** The queue shows intended destinations. No direct hardware printing, reprint/void handling, receipt printing, offline printer spooler, print acknowledgment or status, duplicate-print recovery. Real device integration is pending hardware specification.
6. **Images:** Product photo snapshots are stored as compact base64 images in demo JSON; production requires a media store, quotas and validation.
7. **Stock and margin:** Product cost is a user-entered reference value. There is no recipe ingredient consumption, true COGS or margin reporting yet.
8. **Multi-restaurant:** The backend holds a single fictional restaurant and has no license/tenant isolation.

## Research decisions

Loyverse documents category-based printer groups and station-specific printing; Revo XEF documents printer groups assigned at group, category and product levels, including multiple destinations. The prototype implements logical station routing with a product override and category fallback; physical mapping and multi-destination routing remain in backlog.

References:
- https://help.loyverse.com/help/using-kitchen-printers
- https://help.loyverse.com/help/set-kitchen-printer-each
- https://support.revoxef.works/en/articles/24
- https://support.revoxef.works/en/articles/191

Spanish fiscal framework and VERI*FACTU commencement dates must be checked against binding BOE/AEAT guidance at commercial release, especially after the proposed October 2028 postponement reported in October 2026. Avoid building a custom fiscal engine without specialist compliance review.
