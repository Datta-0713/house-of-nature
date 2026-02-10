# LOCKED_PROJECT_BIBLE.md – The SINGLE Source of Truth (FROZEN STATE)

> [!WARNING]
> COMPLIANCE MANDATORY
> This file is the IMMUTABLE, UNCHANGING TRUTH of the House of Nature project.
> NO future updates may alter the logic, flow, or core behavior defined here unless explicitly instructed.
> Any deviation from this document is a failure.

---

## 1. Project Overview
**House of Nature** is an e-commerce platform for sustainable bamboo products.
- **Core Concept**: "Nature to Form" – raw bamboo transforms into finished products (chairs, lamps).
- **Architecture**: Single Page Application (SPA) feel using Vanilla HTML/JS/CSS with a Python (`server.py`) backend.
- **Visuals**: High-end, scroll-driven 3D animation (image sequence on canvas) serves as the hero experience, seamlessly transitioning into product showcases.

---

## 2. Core Pages & Structure

### Homepage (`index.html`)
1.  **Hero Canvas (`#hero-canvas`)**:
    -   **Behavior**: Fixed position (`z-index: 1`), full viewport. Renders image sequence based on scroll position.
    -   **Images**: `HON-1` (Bamboo), `HON-2` (Chairs), `HON-3` (Lamps). Approx 192 frames each.
    -   **Transitions**: Fade-in text overlays at specific scroll points (`15vh`).
    -   **End State**: Animation completes; last frame remains visible until covered by `Best Sellers`. **Buffer Removed**: No whitespace gap allowed.
2.  **Best Sellers (`#best-sellers`)**:
    -   **Behavior**: `z-index: 10`, white background. Scrolls *over* the fixed canvas like a curtain.
    -   **Content**: dynamic grid of products (`isBestSeller: true`).
3.  **Bamboo Lamps (`.feature-section`)**:
    -   **Behavior**: Full-width split section (Text Left, Image Right on Desktop; Stacked on Mobile).
4.  **Bamboo Gifts (`#bamboo-gifts`)**:
    -   **Behavior**: Carousel/Slider implementation for products (`isBambooGift: true`).
5.  **Promo/Blog (`#promo-blog-section`)**:
    -   **Behavior**: Two large banner links (Bags, Lamps) leading to category pages.
6.  **Rest of Page**: Footer with Mission Statement and Social Links.
7.  **Product Full Page Modal (`#product-full-page`)**:
    -   **Behavior**: Hidden by default (`opacity: 0`). Overlays *entire* screen when product clicked. Shows gallery + details.
    -   **Close**: Updates URL hash or state to standard.

### Product Pages (Category)
-   **Files**: `furniture.html`, `lighting.html`, `bags.html`, etc.
-   **Behavior**: Reuse `script_v2.js` to load filtered products based on filename or data attribute.

### Admin Panel (`admin/index.html`)
-   **Access**: Restricted via `localStorage.getItem('adminToken')`.
-   **Features**: Dashboard with tabs (Sales, Customers, Inventory, Logs).

---

## 3. Authentication Logic (FINAL & LOCKED)

### User Types
1.  **Guest**:
    -   **Cart Storage**: `localStorage` (key: `cart`).
    -   **Restrictions**: Cannot checkout (mock), cannot view profile.
2.  **Logged-in User**:
    -   **Identity**: `localStorage` (key: `userToken`).
    -   **Cart Storage**: Server-side (`users.json`).
    -   **Sync Rules**:
        -   **Login**: Fetch server cart -> Overwrite local.
        -   **Add/Remove Item**: Update local -> Send POST to `/api/user/cart/save`.
        -   **Logout**: Destroy local token & cart.
    -   **Orders**: Stored in `users.json` under user object AND `orders.json`.

### Flows
-   **Signup**: POST `/api/auth/signup`. Creates user in `users.json`. Returns token.
-   **Login**: POST `/api/auth/login`. Returns token + user info.
-   **Admin Login**: Hardcoded credentials (`gloomhon@gmail.com` / `natureofhouse`). Returns `admin-token`.

---

## 4. Admin Panel Logic (FINAL & LOCKED)

### Capabilities
-   **CRUD**: Create/Edit products (Images via Base64 upload).
-   **Data View**: Read-only tables for Sales, Customers, Logs.
-   **Security**: Minimal. Checks `Authorization: Bearer admin-token`.

### Constraints
-   **Data Source**: Directly reads/writes JSON files (`products.json`, etc.).
-   **Image Upload**: Saves to `uploads/` dir.

---

## 5. Data Ownership & Persistence

-   **Backend (`server.py`)**:
    -   **Product Data**: `products.json`. The *only* source of truth for items.
    -   **User Data**: `users.json`. Stores profiles + carts + order history.
    -   **Order Data**: `orders.json`. Global order registry.
    -   **Logs**: `system_logs.json`. Tracks admin actions.
-   **Frontend (`script_v2.js`)**:
    -   **Session**: `localStorage`.
    -   **State**: Ephemeral (in-memory `allProducts` array).

---

## 6. UI & Interaction Contracts

### Navigation
-   **Hamburger Menu (Left)**: Opens side panel. Links to categories.
-   **Search (Center/Overlay)**: Full-width overlay input.
-   **Cart (Right)**: Navigate to `cart.html`. Badge shows item count.
-   **Profile (Right)**: Navigate to `profile.html` (or `login.html` if guest).

### Key Actions
-   **"Add to Carton"**:
    -   Updates local state immediately (optimistic UI).
    -   Shows "Success" Toast.
    -   Syncs background if logged in.
-   **"Buy Now"**:
    -   Shows Toast (Mock functionality). No payment gateway.

### Visuals
-   **Scroll Animation**: Must be smooth. Canvas clearing logic REMOVED to prevent whitespace.
-   **Mobile**:
    -   Grid -> 2 column.
    -   Text -> Centered.
    -   Feature Section -> Stacked (Text Top, Image Bottom or vice versa).

---

## 7. Non-Negotiables (STRICT)

1.  **NO Payment Integration**: Do NOT add Stripe/Razorpay/PayPal.
2.  **NO Auth Refactor**: The User/Guest separation logic stays as is.
3.  **NO Design Overhaul**: The current "Clean, Outfit/Playfair" aesthetic is locked.
4.  **NO Frameworks**: Pure HTML/CSS/JS only. No React/Vue/Next.js.

---

> [!IMPORTANT]
> This file overrides any previous instructions or assumptions.
> If a task conflicts with this Bible, THIS FILE WINS.
