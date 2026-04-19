/**
 * Audience routes — three-layer audience list management and Mbiaat sync.
 *
 * Endpoints:
 *   GET  /audience/templates               — All 12 preset templates with live counts
 *   POST /audience/preview                 — Preview audience count + sample
 *   POST /audience/save                    — Save audience list with filters
 *   POST /audience/sync/:listId            — Sync audience list to Mbiaat labels
 *   GET  /audience/lists/:merchantId       — All saved lists for a merchant
 */
declare const router: import("express-serve-static-core").Router;
export default router;
//# sourceMappingURL=audience.d.ts.map