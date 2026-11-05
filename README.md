# PAYLESS CAR RENTAL — Production Platform

A premium, full-stack, multilingual car rental SaaS platform built for **PAYLESS CAR RENTAL** with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, next-intl, MongoDB/Mongoose, and NextAuth v5.

---

## 🌟 Key Features

### 1. Public-Facing Portal
- **Multilingual Support**: Fully localized in French (`/fr`), English (`/en`), and Arabic (`/ar`) with complete **RTL** layout support.
- **Automotive Editorial UI/UX**: Dark mode OLED palette (`#0A0A0B`), Payless Blue (`#1D4ED8`), and Gold accents (`#D4AF37`) with glassmorphism effects and Framer Motion micro-interactions.
- **Hero & Fleet Showcase**: Interactive search box, featured high-end fleet, promotional banners, 3-step rental guide, customer reviews, and FAQ.
- **Vehicle Catalogue**: Advanced filtering by category, transmission (automatic/manual), fuel type (gasoline/diesel/electric/hybrid), seats, and price sliders.
- **Vehicle Details (`/[locale]/vehicles/[id]`)**: Full image gallery, technical specifications grid, included services, rental policies, pricing tiers, and a sticky booking widget.
- **6-Step Booking Wizard (`/[locale]/booking`)**:
  1. Pickup & Return location selection (Casablanca CMN, Marrakech RAK, Rabat RBA, Tanger TNG, Agadir AGA).
  2. Date & time selection with automatic duration calculation.
  3. Real-time available vehicle selection.
  4. Optional extras (GPS, Child Seat, Additional Driver, Full Insurance, 5G Wi-Fi).
  5. Customer information & driver's licence.
  6. Server-validated coupon code application, pricing breakdown, and instant reservation confirmation with unique booking reference (`PAY-XXXXXX-XXXX`).
- **Promotions Hub (`/[locale]/promotions`)**: Active deals with coupon copy-to-clipboard and 1-click booking apply.
- **Contact & Branches (`/[locale]/contact`)**: Interactive inquiry form, airport branch locations, phone directory, 24/7 roadside assistance, and direct WhatsApp CTA.
- **About Page (`/[locale]/about`)**: Brand story, statistics, and core values.

---

### 2. Back-Office Administration Dashboard (`/admin`)
- **Protected Access**: Role-based authentication via NextAuth v5 (roles: `superadmin`, `admin`, `manager`, `agent`).
- **Dashboard Overview (`/admin`)**: Real-time KPI summary cards (total revenue, active rentals, pending approvals, fleet utilization), Recharts graphical analytics, upcoming pickups & returns, and recent bookings.
- **Fleet Management (`/admin/fleet`)**: Complete CRUD operations for vehicles, maintenance status switches, pricing configuration, and live search.
- **Booking Management (`/admin/bookings`)**: Reservation table with status filters (pending, confirmed, awaiting_payment, paid, active, completed, cancelled), internal audit trail, and status transition actions.
- **Calendar Timeline (`/admin/calendar`)**: Interactive Gantt-style timeline by vehicle showing bookings, pickup/return dates, and blocked maintenance periods.
- **Customer CRM (`/admin/customers`)**: Customer directory, booking history, contact details, VIP/blacklisting toggles, and internal notes.
- **Promotions Engine (`/admin/promotions`)**: Coupon code generator (percentage / fixed discount), expiration dates, minimum rental duration, and usage limits.
- **Financial Analytics (`/admin/finance`)**: Gross revenue, deposits, monthly revenue breakdown, payments log, and CSV exports.
- **Email Center (`/admin/emails`)**: Transactional email dispatch log, retry mechanism for failed emails, and trilingual email template previews.
- **Notification Center (`/admin/notifications`)**: Alert feed for upcoming pickups, overdue returns, maintenance alerts, and new bookings with read/unread statuses.
- **Agency Settings (`/admin/settings`)**: Agency profile, operating hours, deposit rules, currency defaults, and security configurations.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling & Motion** | Tailwind CSS v4, Framer Motion, Lucide React, Sonner |
| **Internationalization** | `next-intl` (FR, EN, AR with automatic RTL) |
| **Database & ODM** | MongoDB Atlas, Mongoose 9 |
| **Authentication** | NextAuth.js v5 (Auth.js) with bcryptjs encryption |
| **Forms & Validation** | React Hook Form, Zod |
| **Data Visualization** | Recharts |
| **Email Delivery** | Resend API with trilingual HTML templates |
| **Media Hosting** | Cloudinary CDN integration |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.18+ or 20+
- MongoDB instance (MongoDB Atlas connection string or local MongoDB)

### 1. Installation
```bash
cd payless-car-rental
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your MongoDB connection string and credentials:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/payless-car-rental?retryWrites=true&w=majority
NEXTAUTH_SECRET=your-32-character-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3000

# Optional external services
RESEND_API_KEY=re_your_api_key
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### 3. Database Seeding
To populate the database with realistic Moroccan airport locations, vehicle categories, 11 luxury & economy vehicles (Porsche 911, G63 AMG, Range Rover Sport, BMW M5, etc.), active coupons (`PAYLESS2026`, `WELCOME10`, `VIP500`), sample customers, and demo bookings:

Start the application:
```bash
npm run dev
```
Then visit:
```
http://localhost:3000/api/seed
```
Or execute via curl:
```bash
curl http://localhost:3000/api/seed
```

### 4. Admin Credentials
After seeding, log into the admin dashboard at `http://localhost:3000/admin/login`:
- **Email**: `admin@paylesscarrental.com`
- **Password**: `Admin@12345!`

---

## 🛠️ Build & Scripts

```bash
# Start development server
npm run dev

# Run production build (zero TypeScript & build errors)
npm run build

# Start production server
npm run start

# Run type checker
npx tsc --noEmit
```

---

## 🔒 Security & Business Rules
- **Atomic Availability Checks**: Vehicle availability is always verified server-side (`/api/bookings`) to strictly prevent overlapping or double bookings.
- **Server-Side Pricing**: Client-side prices are never trusted; the booking engine re-computes all pricing tiers, optional extras, and coupon discounts on the server.
- **Minor Currency Units**: All financial calculations are stored as integer minor units (centimes/fils) to eliminate floating-point arithmetic errors.
- **Audit Trails**: Every booking maintains an append-only audit trail logging status transitions, timestamps, and the administrator responsible.
- **Role-Based Access Control**: Middleware and route handlers guard all `/admin` routes and administrative APIs.
