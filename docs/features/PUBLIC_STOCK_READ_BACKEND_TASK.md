# Backend task — Public stock browsing

The guest Gas screen and distribution directory are available in the UI. The stock API returns HTTP 401 (application code 1106) for an anonymous request to `GET /api/v1/stocks?stock_type=gaz`. Until public stock reads are available, guests see a live-stock error and the existing directory examples. The directory examples do not indicate current availability.

## Scope

- Define properly scoped public, read-only endpoints for eligible supplier listings and stock details. Return only explicitly approved public fields and apply the same visibility rules to list and detail reads.
- Preserve authentication and authorization on existing private stock APIs, account data, orders, and writes. The public endpoints need server-side field selection and visibility checks.
- Align the frontend with the approved public API contract once it is available. Keep order creation behind consumer authentication.

## Acceptance

A guest can list eligible published suppliers and view their public stock details. Private and unpublished records and private fields are inaccessible through the public endpoints. Anonymous order creation and other writes remain unauthorized.
