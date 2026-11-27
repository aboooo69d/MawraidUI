# Mawarid public stock reads — technical handoff for Najm

## Current behavior

Anonymous requests through the production Vercel proxy return HTTP 401 with application code 1106 for both `GET /api/v1/stocks?in_stock=true` and `GET /api/v1/stocks/{stock_id}`. The same authorization response occurs for `stock_type=gaz`, `stock_type=gas`, and the stock-type catalog. The public backend source puts the list and detail handlers behind a session and the consumer/admin role check. The catalog requires provider/admin access. The routes and published Swagger document expose no public discovery endpoint. A request to `GET /api/v1/public/stocks` returns 404.

The frontend can render guest list and detail responses through the existing proxy. A guest can open a listing and select an order unit, then sign in and return to that exact listing and unit. The frontend currently shows the production authorization response as an Arabic sign-in prompt. The production contract still determines whether a guest can see stock.

## Endpoint changes required

| Endpoint | Anonymous behavior | Signed-in behavior |
| --- | --- | --- |
| `GET /api/v1/stocks` | Return HTTP 200 with eligible public listings and public-only pagination totals. | Preserve current consumer and admin behavior. |
| `GET /api/v1/stocks/{stock_id}` | Return the public representation for an eligible listing. Return HTTP 404 for private, unpublished, or unknown IDs. | Preserve current consumer and admin behavior. |

Use optional session handling specifically on these two GET routes and enforce public visibility and a public response projection for anonymous requests. Apply publication and supplier eligibility before search, distance filters, and pagination. Use the same visibility rules for the list and direct detail lookup. Keep the existing same-origin proxy and route paths so the frontend can use the public responses as soon as these routes support them.

Keep the current authorization on `/api/v1/stocks/types`, `/api/v1/stocks/me`, stock writes and transactions, account/address APIs, order creation and tracking, and supplier order actions. Keep shared caches from serving signed-in responses to guests.

## Expected public response

Use the existing envelope with `success: true` and `data`. The list returns an array and `meta` with `page`, `per_page`, `total`, and `total_pages`. The detail endpoint returns a single object. An empty eligible list returns `data: []`.

| Public field | Purpose |
| --- | --- |
| `id` | Stable stock UUID used for details and the signed-in order handoff |
| `type.id`, `type.slug`, `type.name` | Classification and public label. The canonical Gas slug in the server source is `gaz`. |
| `supplier.display_name` | Explicitly published supplier business or distribution-point name |
| `address`, `location.lat`, `location.lng` | Approved public distribution location. Coordinates can be null when unavailable. |
| `available` | Publicly displayed quantity in the main unit. The frontend uses a positive quantity as the availability indicator. |
| `units[].id`, `name`, `rate`, `price`, `is_main` | Public units, conversion, and selling price in YER. IDs must match the order API after sign-in. |
| `balances[].unit_id`, `unit`, `amount` | Optional public unit-level quantities |
| `stock_details.gaz_stock_type` | Optional public gas service detail, with `exchange` or `refill` |
| `updated_at` | Last update time displayed on the listing |

Exclude internal owner/user IDs, private supplier contact or location data, consumer information, order counters, and inventory or transaction history from the anonymous response. The current authenticated stock DTO includes `user_id` and aggregate order counts, so use an explicit public DTO.

Keep the discovery query parameters `name`, `stock_type`, `stock_type_id`, `in_stock`, paired `lat`/`lng`, `max_distance` in meters, `page`, and `page_size`. Restrict public search to public supplier names and public addresses. Preserve ordering across pages. The Gas UI currently classifies returned records using their type and derives its count from all matched pages. A server filter for the Gas resource, should one be added later, would let the UI request only the relevant listings.

## Acceptance checks

- A cookie-free request returns real published Gas stock and a direct detail request returns the same public fields.
- Private or unpublished entries are excluded from list totals, name and location searches, and direct detail responses.
- Inspect the anonymous response body for private fields and verify that authenticated responses cannot be served from a shared cache to an anonymous request.
- A guest can view details, then sign in to order the selected unit. Verify that unauthenticated order creation and personal, management, and tracking requests remain restricted.
- Repeat list and detail reads with a signed-in citizen and validate the existing supplier order and receipt flow in staging.

Backend references at `de7758a`: [stock routes](https://github.com/najm-x/Mawraid/blob/de7758a/modules/stock/router/stock_router.go), [type filter](https://github.com/najm-x/Mawraid/blob/de7758a/modules/stock/filter/stock_filter.go), [stock DTO](https://github.com/najm-x/Mawraid/blob/de7758a/modules/stock/dto/dto.go).
