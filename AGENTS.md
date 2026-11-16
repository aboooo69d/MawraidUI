# AGENTS.md — Architecture & Feature Development Guide

This document describes the project structure, architectural conventions, and step-by-step workflow for AI agents building features in **nova-auth-react** (Mawarid Platform).

---

## 1. Tech Stack

- **Framework:** React 18 (`react`, `react-dom`)
- **Build Tool:** Vite 8 (`vite.config.js` proxies `/api` → `http://localhost:8080` in dev)
- **Language:** JavaScript (ES Modules, JSX)
- **UI & Locale:** Arabic RTL interface (`dir="rtl"`), Tailwind CSS utility classes, custom SVG icons

---

## 2. Project Structure

```text
nova-auth-react/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                         # React root entry point
    ├── config/
    │   └── env.js                       # Environment config (VITE_API_BASE_URL || '/api/v1')
    ├── app/
    │   ├── App.jsx                      # Shell, screen routing, Toast state
    │   └── providers/
    │       └── AuthProvider.jsx         # AuthContext (user, login, logout)
    ├── services/
    │   └── api/
    │       ├── client.js                # request() wrapper, ApiError, Turnstile & FormData handling
    │       ├── errorMessages.js         # ERROR_MESSAGES map & getErrorMessage(err)
    │       ├── index.js                 # Barrel export for API layer
    │       └── modules/
    │           └── auth.api.js          # Auth endpoints
    ├── features/
    │   ├── auth/
    │   │   ├── components/
    │   │   │   └── TurnstileWidget.jsx
    │   │   ├── hooks/
    │   │   │   └── useAuth.js
    │   │   └── pages/
    │   │       ├── LoginPage.jsx
    │   │       ├── RegisterPage.jsx     # RegisterConsumer, RegisterProvider
    │   │       ├── OtpPage.jsx
    │   │       └── PasswordPage.jsx     # Forgot, Reset
    │   ├── home/
    │   │   └── pages/
    │   │       └── HomePage.jsx
    │   └── dashboard/
    │       └── pages/
    │           └── DashboardPage.jsx
    └── shared/
        ├── components/
        │   ├── icons/
        │   │   └── index.jsx            # Standard SVG Icons object
        │   └── ui/
        │       ├── index.js             # Barrel export for UI primitives & Icons
        │       ├── Banners.jsx          # ErrorBanner, InfoBanner
        │       ├── BrandLogo.jsx        # BrandLogo, Logo
        │       ├── Buttons.jsx          # BackBtn, PrimaryBtn, SecondaryBtn
        │       ├── Inputs.jsx           # Label, PhoneInput, TextInput
        │       ├── ResourceBadge.jsx    # ResourceBadge
        │       └── Toast.jsx            # Toast
        └── constants/
            ├── regex.js                 # PHONE_RE
            └── routes.js                # ROUTES enum/object
```

---

## 3. Architectural Rules

1. **API Layer (`src/services/api/`)**
   - Never call `fetch()` directly inside components or pages.
   - Always use `request()` from `src/services/api/client.js`.
   - `request()` automatically sets `credentials: 'include'`, prepends `ENV.API_BASE_URL`, handles JSON and `FormData`, attaches `cf-turnstile-response` when `turnstileToken` is provided, and throws `ApiError` (`status`, `code`, `message`) on failure.
   - Do not hardcode error strings in components for API error codes; add error codes to `ERROR_MESSAGES` in `src/services/api/errorMessages.js` and render `<ErrorBanner err={err} />`.

2. **Feature Isolation (`src/features/<feature>/`)**
   - Keep domain-specific pages, components, and hooks inside their feature directory.
   - Features may import from `src/shared/*` and `src/services/api`, but avoid cross-importing internal components between unrelated features unless promoted to `src/shared/`.

3. **Shared UI & Constants (`src/shared/`)**
   - Reuse components from `src/shared/components/ui` (`PrimaryBtn`, `SecondaryBtn`, `BackBtn`, `TextInput`, `PhoneInput`, `Label`, `ErrorBanner`, `InfoBanner`, `BrandLogo`, `Logo`, `ResourceBadge`, `Toast`).
   - Add new SVG icons to `src/shared/components/icons/index.jsx` rather than embedding raw `<svg>` blocks in pages.
   - Add route keys to `ROUTES` in `src/shared/constants/routes.js` and shared regexes/validators to `src/shared/constants/regex.js`.

4. **Environment Config (`src/config/env.js`)**
   - Read all `import.meta.env.*` variables in `src/config/env.js` and export via `ENV`.

---

## 4. How to Build a New Feature (Step-by-Step)

Example: adding an **`orders`** feature.

### Step 1: Add API Endpoints
Create `src/services/api/modules/orders.api.js`:
```js
import { request } from '../client'

export const ordersApi = {
  list: () => request('/orders'),
  create: (payload) => request('/orders', { method: 'POST', body: payload }),
  getById: (id) => request(`/orders/${id}`),
}
```
Export it from `src/services/api/index.js`:
```js
export { ordersApi } from './modules/orders.api'
```
If the backend introduces new error codes, add them to `ERROR_MESSAGES` in `src/services/api/errorMessages.js`.

### Step 2: Create the Feature Folder
Create `src/features/orders/` with only the folders you need:
- `src/features/orders/pages/OrdersPage.jsx`
- `src/features/orders/components/OrderCard.jsx` (if needed)
- `src/features/orders/hooks/useOrders.js` (if needed)

Inside pages/components, import shared UI and API modules:
```js
import { ordersApi } from '../../../services/api'
import { Icons, PrimaryBtn, ErrorBanner } from '../../../shared/components/ui'
```

### Step 3: Register the Route
1. Add the route key in `src/shared/constants/routes.js`:
   ```js
   ORDERS: 'orders',
   ```
2. Import the page in `src/app/App.jsx` and add it to the `screens` map in `Shell`:
   ```js
   [ROUTES.ORDERS]: <OrdersPage go={go} />,
   ```
   *(If the route requires authentication and should be accessible when `user` is logged in, update the redirect guard in `src/app/App.jsx` accordingly.)*

### Step 4: Verify
Run the production build to confirm all imports and JSX compile cleanly:
```bash
npm run build
```
