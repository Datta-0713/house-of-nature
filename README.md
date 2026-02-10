# House of Nature (HON)

A premium e-commerce website for sustainable bamboo products.

## Features
-   **Scroll-Driven Storytelling:** Immersive hero animation.
-   **Product Catalog:** Dynamically loaded from JSON.
-   **Shopping Cart:** Persistent cart logic (Local + Server sync).
-   **Admin Panel:** Protected dashboard for order management.

## Tech Stack
-   **Frontend:** HTML5, CSS3, Vanilla JavaScript.
-   **Backend:** Python `http.server` (Custom API).
-   **Data:** JSON-based local storage (No SQL DB required).

## Local Setup
1.  Clone the repository.
2.  Run `python server.py`.
3.  Open `http://localhost:8080`.

## Deployment Note
This project uses a custom Python backend logic (`server.py`) for API handling (Signup, Cart, Orders).
-   **Static Hosting (Netlify/GitHub Pages):** Will ONLY serve the frontend. The backend APIs will NOT work, meaning users cannot login or place orders.
-   **Full Hosting:** Deploy to a VPS or Python-compatible platform (Render, Heroku, Railway) to run `server.py`.
