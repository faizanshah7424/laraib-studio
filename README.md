# Laraib Studio — Premium Pakistani Fashion & Karachi E-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://www.prisma.io/)

**Laraib Studio** is a full-stack, mobile-first Pakistani fashion e-commerce storefront and e-business management system built for rapid daily product drops, Karachi-exclusive delivery logistics, customer wishlists, order fulfillment, and internal wholesale business analytics.

---

## 🌟 Key Features

### 🛍️ Customer Storefront & Shopping Experience
* **Curated Catalog & Daily Drops**: Seasonal Pakistani pret, luxury unstitched lawn, and men's kurta collections with automatic "New In" badge flagging.
* **Persistent Shopping Cart**: React Context-driven shopping bag drawer with `localStorage` persistence across page reloads.
* **Customer Account & Wishlist**:
  * Registration, Sign In, and Profile management (Saved Karachi shipping destination, phone, and WhatsApp hotline).
  * Persistent product wishlist with duplicate entry prevention and one-click "Move to Bag" action.
  * Customer Order History with visual stage tracker (`Pending` → `Confirmed` → `Processing` → `Shipped` → `Delivered` / `Cancelled`).
* **Karachi-Only Checkout**:
  * Exclusive Karachi delivery validation with extensible locality selector.
  * Flat Karachi shipping rate (**PKR 200**).
  * Flexible Payment Options: **Cash on Delivery (COD)** and **Bank Account Transfer** (with transaction reference input).
* **Direct WhatsApp Integration**:
  * WhatsApp product inquiry pre-filled with item details.
  * Formatted WhatsApp order message generator.
  * Floating WhatsApp customer care action button.
* **3-Day Return & Exchange Policy**: Dedicated customer-facing policy page for WhatsApp-assisted returns.

### 🛡️ Security & Data Privacy (Non-Negotiable)
* **Zero Wholesale Leakage**: Server-side DTO mapper (`toPublicProduct`) strips `wholesalePrice`, `supplierNotes`, `supplierBrand`, and `internalNotes` from public API responses.
* **Server-Side Price Recalculation**: Order creation API re-fetches prices directly from the database and recalculates order subtotals and grand totals server-side. Client-sent cart prices are ignored.
* **Strict Customer Authorization**: Order detail APIs enforce ownership checks (`customerId` or phone matching). Customers can **only** access their own orders.
* **Isolated Admin Authentication**: Separate JWT authentication sessions for Admin (`admin_token`) and Customers (`customer_token`).
* **No-Index SEO Protection**: Private customer and admin routes (`/account/*`, `/admin/*`) use `robots: { index: false }` metadata.

### 💼 Admin Operations & Business Analytics (`/admin`)
* **Real-Time Overview**: Business metrics cards tracking total orders, pending orders, delivered orders, active products, low-stock variant alerts, and active sales.
* **Period Revenue & Profit Analysis**: Revenue and **Estimated Business Profit** calculations for `Today`, `7 Days`, and `30 Days` (Admin Only).
* **Inventory Control (`/admin/inventory`)**: Stock level table with inline quantity updates and low-stock alerts (≤ 5 units).
* **Category & Brand Management (`/admin/categories`, `/admin/brands`)**: Full CRUD management with parent-child category trees and brand logos.
* **Sales & Promotional Campaigns (`/admin/sales`)**: Scheduled sales campaigns with banner copy, discount percentages, and automated start/end dates.
* **Customer Directory (`/admin/customers`)**: View customer order histories, lifetime spend, and direct WhatsApp contact buttons.
* **Centralized Settings (`/admin/settings`)**: Configurable bank account transfer credentials, official WhatsApp hotline, PKR 200 delivery fee, and store metadata.

---

## 🛠️ Tech Stack

* **Framework**: Next.js 14 (App Router)
* **Language**: TypeScript
* **Styling**: Tailwind CSS, Vanilla CSS design tokens (`brand-dark`, `brand-cream`, `brand-accent`, `brand-whatsapp`), Lucide Icons
* **Database & ORM**: Prisma ORM, SQLite (Development), PostgreSQL-ready relational architecture
* **Authentication**: JWT via `jose`, Password hashing via `bcryptjs`, HTTP-Only Cookies
* **Image Upload**: Multi-photo upload API route (`/api/upload`) saving to static server storage

---

## 📁 Main Modules & Route Structure

```text
laraib-studio/
├── prisma/
│   ├── schema.prisma         # Relational database schema (Product, Variant, Order, CustomerUser, Wishlist, Setting, etc.)
│   └── seed.js               # Database seeder script
├── src/
│   ├── app/                  # Next.js App Router Pages & API Routes
│   │   ├── (public)/         # Storefront Pages (/collections, /products/[slug], /search, /cart, /checkout)
│   │   ├── account/          # Customer Account Portal (/account, /account/login, /account/orders, /account/wishlist)
│   │   ├── admin/            # Admin Control Center (/admin, /admin/orders, /admin/inventory, /admin/products, /admin/sales, /admin/settings)
│   │   └── api/              # Secure API Routes (/api/products, /api/orders, /api/customer/*, /api/admin/*, /api/settings)
│   ├── components/           # UI Components, Layouts, Catalog, Product Views, Cart, Order Trackers
│   ├── context/              # CartContext, CustomerAuthContext, WishlistContext
│   ├── lib/                  # Database client, session handlers, DTO mappers, utility functions
│   └── types/                # TypeScript interface definitions
```

---

## 🚀 Setup & Installation Steps

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm** or **yarn**

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/faizanshah7424/laraib-studio.git
cd laraib-studio
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure `.env` contains:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="laraib-studio-super-secret-jwt-key-2026"
JWT_CUSTOMER_SECRET="laraib-studio-customer-jwt-secret-2026"
ADMIN_EMAIL="admin@laraibstudio.pk"
ADMIN_PASSWORD="AdminPassword123!"
```

### 3. Database Push & Seeding
Run Prisma migration and seed default products, categories, brands, store settings, and admin user:
```bash
npx prisma db push
node prisma/seed.js
```

---

## 💻 Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts local Next.js development server on `http://localhost:3000` |
| `npm run build` | Compiles optimized Next.js production build |
| `npm run start` | Starts Next.js production server |
| `npm run lint` | Runs ESLint static code analysis |

---

## 🔐 Credentials & Default Settings

* **Admin Portal**: `http://localhost:3000/admin/login`
  * **Email**: `admin@laraibstudio.pk`
  * **Password**: `AdminPassword123!`
* **Karachi Delivery Rate**: Fixed flat rate of **PKR 200**.
* **Official WhatsApp Hotline**: Configurable via `/admin/settings`.

---

## 🌐 Production Deployment

Laraib Studio is fully optimized for production deployment on platforms like Vercel, Railway, or VPS servers.

1. **Database**: Point `DATABASE_URL` to a PostgreSQL instance (e.g. Supabase, Neon, or Railway PostgreSQL).
2. **Environment Variables**: Set `JWT_SECRET`, `JWT_CUSTOMER_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in your production deployment dashboard.
3. **Build Command**: `npx prisma db push && npm run build`.

---

© 2026 **Laraib Studio**. All rights reserved.
