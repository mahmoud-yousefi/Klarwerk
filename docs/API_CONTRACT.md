# API contract

The frontend is written against this contract but runs without a backend by default. When
`VITE_API_BASE_URL` is set, the services in `frontend/src/services` call these endpoints.

## Conventions

- Base URL: `VITE_API_BASE_URL` (example `http://localhost:4000/api`), no trailing slash.
- JSON request/response unless noted. UTF-8. Prices are integers in EUR (no cents) as in the
  demo catalog.
- Errors use:

```json
{ "error": { "code": "OUT_OF_STOCK", "message": "Human-readable message" } }
```

- Suggested status codes: `400` validation, `404` not found, `409` conflict/stock, `422`
  semantic validation, `429` rate limit, `500` unexpected.
- All endpoints are read-only demos except checkout/assistant. No authentication in the demo.
- The frontend `apiFetch` throws `ApiError { status, code }` for non-2xx responses.

## Catalog

### `GET /products`

Query parameters (all optional):

| Param | Type | Notes |
| --- | --- | --- |
| `search` | string | matches name, brand, tagline, description, category |
| `category` | string | category ID |
| `brand` | string (repeatable) | brand name |
| `availability` | string (repeatable) | `in_stock`, `low_stock`, `preorder`, `out_of_stock` |
| `minPrice`, `maxPrice` | number | EUR, inclusive |
| `sort` | string | `relevance`, `price-asc`, `price-desc`, `rating`, `newest` |
| `page` | number | 1-based, default 1 |
| `perPage` | number | default 12 |

Response `200`:

```json
{
  "items": [
    {
      "id": "KW-1000",
      "sku": "KWVAN-ONE12-BLK",
      "slug": "vantis-one-12",
      "name": "Vantis One 12",
      "brand": "Vantis",
      "category": "smartphones",
      "tagline": { "de": "Präzision in der Tasche.", "en": "Precision in your pocket." },
      "description": { "de": "…", "en": "…" },
      "price": 899,
      "originalPrice": 1021,
      "currency": "EUR",
      "availability": "preorder",
      "stock": 0,
      "images": ["/assets/images/products/phone-green.webp"],
      "specs": [{ "key": "display", "value": "6,7\" OLED · 120 Hz", "label": { "de": "Display", "en": "Display" } }],
      "highlights": [{ "de": "…", "en": "…" }],
      "rating": 4.1,
      "reviewCount": 159,
      "featured": true,
      "isNew": true,
      "tags": ["oled", "camera"],
      "color": "Midnight",
      "releaseYear": 2026,
      "warrantyYears": 2
    }
  ],
  "total": 122,
  "page": 1,
  "pages": 11,
  "perPage": 12
}
```

### `GET /products/:slug`

Returns one `Product` object (`200`) or `404 PRODUCT_NOT_FOUND`.

### `GET /categories`, `GET /brands`, `GET /articles`, `GET /articles/:slug`

Return the same shapes as the bundled JSON in `frontend/src/data`. The current frontend reads
these locally, but the endpoints keep the option open for CMS-backed content.

### `GET /config`

Returns store settings equivalent to `frontend/src/data/site.json` (free-shipping threshold,
standard/express price, VAT rate, return window, company contact). Never return secrets.

## Checkout (demo)

### `POST /checkout/orders`

Request:

```json
{
  "items": [{ "productId": "KW-1000", "quantity": 1 }],
  "customer": {
    "email": "alex@example.com",
    "firstName": "Alex",
    "lastName": "Demo",
    "company": "",
    "street": "Musterstraße",
    "houseNumber": "12",
    "postalCode": "20457",
    "city": "Hamburg",
    "country": "DE",
    "phone": "",
    "note": ""
  },
  "shippingMethod": "standard",
  "paymentMethod": "invoice"
}
```

Server rules:

1. Look up every product; reject unknown IDs (`PRODUCT_NOT_FOUND`) and out-of-stock items
   (`OUT_OF_STOCK`, `409`). Reject empty carts (`EMPTY_CART`).
2. Recalculate line prices, subtotal, shipping (free standard from the configured threshold) and
   VAT from the server-side catalog/config. **Never trust client totals.**
3. Do not collect card numbers, CVV, IBAN or PayPal credentials in this demo.
4. Persist or return a demo order with status `demo_confirmed`. No email is sent and no fulfilment
   is triggered; the UI states this explicitly.

Response `201`:

```json
{
  "id": "KW-MWIPXORU",
  "createdAt": "2026-11-16T10:00:00.000Z",
  "items": [
    {
      "productId": "KW-1000",
      "name": "Vantis One 12",
      "price": 899,
      "quantity": 1,
      "image": "/assets/images/products/phone-green.webp"
    }
  ],
  "customer": { "…": "same shape as request" },
  "shippingMethod": "standard",
  "shippingLabel": "Standardversand",
  "paymentMethod": "invoice",
  "paymentLabel": "Kauf auf Rechnung",
  "subtotal": 899,
  "shipping": 0,
  "total": 899,
  "vatIncluded": 143.54,
  "status": "demo_confirmed"
}
```

### `GET /orders/:id` (optional)

For a backend-backed confirmation page; the local demo reads orders from `localStorage` instead.

## Assistant (SSE)

### `POST /assistant/chat`

Request:

```json
{
  "message": "Ich suche einen Laptop für mein Studium.",
  "locale": "de",
  "mode": "recommend",
  "history": [
    { "role": "user", "content": "…" },
    { "role": "assistant", "content": "…" }
  ],
  "seedProductIds": ["KW-1022", "KW-1017"]
}
```

- `locale`: `de` | `en`.
- `mode`: `discover` | `recommend` | `compare` | `advice` | `explain` | `store` | `null`.
- `history`: last 8 turns, text only.
- `seedProductIds`: optional product IDs from the previous assistant turn, used for follow-ups like
  "compare the first two".

Response: `200` with `Content-Type: text/event-stream`. Frames are separated by a blank line and
use `data:` lines. The client tolerates malformed frames and unknown types.

```
data: {"type":"delta","text":"Ich habe "}

data: {"type":"delta","text":"zwei Laptops gefunden …"}

data: {"type":"products","productIds":["KW-1022","KW-1017"]}

data: {"type":"comparison","compareIds":["KW-1022","KW-1017"]}

data: {"type":"done"}

data: [DONE]
```

Supported frame types:

| `type` | Payload | Client effect |
| --- | --- | --- |
| `delta` | `text` | appended to the assistant message |
| `products` | `productIds` | renders recommendation cards |
| `comparison` | `compareIds` | renders the comparison table |
| `done` | — | marks the turn complete |
| `[DONE]` | raw sentinel | ignored (stream ends) |

Operational requirements:

- Server must ground answers in the catalog. Never invent products, prices or specs; the mock
  engine follows this rule and the UI labels the mode as catalog-based.
- Stream `delta` frames incrementally; the client aborts by closing the connection
  (`AbortController`), so stop work when the request is cancelled.
- Rate limit per IP/session and cap message length (600 characters in the UI).
- Provider API keys stay server-side in environment variables. The frontend bundle must never
  contain an AI key.
- If the provider fails mid-stream, end the stream; the client offers retry.

## Environment

`frontend/.env.example`:

```
VITE_API_BASE_URL=
```

Empty = bundled demo data and mock assistant. Set it to the API origin to switch the catalog and
assistant to remote mode. Checkout is currently always local; connect `createDemoOrder()` to
`POST /checkout/orders` when the backend exists.

## Versioning

Additive changes are safe. Breaking changes to `Product`, `CatalogResult`, `DemoOrder` or the SSE
frame types require updating the TypeScript types in `frontend/src/types` and this document
together.
