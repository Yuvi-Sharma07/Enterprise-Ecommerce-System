# Enterprise E-Commerce Platform

A production-grade, highly scalable retail supply chain system simulating Amazon, Walmart, or Flipkart. It features multi-role dashboards (Admin, Warehouse Manager, Supplier, Customer), JWT authentication with refresh token rotations, dynamic specifications-based product searching, Stripe sandbox card settlements, AOP audit timelines, and linear regression sales forecasting.

---

## 🛠️ Technology Stack

- **Backend**: Java Spring Boot 3.3 (JDK 21), Spring Security, Spring Data JPA, Hibernate, PostgreSQL, Redis, Stripe, ZXing (Bar/QR Codes), Apache POI (Excel reports), OpenPDF (Invoice reports), AOP aspect interceptors.
- **Frontend**: React.js (Vite), TypeScript, Tailwind CSS v4, React Router v6, Axios, Recharts.
- **Orchestration**: Docker, Docker Compose.

---

## 📁 Project Structure

```
d:\EComm
├── backend/
│   ├── src/main/java/com/enterprise/ecommerce/
│   │   ├── config/          # Spring Security, CORS, caching, AOP configurations
│   │   ├── controller/      # REST API endpoints handlers
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── exception/       # Global exception translators
│   │   ├── model/           # Relational JPA entities
│   │   ├── repository/      # JPA database repositories with specifications
│   │   ├── security/        # JWT utilities, details service, token parsing filter
│   │   └── service/         # Business logic core services
│   ├── pom.xml              # Maven dependencies file
│   └── Dockerfile           # Multi-stage Java compilations Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # Common navigation and shell components
│   │   ├── context/         # Auth and Cart state providers
│   │   ├── pages/           # Auth views and multi-role dashboards
│   │   ├── services/        # Axios API wrapper with refresh token interceptors
│   │   ├── App.tsx          # Router layout and permissions wrapper
│   │   └── main.tsx         # Context binders startup entry point
│   ├── postcss.config.js    # Tailwind v4 processing setup
│   ├── tailwind.config.js   # Tailwind paths configuration
│   ├── package.json         # Node configurations file
│   └── Dockerfile           # Node compile & Nginx static asset hosting Dockerfile
└── docker-compose.yml       # DB, Cache, Backend, and Frontend service orchestra
```

---

## 🚀 Execution Guide

This project can be launched in two ways:

### Mode A: Standalone Local Development (No External Dependencies)
We pre-configured a development fallback profile so that the application runs immediately without requiring a local Postgres database or Redis cache.
1. **Launch Backend**:
   - Navigate to `/backend`
   - Run in your terminal:
     ```powershell
     .\mvnw spring-boot:run
     ```
   - *This spins up the server on port `8080` using an in-memory H2 database (`/h2-console`) and local memory cache.*
2. **Launch Frontend**:
   - Navigate to `/frontend`
   - Install packages and run Vite development server:
     ```bash
     npm install
     npm run dev
     ```
   - *This starts the browser UI on `http://localhost:5173`.*

### Mode B: Dockerized Production (PostgreSQL + Redis + Stripe)
To launch the complete enterprise ecosystem with containerized databases and cache layers:
1. Make sure Docker Desktop is running on your machine.
2. In the workspace root folder (`d:\EComm`), run:
   ```bash
   docker-compose up --build
   ```
3. The frontend is accessible at `http://localhost`, and the backend runs at `http://localhost:8080`.

---

## 🛡️ User Roles & Demo Credentials

When registering new accounts at the signup page, you can choose from these roles:

1. **Admin**: Access monthly sales graph indicators, forecast next quarter revenue, approve product catalog revisions, and inspect security audit logs.
2. **Warehouse Manager**: Track multiple warehouse occupancies, perform target capacity checks, and move stock between locations.
3. **Supplier**: Fulfill warehouse replenishment requests (Purchase Orders) and add carrier tracking codes.
4. **Customer**: Browse products, search and filter catalogs, maintain wishlists, add items to cart, and check out with credit cards.

---

## 🔌 Core REST API Specifications

Swagger OpenAPI UI is available at `http://localhost:8080/swagger-ui.html` for checking and executing API requests.

### Authentication
- `POST /api/auth/register` : Create credentials.
- `POST /api/auth/login` : Authenticate session and get JWT access/refresh tokens.
- `POST /api/auth/refresh-token` : Fetch rotated access tokens using refresh token.
- `GET /api/auth/verify?token=...` : Validate registration email token.

### Products Catalog
- `GET /api/products` : Paginated search catalog with category, brand, and price filters.
- `GET /api/products/frequently-viewed` : Retrieve trending products fetched from Redis sorted sets.
- `POST /api/products` : Create new product SKU (requires Admin/Manager).

### Shopping Carts & Orders
- `POST /api/cart/{customerId}/add` : Add item to cart.
- `POST /api/cart/{customerId}/toggle-save` : Flag item to "Save for later."
- `POST /api/orders/checkout` : Finalize cart items, apply discount coupon, and create PENDING order.
- `POST /api/orders/{id}/pay` : Settle pending invoice using Stripe Card token.

### Warehouse & Supplier Procurement
- `POST /api/warehouses/transfer` : Relocate stock between warehouses.
- `POST /api/suppliers/pos` : Open new warehouse replenishment order.
- `PUT /api/suppliers/pos/{id}/ship` : Dispatch PO restock shipment.
