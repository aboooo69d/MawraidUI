# Provider station map location picker

Implemented on `feature/provider-map-location`, based on `main` at
`2ead42364492555b9be71d7c3f8f622555a726d8`. No merge or deployment is part of this change.

## Verified integration and backend limits

The existing coordinate fields and GPS action are in
`src/features/stock/pages/StockCreatePage.jsx`. A provider reaches this screen from
the dashboard's **إضافة مخزون جديد** action. For gas stations, select the gas stock type.

`RegisterProvider` currently collects account/business information, without any
coordinate fields. `stock.api.js` exposes stock creation, retrieval, transactions,
and unit updates; it does **not** expose a stock/station location update endpoint.
There is no existing station location editing screen. Consequently, this feature
integrates with stock creation only. Saved stock locations remain unchanged.
Adding location to account registration or editing a persisted station requires
a verified backend contract first.

The current creation contract, verified against the existing page, API module,
and `stock.api.test.js`, remains:

```http
POST /api/v1/stocks
Content-Type: application/json
```

```json
{
  "stock_type_id": 1,
  "stock_type": "gaz",
  "address": "تعز - شارع جمال بجانب جولة المسبح",
  "location": { "lat": 13.5795, "lng": 44.0209 },
  "units": [{ "name": "اسطوانة", "rate": 1, "is_main": true }],
  "stock_details": { "gaz_stock_type": "exchange" }
}
```

This continues through `stockApi.createStock` and the existing request wrapper,
API base configuration, cookie credentials, validation, and error handling.
There are no backend, schema, auth, API, or environment-variable changes.
Older stock documentation in this repository describes an earlier single-stock
contract; it is not the source for new API fields. Live authenticated backend
persistence has not been exercised; saving tests intercept the existing contract.

## Interaction and data protection

- Leaflet 1.9.4 loads on demand with OpenStreetMap tiles and visible attribution.
  The initial view is Taiz; it does not select coordinates or request GPS.
- Tap/click, drag the marker, or pan with the arrow keys and use
  **اختيار مركز الخريطة** to select the actual station. Coordinates are read-only,
  validated, and rounded to six decimal places as in the previous GPS flow.
- **تحديد موقعي الحالي (GPS)** is the sole trigger for browser location access.
  A detected phone location is a draft. The provider can correct it on the map.
  Approximate GPS accuracy is shown when available.
- **تأكيد موقع المحطة** accepts a draft for the form; the ordinary stock creation
  action persists it. The UI explicitly explains that the location must represent
  the station, not necessarily the phone.
- The picker accepts an existing `value`, but only calls `onConfirm` after the
  provider confirms. A pending change blocks submission; cancellation restores the
  previous accepted coordinates. Opening the picker, GPS errors, map changes, and
  stale GPS callbacks never automatically replace the accepted value.
- `onPendingChange` also blocks submission while GPS is pending. Newer map
  selections/cancellation invalidate late GPS responses. Unmount invalidates them.
- Arabic RTL text, LTR map/coordinates, single-column mobile controls, 44px map/GPS
  controls, map loading/retry, tile retry, and Arabic GPS error states are included.

GPS requires a secure browser context (HTTPS or localhost for local development).
Tiles use `https://tile.openstreetmap.org/{z}/{x}/{y}.png`, with normal browser
caching and no prefetch/offline download. OSM is a best-effort external service;
keep attribution visible and follow its tile usage policy. No map key is required.
Existing Tailwind/font CDN dependencies remain as they were.

## Changed files

| Files | Purpose |
| --- | --- |
| `src/features/stock/components/StationLocationPicker.jsx` | Draft/confirmation, GPS, coordinate display, existing-value protection |
| `src/features/stock/components/StationLocationMap.jsx` | Leaflet lifecycle, marker/click/keyboard selection, OSM tiles and recovery |
| `src/features/stock/components/station-location.css` | Scoped responsive map styling and touch controls |
| `src/features/stock/pages/StockCreatePage.jsx`, `validation.js` | Existing form integration and pending-location validation |
| `src/features/stock/__tests__/StationLocationPicker.test.jsx`, `StationLocationMap.test.jsx`, `LocationMapStub.jsx`, `StockCreatePage.test.jsx` | Picker, map adapter, GPS/validation/save regression tests |
| `e2e/provider-location.spec.js`, `playwright.config.js` | Production-bundle browser tests with real Leaflet |
| `package.json`, `package-lock.json` | Leaflet, Playwright, and compatible Vite React plugin |
| `vite.config.js`, `.gitignore` | Separate browser tests from Vitest; ignore generated test artifacts |
| `docs/features/PROVIDER_MAP_LOCATION.md` | Integration, compatibility, testing and handoff |

## Verification

Use Node 22.12+ (or supported Node 20.19+) for the Vite 8 toolchain; verified here
with Node 24.22.1 / npm 11.9.0.

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm ls --depth=0
```

The pre-existing Vite 8 / React plugin 4 peer conflict is resolved by updating
`@vitejs/plugin-react` to compatible 6.3.0. React stays at 18.3.1. No `--force`,
`--legacy-peer-deps`, or permanent peer-resolution bypass is required.

Verification results:

- 107 Vitest tests passed across 11 files. Coverage includes map click/drag
  propagation, coordinate normalization, read-only fields, explicit confirmation,
  cancellation, an existing saved value, GPS success/denial/unavailable/timeout/
  unsupported/throw/invalid data, stale callbacks/unmount, tile/library recovery,
  validation, exact API payload, and save failure/retry.
- 7 Chromium tests passed against the production bundle: real Leaflet tap/drag,
  read-only coordinates, confirmation validation, exact save payload, RTL and no
  horizontal overflow at 320, 375, 390, 430, 768, and 1280px; plus GPS denial and
  keyboard map correction. Authentication, Turnstile, backend responses, and tiles
  are fixtures, so these tests neither write live records nor depend on OSM.
- Production build and dependency-tree validation passed.
- This managed environment's browser does not trust the HTTPS interception
  certificate used for the existing Tailwind/font CDNs. Browser verification used
  a temporary Playwright config outside the repository with `ignoreHTTPSErrors`
  enabled solely for those local tests. No such setting is committed or applied
  to application code. Normal environments can use the commands above.

## Repository owner handoff

The connected GitHub account has pull/read permission only. A dry-run push to
`najm-x/MawraidUI` returned HTTP 403, so the branch/PR cannot be published through
this account. A Git-format patch is provided with the delivery. The owner can
apply it from this base, run the commands above, push the feature branch, and open
a PR targeting `main`:

```sh
git fetch origin
git switch -c feature/provider-map-location 2ead42364492555b9be71d7c3f8f622555a726d8
git am /path/to/provider-map-location.patch
git push -u origin feature/provider-map-location
```

Do not merge or deploy as part of this handoff. A real provider-session backend
smoke test remains necessary before release. Verify created stock retrieval returns
the confirmed `location.lat` and `location.lng`; do not add an update route until
its contract is confirmed.
