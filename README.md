# The Aesthetic Edit

> A Pinterest-inspired lifestyle platform combining visual discovery, affiliate shopping, and SEO-driven editorial content — built as a full-stack TypeScript monorepo.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Neon](https://img.shields.io/badge/Neon-Postgres-00E5A0?logo=postgresql&logoColor=white)](https://neon.tech/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Feature Set](#feature-set)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Authentication & Security](#authentication--security)
- [Admin Panel](#admin-panel)
- [Currency & Geo-Detection](#currency--geo-detection)
- [Image Management](#image-management)
- [SEO Infrastructure](#seo-infrastructure)
- [Smoke Testing](#smoke-testing)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Performance Optimizations](#performance-optimizations)
- [Contributing](#contributing)

---

## Overview

**The Aesthetic Edit** is a full-stack lifestyle commerce platform targeting the intersection of editorial content and affiliate monetization. It is designed for Pinterest-native audiences who discover products through mood boards, aesthetic categories, and editorial blog posts.

The platform is a **monorepo**: a single Express.js server handles both the REST API and serves the Vite-built React SPA — eliminating the infrastructure complexity of separate frontend/backend deployments. In development, Vite runs in middleware mode with full HMR. In production, Express serves the compiled static bundle.

### Core business model

- **Affiliate commerce** — Products link to external retailers via tracked affiliate URLs. Every click is recorded, timestamped, and surfaced in the admin analytics dashboard.
- **Email lead capture** — A free downloadable guide acts as a lead magnet, feeding a confirmed subscriber list via double opt-in email flow.
- **Content marketing** — A full CMS for blog posts and categories drives organic SEO traffic that converts through in-post product recommendations.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│        React 19 SPA  ·  React Router v7  ·  Tailwind v4     │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP / Cookie Auth
┌─────────────────────────▼───────────────────────────────────┐
│                  Express 4 Server  (server.ts)               │
│                                                              │
│  ┌─────────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │  API Routes │  │  Helmet  │  │   CORS   │  │ Morgan  │  │
│  │  /api/*     │  │   CSP    │  │ Allowlist│  │ Logging │  │
│  └──────┬──────┘  └──────────┘  └──────────┘  └─────────┘  │
│         │                                                    │
│  ┌──────▼──────────────────────────────────────────────┐    │
│  │              Route Modules                           │    │
│  │  auth · products · blog · leads · wishlist           │    │
│  │  analytics · contact · currency · geo · upload       │    │
│  │  home_shop                                           │    │
│  └──────┬──────────────────────────────────────────────┘    │
│         │                                                    │
│  ┌──────▼──────┐   ┌──────────────────────────────────┐     │
│  │  Neon DB    │   │  Cloudinary  (image CDN uploads)  │     │
│  │  (Postgres) │   └──────────────────────────────────┘     │
│  └─────────────┘                                            │
│                                                              │
│  Dev:  Vite middleware (HMR)                                 │
│  Prod: express.static(dist/) + SPA fallback                  │
└─────────────────────────────────────────────────────────────┘
```

### Key architectural decisions

| Decision | Rationale |
|---|---|
| **Monorepo / single server** | One deploy target, shared env vars, no CORS complexity in production |
| **Neon serverless Postgres** | Instant spin-up, HTTP + WebSocket drivers, auto-suspend on free tier |
| **JWT in HttpOnly cookies** | CSRF-resistant, no localStorage exposure; separate tokens for user vs admin |
| **Vite in middleware mode** | True HMR without a separate port; zero-config proxy |
| **Code splitting via lazy()** | All 13 page routes lazy-loaded; vendor chunks split by domain (react, motion/lucide) |
| **Zod validation on every route** | Schema-first request validation with typed errors; prevents invalid DB writes |
| **In-process migrations** | `initDb()` runs `ALTER TABLE … ADD COLUMN IF NOT EXISTS` on startup — safe to run repeatedly in production without a migration runner |

---

## Feature Set

### Storefront / Public

| Feature | Detail |
|---|---|
| **Home page** | CMS-driven hero, mood category grid, "Find It Here" editorial grid — all content editable from admin |
| **Shop** | Filterable product catalogue by category, sub-category, and "vibe" tags; multi-image carousel on product detail |
| **Product detail** | Affiliate link tracking, Pinterest Save button, "Complete the Look" related products, Cloudinary-optimized imagery |
| **Wishlist** | Authenticated users can save products and blog posts; persisted to Postgres |
| **Blog hub** | Category-based editorial hub with featured articles and curated collections |
| **Blog post** | Full markdown-rich content, in-post product recommendations, related posts, custom CTA sections |
| **Free Guide** | Lead magnet page with email capture form (double opt-in); configurable guide PDF URL |
| **About** | Fully CMS-editable personal brand page |
| **Currency localisation** | IP-detected currency with live exchange rates (10 currencies supported, 6-hour cache) |
| **Pinterest integration** | First-class Pinterest Save button with click tracking |

### Admin Panel (`/admin`)

| Module | Capability |
|---|---|
| **Analytics** | Total leads, affiliate clicks, Pinterest saves; top-performing products by clicks and saves; recent leads list |
| **Products** | Full CRUD; multi-image upload to Cloudinary; vibe tags; related products linking; trending/top-rated flags; per-product CTA customisation |
| **Blog** | Rich post editor with markdown content, multiple images, recommended product linking, related post linking, custom section headings |
| **Blog Categories** | Manage category slugs, images, descriptions |
| **Shop Categories** | Hierarchical categories with sub-categories and icon support |
| **Home Config** | Edit mood categories, "Find It Here" categories, homepage text blocks |
| **Site Config** | Hero copy, footer text, about page content, free guide PDF URL, favicon — all database-driven |
| **Leads** | Export and manage email subscriber list with confirmation status |

---

## Technology Stack

### Frontend

| Package | Version | Purpose |
|---|---|---|
| `react` | 19 | UI library |
| `react-dom` | 19 | DOM rendering |
| `react-router-dom` | 7 | Client-side routing (SPA) |
| `motion` | 12 | Animation library (Framer Motion v12) |
| `lucide-react` | 0.546 | Icon system |
| `tailwindcss` | 4.1 | Utility-first CSS (via Vite plugin) |
| `clsx` + `tailwind-merge` | latest | Conditional class merging |

### Backend

| Package | Version | Purpose |
|---|---|---|
| `express` | 4.21 | HTTP server and routing |
| `@neondatabase/serverless` | 0.10 | Neon Postgres client (HTTP + WebSocket) |
| `bcrypt` | 6 | Password hashing (cost factor 12) |
| `jsonwebtoken` | 9 | JWT issuance and verification |
| `zod` | 4 | Runtime request schema validation |
| `helmet` | 8 | Security headers + CSP |
| `cors` | 2.8 | Origin allowlist |
| `express-rate-limit` | 8.3 | Per-route rate limiting |
| `multer` | 2.1 | Multipart file handling |
| `cloudinary` | 2.9 | Image CDN upload and storage |
| `nodemailer` | 8 | SMTP email delivery |
| `morgan` | 1.10 | HTTP request logging (dev only) |
| `cookie-parser` | 1.4 | Cookie parsing middleware |
| `uuid` | 13 | RFC 4122 UUID generation |
| `ws` | 8 | WebSocket driver for Neon |

### Build & Tooling

| Package | Purpose |
|---|---|
| `vite` 6 | Frontend bundler + dev server |
| `@vitejs/plugin-react` | JSX transform + Fast Refresh |
| `@tailwindcss/vite` | Tailwind v4 Vite integration |
| `tsx` | TypeScript execution for server (no compile step in dev) |
| `typescript` 5.8 | Type checking |
| `cross-env` | Cross-platform env variable setting |

---

## Project Structure

```
the-aesthetic-edit/
├── server.ts                  # Express entry point — bootstraps all middleware and routes
├── index.html                 # Vite HTML shell
├── vite.config.ts             # Vite config: code splitting, aliases, HMR control
├── tsconfig.json              # Shared TS config (ES2022, bundler moduleResolution)
├── package.json
├── .env.example               # All required environment variables documented
├── metadata.json              # App metadata (name, description)
│
├── scripts/
│   ├── smoke-full.mjs         # End-to-end smoke test: auth, products, blog, wishlist, upload
│   └── smoke-admin.mjs        # Admin-only smoke test: CRUD for all admin entities
│
└── src/
    ├── main.tsx               # React entry point
    ├── App.tsx                # Root component: providers, router, lazy routes, prefetching
    ├── index.css              # Global styles and Tailwind directives
    ├── types.ts               # Shared TypeScript interfaces (Product, BlogPost, User, etc.)
    ├── vite-env.d.ts
    │
    ├── pages/                 # Route-level components (all lazy-loaded)
    │   ├── Home.tsx
    │   ├── Shop.tsx
    │   ├── ProductDetail.tsx
    │   ├── BlogHub.tsx
    │   ├── BlogCategory.tsx
    │   ├── BlogPost.tsx
    │   ├── Wishlist.tsx
    │   ├── FreeGuide.tsx
    │   ├── About.tsx
    │   ├── Admin.tsx
    │   ├── Login.tsx
    │   ├── Signup.tsx
    │   └── NotFound.tsx
    │
    ├── components/
    │   ├── Layout.tsx          # Navbar + Footer (CMS-driven navigation)
    │   ├── ErrorBoundary.tsx   # React error boundary
    │   ├── SEOMeta.tsx         # Dynamic <head> meta tags per route
    │   ├── ImageCarousel.tsx   # Multi-image carousel with thumbnails
    │   ├── ImageUpload.tsx     # Single image upload (Cloudinary)
    │   ├── MultiImageUpload.tsx# Multi-image upload widget
    │   ├── ProductCard.tsx     # Reusable product tile
    │   ├── WishlistButton.tsx  # Heart toggle (auth-aware)
    │   ├── PinterestSaveButton.tsx
    │   ├── Skeleton.tsx        # Loading skeleton components
    │   ├── Toast.tsx           # Toast notification UI
    │   └── admin/
    │       ├── AdminLayout.tsx
    │       ├── AdminContext.tsx
    │       ├── AdminAnalytics.tsx
    │       ├── AdminBlogs.tsx
    │       ├── AdminBlogCategories.tsx
    │       ├── AdminProducts.tsx
    │       ├── AdminShopCategories.tsx
    │       ├── AdminHomeConfig.tsx
    │       ├── AdminSiteConfig.tsx
    │       ├── AdminLeads.tsx
    │       └── hooks/
    │           └── useAdmin.ts # Admin data fetching and mutations
    │
    ├── context/
    │   ├── AuthContext.tsx     # User auth state, login/logout actions
    │   ├── WishlistContext.tsx # Wishlist state with optimistic updates
    │   └── ToastContext.tsx    # Global toast notification queue
    │
    ├── hooks/
    │   ├── useFetch.ts         # Generic fetch hook with loading/error states
    │   ├── useProducts.ts      # Products data hook
    │   └── useBlog.ts          # Blog data hook
    │
    ├── lib/
    │   ├── currency.ts         # IP geolocation → currency detection → live rate conversion
    │   ├── constants.ts        # App-wide constants
    │   ├── safeUrl.ts          # URL sanitisation utility
    │   └── utils.ts            # General utility functions
    │
    └── server/
        ├── db.ts               # Neon client + initDb() (schema + idempotent migrations)
        ├── seed.ts             # Sample data seeder for development
        ├── middleware/
        │   ├── auth.ts         # requireAuth / optionalAuth middleware
        │   └── admin.ts        # checkAdmin middleware + adminLimit rate limiter
        ├── routes/
        │   ├── auth.ts         # /api/auth — signup, login, logout, admin auth, /me
        │   ├── products.ts     # /api/products — CRUD, affiliate click tracking
        │   ├── blog.ts         # /api/blog — posts, categories, CRUD
        │   ├── leads.ts        # /api/leads — capture, double opt-in confirm, admin list
        │   ├── wishlist.ts     # /api/wishlist — products + blog posts wishlist
        │   ├── analytics.ts    # /api/analytics — summary, top products
        │   ├── contact.ts      # /api/contact — contact form submission
        │   ├── currency.ts     # /api/currency/rates — cached exchange rates
        │   ├── geo.ts          # /api/geo/detect — IP-based country/currency detection
        │   ├── home_shop.ts    # /api/home-shop — shop categories, mood/find-here config
        │   └── upload.ts       # /api/upload — Cloudinary image upload
        └── utils/
            └── formatters.ts   # DB row → TypeScript type transformers
```

---

## Database Schema

All tables are created idempotently on server startup via `initDb()`. Column additions use `ALTER TABLE … ADD COLUMN IF NOT EXISTS` for zero-downtime migrations.

### Tables

#### `users`
| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUID v4 |
| `email` | TEXT UNIQUE | |
| `password` | TEXT | bcrypt, cost 12 |
| `name` | TEXT | |
| `provider` | TEXT | `'local'` \| `'google'` (Google OAuth stub) |
| `is_admin` | BOOLEAN | Default false |
| `created_at` | TIMESTAMPTZ | |

#### `products`
| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUID v4 |
| `title`, `description` | TEXT | |
| `price` | NUMERIC | Stored in INR; converted client-side |
| `image` | TEXT | Primary Cloudinary URL |
| `images` | JSONB | Array of additional image URLs |
| `category`, `sub_category` | TEXT | Hierarchical categorisation |
| `vibes` | JSONB | Array of vibe/mood tags |
| `affiliate_url` | TEXT | External retailer link |
| `retailer` | TEXT | Retailer name |
| `is_active` | BOOLEAN | Controls public visibility |
| `is_trending`, `is_top_rated` | BOOLEAN | Editorial flags |
| `related_products` | JSONB | Array of product IDs |
| `section_heading/subheading/description/cta_text` | TEXT | Per-product CTA block customisation |
| `created_at` | TIMESTAMPTZ | |

#### `blog_posts`
| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUID v4 |
| `slug` | TEXT UNIQUE | URL-safe identifier |
| `category_slug` | TEXT | FK-like reference to blog_categories |
| `title`, `excerpt`, `content` | TEXT | Markdown content |
| `image` | TEXT | Hero image URL |
| `images` | JSONB | Gallery images |
| `author`, `author_image` | TEXT | Byline |
| `date`, `read_time` | TEXT | Editorial metadata |
| `recommended_products` | JSONB | Array of product IDs |
| `related_posts` | JSONB | Array of post IDs |
| `is_published` | BOOLEAN | Draft/publish toggle |
| `section_*`, `related_posts_*` | TEXT | Customisable CTA sections (×2) |

#### `blog_categories`
| Column | Type |
|---|---|
| `id` | TEXT PK |
| `title`, `description` | TEXT |
| `slug` | TEXT UNIQUE |
| `image` | TEXT |

#### `shop_categories`
| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | |
| `title`, `slug` | TEXT | |
| `icon` | TEXT | Emoji or icon name |
| `sub_categories` | JSONB | Array of sub-category strings |

#### `home_mood_categories`
Drives the "Shop by Mood" grid on the homepage. Links to a shop category.

#### `home_find_here_categories`
Drives the "Find It Here" editorial grid on the homepage. Links to a blog category slug.

#### `wishlist_items`
Junction table: `user_id` → `product_id` with unique constraint. Cascade deletes.

#### `wishlist_journals`
Junction table: `user_id` → `post_id` (blog posts). Cascade deletes.

#### `affiliate_clicks`
| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | |
| `product_id` | TEXT | FK → products |
| `user_id` | TEXT | FK → users (nullable) |
| `affiliate_url` | TEXT | Captured at click time |
| `user_agent`, `referrer` | TEXT | Attribution metadata |
| `clicked_at` | TIMESTAMPTZ | |

#### `pinterest_saves`
Mirrors `affiliate_clicks` but for Pinterest save events.

#### `leads`
| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | |
| `name`, `email` | TEXT | |
| `source` | TEXT | e.g. `'free-guide'` |
| `confirmation_token` | TEXT | UUID v4, used for double opt-in link |
| `is_confirmed` | BOOLEAN | Set to true on `/confirm/:token` |

#### `contact_messages`
Stores name, email, message from the contact form.

#### `site_config`
Key-value store for all CMS-editable site copy. Keys include `home_hero_title`, `footer_about`, `about_hero_title`, `free_guide_file_url`, and more. Seeded with defaults on first boot.

### Indexes

```sql
idx_wishlist_user              ON wishlist_items(user_id)
idx_wishlist_product           ON wishlist_items(product_id)
idx_wishlist_journals_user     ON wishlist_journals(user_id)
idx_wishlist_journals_post     ON wishlist_journals(post_id)
idx_shop_categories_slug       ON shop_categories(slug)
idx_home_mood_categories_slug  ON home_mood_categories(slug)
idx_affiliate_clicks_product   ON affiliate_clicks(product_id)
idx_blog_posts_category        ON blog_posts(category_slug)
idx_blog_posts_slug            ON blog_posts(slug)
idx_products_category          ON products(category)
idx_products_active            ON products(is_active)
```

---

## API Reference

All API responses follow a consistent envelope:

```json
{
  "success": true | false,
  "data": { ... } | null,
  "error": "string (on failure)",
  "meta": { "total": 0, "page": 1, "limit": 20, "totalPages": 1 }
}
```

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/signup` | — | Register user. Rate limited (10/15 min). Validates via Zod. Sets `ae_token` cookie. |
| POST | `/login` | — | Authenticate user. Rate limited. Sets `ae_token` cookie (7d, HttpOnly). |
| POST | `/logout` | — | Clears `ae_token` cookie. |
| GET | `/me` | User cookie | Returns current user profile. |
| POST | `/admin/login` | — | Authenticate admin via `ADMIN_PASSWORD`. Sets `ae_admin_token` cookie (8h, HttpOnly, SameSite=Strict). |
| POST | `/admin/logout` | — | Clears `ae_admin_token` cookie. |
| GET | `/admin/me` | Admin cookie | Verifies admin session. |

### Products — `/api/products`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | — | List all active products. Supports `?category`, `?subCategory`, `?vibe` filters. Paginated. |
| GET | `/:id` | — | Single product detail. |
| POST | `/affiliate-click/:id` | Optional | Record affiliate click. Rate limited (20/min). Captures UA + referrer. |
| POST | `/pinterest-save/:id` | Optional | Record Pinterest save event. |
| GET | `/admin/all` | Admin | All products including inactive. |
| POST | `/admin/create` | Admin | Create product. Full Zod validation. |
| PUT | `/admin/:id` | Admin | Full product update. |
| PATCH | `/admin/:id` | Admin | Partial update (affiliateUrl, isActive, isTrending, isTopRated, relatedProducts). |
| DELETE | `/admin/:id` | Admin | Soft delete / hard delete product. |

### Blog — `/api/blog`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/posts` | — | All published posts. Supports `?category`. |
| GET | `/posts/:slug` | — | Single post by slug. |
| GET | `/categories` | — | All blog categories. |
| GET | `/categories/:slug` | — | Category with its posts. |
| POST | `/admin/posts` | Admin | Create post. |
| PUT | `/admin/posts/:id` | Admin | Update post. |
| DELETE | `/admin/posts/:id` | Admin | Delete post. |
| GET | `/admin/categories` | Admin | All categories (admin view). |
| POST | `/admin/categories` | Admin | Create category. |
| PUT | `/admin/categories/:id` | Admin | Update category. |
| DELETE | `/admin/categories/:id` | Admin | Delete category. |

### Leads — `/api/leads`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | — | Capture lead (name + email). Rate limited (5/hour). Double opt-in token generated. |
| GET | `/confirm/:token` | — | Confirm subscription via email link. |
| GET | `/guide-download` | — | Redirect to configured guide PDF URL. |
| GET | `/admin/all` | Admin | All leads with confirmation status. |
| DELETE | `/admin/:id` | Admin | Delete lead. |

### Wishlist — `/api/wishlist`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | User | User's saved products. |
| POST | `/:productId` | User | Add product to wishlist. |
| DELETE | `/:productId` | User | Remove product. |
| GET | `/journals` | User | User's saved blog posts. |
| POST | `/journals/:postId` | User | Save blog post. |
| DELETE | `/journals/:postId` | User | Unsave blog post. |

### Analytics — `/api/analytics`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/summary` | Admin | Aggregated stats: total leads, clicks, saves; top products by clicks and Pinterest saves; recent leads. |

### Supporting Routes

| Route | Description |
|---|---|
| `GET /api/currency/rates` | Live exchange rates (USD base, 6h in-memory cache). Source: open.er-api.com |
| `GET /api/geo/detect` | IP geolocation (primary: ipapi.co, fallback: ip-api.com). Returns country, city, currency. |
| `POST /api/upload` | Admin-only. Multipart image upload → Cloudinary. 5MB limit. JPEG/PNG/WebP/GIF only. Rate limited (50/15 min). |
| `POST /api/contact` | Public contact form. Stored to DB + (optionally) emailed via Nodemailer. |
| `GET /api/home-shop/config` | Public: shop categories, mood grid, find-here grid, site config. |
| Various `/api/home-shop/admin/*` | Admin CRUD for shop categories, mood categories, find-here categories, site config. |

### SEO Endpoints

| Endpoint | Description |
|---|---|
| `GET /robots.txt` | Dynamically generated. Disallows `/admin` and `/api/`. References sitemap. |
| `GET /sitemap.xml` | Dynamically generated XML sitemap including all active products and published blog posts. |

---

## Authentication & Security

### User Authentication

- JWT signed with `JWT_SECRET` (minimum 32 characters, validated at startup).
- Issued as `ae_token` HttpOnly cookie; `Secure` in production; `SameSite=lax`.
- 7-day expiry. No refresh token — re-login required on expiry.
- Passwords hashed with bcrypt, cost factor 12.

### Admin Authentication

- Separate cookie (`ae_admin_token`); `SameSite=strict`; 8-hour expiry.
- Password stored as plain env var (`ADMIN_PASSWORD`); comparison is constant-time via trim equality (not bcrypt — single admin use case).
- All admin routes protected by `checkAdmin` middleware which verifies JWT `role === 'admin'`.

### Security Headers (Helmet v8)

In production, a strict CSP is applied:

```
default-src 'self'
script-src  'self' 'unsafe-inline'
style-src   'self' 'unsafe-inline' https://fonts.googleapis.com
img-src     'self' data: blob: https://res.cloudinary.com https://*.amazonaws.com ...
connect-src 'self' https://ipapi.co https://open.er-api.com
font-src    'self' https://fonts.gstatic.com
object-src  'none'
upgrade-insecure-requests (production only)
```

### CORS

Origin allowlist is read from `APP_URL` (comma-separated). Origins are normalised (trailing slashes stripped, URL parsed) before comparison. Credentials (`cookies`) are allowed from listed origins only.

### Rate Limiting

| Route group | Window | Max requests |
|---|---|---|
| Login / Signup | 15 min | 10 |
| Lead capture | 60 min | 5 |
| Affiliate click | 1 min | 20 |
| Image upload | 15 min | 50 |
| Geo detection | 15 min | 100 |
| Currency rates | 1 min | 30 |
| All admin routes | 15 min | 1,000 |

`express-rate-limit` uses standard headers (`RateLimit-*`). The server sets `trust proxy: 1` for correct client IP resolution behind Render/Nginx/Cloudflare.

---

## Admin Panel

The admin panel is a full single-page application within the SPA, mounted at `/admin`. It is completely separated from the public-facing UI — the `Navbar` and `Footer` are hidden when on admin routes.

### Admin login flow

```
POST /api/auth/admin/login { password }
  → Sets ae_admin_token cookie (HttpOnly, SameSite=strict, 8h)
  → All subsequent admin API calls carry this cookie automatically
```

### Admin modules

**AdminAnalytics** — Dashboard cards showing total leads, affiliate clicks, and Pinterest saves. Sortable table of all products with their individual click and save counts. "Top by Clicks" and "Top by Pinterest Saves" ranked lists.

**AdminProducts** — Full product management: create, edit, delete. Multi-image uploader (Cloudinary). Vibe tag management. Related product picker. Per-product CTA block with custom heading, subheading, description, and CTA button text.

**AdminBlogs** — Blog post editor with full field set including markdown `content`, hero image, gallery images, recommended products (picker), related posts (picker), and two customisable CTA sections.

**AdminBlogCategories** — CRUD for blog category slugs, images, descriptions.

**AdminShopCategories** — Hierarchical shop category management with sub-category arrays.

**AdminHomeConfig** — Edit the homepage mood category grid and "Find It Here" editorial grid entries. Links mood categories to shop categories and editorial categories to blog category slugs.

**AdminSiteConfig** — Key-value editor for all site copy: hero text, about page content, footer text, free guide PDF URL, favicon URL, and more. Changes take effect immediately (no build required).

**AdminLeads** — Read-only table of all email leads with confirmation status, source, and timestamp.

---

## Currency & Geo-Detection

The platform supports 10 currencies with automatic detection:

| Currency | Locale |
|---|---|
| USD | en-US |
| EUR | de-DE |
| GBP | en-GB |
| INR | en-IN |
| JPY | ja-JP |
| CAD | en-CA |
| AUD | en-AU |
| SGD | en-SG |
| AED | ar-AE |
| MYR | ms-MY |

**Detection flow:**

1. Frontend calls `GET /api/geo/detect`
2. Server resolves client IP (handles `X-Forwarded-For`, `CF-Connecting-IP`, `X-Real-IP` headers; skips private ranges)
3. Primary lookup: `ipapi.co` → returns `country_code` + `currency`
4. Fallback: `ip-api.com` (no currency on free tier)
5. Currency code is mapped to a `SupportedCurrency` type
6. Frontend calls `GET /api/currency/rates` (USD-base, 6h server-side in-memory cache)
7. Product prices (stored in INR) are converted client-side using `Intl.NumberFormat`
8. Fallback rates are hardcoded for offline/error resilience

---

## Image Management

All images are managed via **Cloudinary**. The admin panel provides both single and multi-image upload components.

### Upload pipeline

```
Admin → multipart/form-data → POST /api/upload
  → multer (in-memory storage, 5MB limit, MIME whitelist)
  → cloudinary.uploader.upload_stream({ folder: 'aesthetic-edit' })
  → returns { url: secure_url, public_id }
```

### Configuration

Cloudinary is configured via either `CLOUDINARY_URL` (single env var) or the three-part `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` pattern. The `getCloudinary()` factory function checks both patterns with graceful error messaging.

### Supported MIME types

`image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/gif`

Maximum file size: **5 MB** per image.

---

## SEO Infrastructure

The platform has first-class SEO support baked into the server and the React layer.

### Dynamic sitemap

`GET /sitemap.xml` queries Postgres at request time and generates a valid XML sitemap with:
- Static routes (`/`, `/shop`, `/blog`, `/about`, `/free-guide`) at weekly change frequency
- All active product pages at monthly frequency
- All published blog post pages at monthly frequency

### robots.txt

`GET /robots.txt` is server-generated and includes:
- `Disallow: /admin`
- `Disallow: /api/`
- `Sitemap:` pointing to the dynamic sitemap

### Per-route `<head>` meta

The `SEOMeta` component sets dynamic `<title>`, `<meta name="description">`, Open Graph, and Twitter Card tags per page — enabling social sharing previews for products and blog posts.

---

## Smoke Testing

Two ESM smoke-test scripts verify the full application is working correctly against a live server. They are designed to run in CI or as a pre-deploy sanity check.

### `scripts/smoke-full.mjs`

Full end-to-end test suite covering:
- Health check (HTTP 200 on `/`)
- User signup, login, `GET /api/auth/me`, logout
- Admin login, `GET /api/auth/admin/me`
- Product creation (admin), public product list, product detail
- Affiliate click recording
- Blog category and post creation (admin), public blog listing
- Lead capture
- Wishlist add/remove (products + journals)
- Currency rates and geo detection
- Image upload (1×1 PNG fixture)
- Site config read/write

### `scripts/smoke-admin.mjs`

Admin-scoped tests for CMS entities:
- Shop category and sub-category management
- Home mood category and find-here category CRUD
- Site config key-value updates
- Blog categories and posts

### Running smoke tests

```bash
# Start the server in a separate terminal
npm run start

# Run full smoke test
SMOKE_BASE_URL=http://localhost:3000 \
ADMIN_PASSWORD=your_admin_password \
node scripts/smoke-full.mjs

# Run admin smoke test
SMOKE_BASE_URL=http://localhost:3000 \
ADMIN_PASSWORD=your_admin_password \
node scripts/smoke-admin.mjs
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.0
- **npm** ≥ 9.0
- A **Neon** account (free tier works) — [neon.tech](https://neon.tech)
- A **Cloudinary** account (free tier works) — [cloudinary.com](https://cloudinary.com)
- (Optional) SMTP credentials for email delivery (lead confirmation, contact form)

### 1. Clone and install

```bash
git clone https://github.com/your-org/the-aesthetic-edit.git
cd the-aesthetic-edit
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials (see [Environment Variables](#environment-variables)).

### 3. Start development server

```bash
npm run dev
```

The server starts on `http://localhost:3000`. Vite runs in middleware mode — full HMR is active, no separate frontend process required.

The database schema is created automatically on first boot via `initDb()`.

### 4. Seed sample data (optional)

```bash
npm run seed
```

Populates the database with sample products, blog categories, blog posts, and site configuration.

### 5. Access the admin panel

Navigate to `http://localhost:3000/admin` and enter the `ADMIN_PASSWORD` from your `.env`.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | **Yes** | Neon Postgres connection string. Format: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | **Yes** | Minimum 32 characters. Used for both user and admin JWT signing. |
| `ADMIN_PASSWORD` | **Yes** | Admin panel login password. Change before deploying. |
| `APP_URL` | **Yes** | Comma-separated list of allowed CORS origins. Include all frontend URLs. e.g. `https://theaestheticedit.com,http://localhost:3000` |
| `CLOUDINARY_CLOUD_NAME` | For uploads | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | For uploads | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | For uploads | Cloudinary API secret |
| `CLOUDINARY_URL` | For uploads | Alternative: single `cloudinary://` URL (overrides the above three) |
| `SMTP_HOST` | For email | e.g. `smtp.gmail.com` |
| `SMTP_PORT` | For email | Default: `587` |
| `SMTP_USER` | For email | SMTP username |
| `SMTP_PASS` | For email | SMTP password |
| `FROM_EMAIL` | For email | Sender address. Default: `hello@theaestheticedit.com` |
| `NODE_ENV` | No | `development` (default) or `production` |
| `PORT` | No | HTTP port. Default: `3000` |

**Startup validation:** The server will refuse to start if `DATABASE_URL`, `JWT_SECRET`, or `ADMIN_PASSWORD` are missing, or if `JWT_SECRET` is shorter than 32 characters.

---

## Scripts

| Script | Command | Description |
|---|---|---|
| Development | `npm run dev` | Start Express + Vite middleware (HMR) |
| Production start | `npm run start` | `NODE_ENV=production tsx server.ts` |
| Build frontend | `npm run build` | Vite production build → `dist/` |
| Preview build | `npm run preview` | Serve the production build locally |
| Seed database | `npm run seed` | Populate DB with sample data |
| Type check | `npm run type-check` | `tsc --noEmit` (no emit, check only) |
| Lint | `npm run lint` | Alias for type-check |
| Clean build | `npm run clean` | `rm -rf dist` |

---

## Deployment

The application is designed for deployment on **Render** (or any Node.js-capable platform). A single service hosts both the API and the static frontend.

### Render deployment

1. Create a new **Web Service** on Render
2. Set **Build command**: `npm install && npm run build`
3. Set **Start command**: `npm run start`
4. Add all environment variables from `.env.example`
5. Set `NODE_ENV=production`

The server sets `app.set('trust proxy', 1)` — required for Render's proxy to correctly pass client IPs to rate limiters and geo detection.

### Production behaviour

- Vite dev middleware is **not** loaded in production
- Express serves `dist/` as static files
- All unmatched non-API routes return `dist/index.html` (SPA fallback)
- `morgan` HTTP logging is disabled in production
- Helmet CSP is fully activated
- Cookies are set with `Secure: true`

### Database

No migration runner is required. On each server start, `initDb()` runs all `CREATE TABLE IF NOT EXISTS` and `ALTER TABLE … ADD COLUMN IF NOT EXISTS` statements idempotently. This means re-deploying never risks data loss.

---

## Performance Optimizations

### Code splitting

The Vite build configuration splits the bundle into domain-specific vendor chunks:

```js
manualChunks(id) {
  if (id.includes('react') || id.includes('react-router-dom')) return 'vendor-react';
  if (id.includes('motion') || id.includes('lucide-react'))    return 'vendor-ui';
  if (id.includes('node_modules'))                             return 'vendor';
}
```

All 13 page routes are individually lazy-loaded via `React.lazy()`.

### Idle-time prefetching

High-traffic routes (Shop, Blog, FreeGuide, ProductDetail, BlogPost) are prefetched via `requestIdleCallback` (with `setTimeout` fallback) on initial page load — invisible to the user, but eliminates route-change loading delays.

### Favicon from CMS

The favicon is dynamically injected from the `favicon_url` site config key on app boot, avoiding a hard-coded HTML dependency.

### Currency cache

Exchange rates are cached in-process for 6 hours on both server (per-process) and client (per-session). Fallback rates are hardcoded to handle complete API outages gracefully.

### Skeleton loading

All data-fetching pages render placeholder skeleton components while data loads, preventing layout shift and improving perceived performance.

---

## Contributing

### Development workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes, ensuring TypeScript type-checks pass: `npm run type-check`
4. Test against a real Neon database with `npm run dev`
5. Run smoke tests if modifying server routes: `node scripts/smoke-full.mjs`
6. Open a pull request with a clear description

### Code conventions

- **TypeScript strict mode** — All new code must be fully typed. Avoid `any` where possible.
- **Zod schemas** — All new API routes that accept a request body must validate with a Zod schema.
- **Response envelope** — All API responses must follow `{ success, data, error?, meta? }`.
- **Rate limiting** — All new public endpoints must have a rate limiter applied.
- **Migration pattern** — New database columns must use `ALTER TABLE … ADD COLUMN IF NOT EXISTS` inside a `try/catch` block in `initDb()`.
- **Error messages in production** — Do not leak internal error messages to clients in production. Follow the existing `process.env.NODE_ENV` pattern.

---

## License

Private. All rights reserved. © 2026 The Aesthetic Edit.

