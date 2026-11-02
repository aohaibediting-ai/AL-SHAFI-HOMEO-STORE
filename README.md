# 🌿 AL SHAFI HOMEO STORE
### Complete Homeopathy E-Commerce Website with Administrative Management Panel

A full-stack, production-grade homeopathy e-commerce platform built specifically for dispensing homeopathic remedies, mother tinctures, dilutions, biochemic tissue salts, and health syrups with complete persistent database storage, inventory control, and secure administrative operations.

---

## 🌟 Highlights & Key Features

### 🛒 Customer-Facing Storefront
- **Visual Identity:** Clean botanical white & soft green medical aesthetic with responsive layout (Mobile, Tablet, Desktop).
- **Home Page:** Dynamic promotional hero banner, departmental category cards, featured remedies, new arrivals, best sellers, and trust assurance badges.
- **Shop & Catalog:** Full filtering by category, price range, manufacturer/brand, and stock availability with multiple sort orders (Newest, Price Low-to-High, Price High-to-Low, Alphabetical).
- **Remedy Detail Page:** Multi-image gallery with click-to-zoom modal, stock level indicator, unit pricing with sale discount badges, quantity selector, **Add to Basket**, and direct **Buy Now** one-click checkout.
- **Verified Clinical Details:** Tabs for Ingredients & Potency Composition, Usage & Dosage Directions, Storage Information, Contraindications & Precautionary Warnings, and Delivery Instructions.
- **Shopping Cart System:** Persistent cart across refreshes, quantity increment/decrement, item removal, live free-delivery progress bar, coupon code validation, and server-side calculated totals.
- **Checkout & Address Collection:** Complete customer details collection (full name, WhatsApp phone number, city, town, street, house number, landmark, courier delivery remarks), choice of **Home Delivery** or **Dispensary Pickup**, and multiple payment choices.
- **Order Confirmation & Tracking:** Generates unique order reference numbers (`ASH-YYYYMMDD-XXXX`), order summary breakdown, and live real-time package tracker with visual progress milestones.
- **Flexible Payment Methods:**
  1. **Cash on Delivery (COD):** Secure doorstep payment across Pakistan.
  2. **Direct Bank Transfer / EasyPaisa / JazzCash:** Displays bank account details & allows customers to upload payment screenshot receipts directly for administrative review.
  3. **In-Store Pickup:** For local patients collecting directly from the pharmacy branch.
  4. **Online Card Gateway:** Structured backend adapter for credit/debit card processing.
- **Customer Accounts:** Secure sign up, JWT login, profile editing, password changes, order history, and saved address book management.

### 🛡️ Administrative Management Dashboard (`/admin`)
- **Protected Access:** Role-based access control with hashed passwords and secure JWT bearer authentication.
- **Dashboard Telemetry:** Real-time revenue analytics (Total, Today, Month), total orders, pending action alerts, inventory counts, recent customer orders, and low-stock warnings.
- **Product Management:** Add, edit, duplicate, and delete remedies. Upload multiple product photos, set SKUs, barcodes, categories, regular & sale pricing, stock counts, and visibility (Published, Draft, Unavailable).
- **Category Management:** Create, organize, reorder, and remove categories with safeguards preventing deletion of categories containing active products.
- **Order Processing:** Comprehensive order review, fulfillment state changes (*Pending, Confirmed, Processing, Ready for Pickup, Shipped, Delivered, Cancelled*), payment status management (*Unpaid, Awaiting Verification, Paid, Refunded*), courier tracking assignment (*TCS, Leopards, Call Courier*), internal admin notes, invoice printing, and CSV export.
- **Bank Receipt Verification:** Inspect uploaded customer payment receipts with one-click **Approve & Mark Paid** or **Reject** actions.
- **Inventory Control:** Manual stock addition/deduction with recorded audit notes, low-stock reorder thresholds, and comprehensive stock movement logs.
- **Promotional Coupons:** Create percentage or fixed-amount discount codes with minimum order criteria and maximum usage caps.
- **Store & Branding Settings:** Non-technical store owners can edit store name, slogan, phone, email, address, delivery fees, free shipping threshold, bank account details, and promotional homepage banners directly through the web UI without modifying code.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 18, Vite 5, TailwindCSS 3 | Single-page application, Lucide icons, Hot-Toast notifications |
| **Backend** | Node.js, Express.js | Structured RESTful API, Helmet, CORS, Rate Limiting, Cookie Parser |
| **Database** | SQLite via `sql.js` | Zero external native dependencies, automatic atomic disk persistence |
| **Security** | bcryptjs, jsonwebtoken (JWT) | Salted password hashing (cost factor 10), Bearer token verification |
| **File Storage** | Multer | Server-side image uploads for products, categories, receipts, and banners |

---

## 📁 Project Directory Structure

```text
al-shafi-homeo-store/
├── package.json                   # Root orchestrator scripts
├── .env.example                   # Environment template
│
├── server/                        # Express API & SQLite Database
│   ├── package.json
│   ├── .env                       # Server configuration & JWT secrets
│   ├── data/
│   │   └── store.db               # Persistent SQLite database file
│   ├── uploads/                   # Stored images
│   │   ├── products/
│   │   ├── categories/
│   │   ├── banners/
│   │   └── receipts/
│   ├── src/
│   │   ├── db.js                  # Database connection, schemas, indexes & seed defaults
│   │   ├── index.js               # Express application entrypoint
│   │   ├── seed.js                # Database initialization script
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verification & requireAdmin guard
│   │   │   └── upload.js          # Multer disk storage and file validation
│   │   └── routes/
│   │       ├── auth.js            # Customer & admin authentication
│   │       ├── products.js        # Public catalog, filters & search
│   │       ├── categories.js      # Public departments & categories
│   │       ├── cart.js            # Server-side basket validation
│   │       ├── orders.js          # Order placement, tracking & cancellation
│   │       ├── payments.js        # Receipt uploads & verification
│   │       ├── addresses.js       # Saved customer addresses
│   │       ├── settings.js        # Public store settings & coupon check
│   │       └── admin/
│   │           ├── dashboard.js   # Analytics & KPI statistics
│   │           ├── products.js    # Product CRUD & image management
│   │           ├── categories.js  # Category management
│   │           ├── orders.js      # Order fulfillment, tracking & CSV export
│   │           ├── inventory.js   # Manual stock adjustments & logs
│   │           ├── settings.js    # Store settings & homepage banners
│   │           └── coupons.js     # Promotional discount codes
│   └── test-suite.js              # Automated integration verification suite
│
└── client/                        # React + Vite Frontend
    ├── package.json
    ├── vite.config.js             # Vite config with API proxy
    ├── tailwind.config.js         # Theme colors & fonts
    ├── index.html                 # HTML shell
    ├── dist/                      # Production compiled assets
    └── src/
        ├── main.jsx               # React DOM root
        ├── App.jsx                # Routes & protection guards
        ├── index.css              # Tailwind base & custom styles
        ├── api.js                 # API fetch client with auth token interceptor
        ├── contexts/
        │   ├── AuthContext.jsx    # User session state & login/register/logout
        │   ├── CartContext.jsx    # Shopping basket state & sync
        │   └── SettingsContext.jsx# Live store settings & currency formatter
        ├── components/
        │   ├── Navbar.jsx         # Header navigation, search, cart counter
        │   ├── Footer.jsx         # Footer with links, contacts & disclaimer
        │   ├── ProductCard.jsx    # Card with sale badge, stock alert, quick add
        │   ├── AdminLayout.jsx    # Sidebar navigation & header for admin panel
        │   ├── StatusBadge.jsx    # Color-coded badges for order/payment states
        │   └── Modal.jsx          # Reusable accessible dialog
        └── pages/
            ├── Home.jsx           # Store homepage with banners & collections
            ├── Shop.jsx           # Full catalog with search, filters & sorting
            ├── ProductDetail.jsx  # Remedy details, ingredients, usage & zoom
            ├── Cart.jsx           # Cart page with coupon discounts
            ├── Checkout.jsx       # Order placement with address collection
            ├── OrderConfirmation.jsx # Success screen with receipt upload
            ├── OrderTracking.jsx  # Live milestone tracking page
            ├── Login.jsx          # Customer & admin login
            ├── Register.jsx       # Customer registration
            ├── Account.jsx        # Account dashboard & profile settings
            ├── AccountOrders.jsx  # Customer order history
            ├── AccountOrderDetail.jsx # Customer order view & receipt upload
            ├── AccountAddresses.jsx # Saved address book management
            ├── About.jsx          # About the homeopathic dispensary
            ├── Contact.jsx        # Dispensary location & contact form
            ├── FAQ.jsx            # 10 clinical & ordering FAQs
            ├── Policies.jsx       # Shipping, Returns, Privacy & Terms
            └── admin/
                ├── Dashboard.jsx  # Executive telemetry & low stock warnings
                ├── Products.jsx   # Product list, filters, search & actions
                ├── ProductForm.jsx# Add/Edit product with multi-image upload
                ├── Categories.jsx # Category manager
                ├── Orders.jsx     # Order manager with CSV export
                ├── OrderDetail.jsx# Order fulfillment, receipt approval & print
                ├── Inventory.jsx  # Stock adjuster & movement history
                ├── Settings.jsx   # General, delivery, payment & banner settings
                ├── Coupons.jsx    # Coupon discount manager
                └── Customers.jsx  # Customer directory & lifetime metrics
```

---

## 🚀 Installation & Local Setup (Windows 11)

### Prerequisites
- **Node.js**: Version 18 or higher (Node 20 or 24 recommended).
- **npm**: Installed with Node.

### Step 1: Open Terminal in Project Folder
Open PowerShell in `c:\Users\hp\Downloads\al-shafi-homeo-store`:
```powershell
cd "c:\Users\hp\Downloads\al-shafi-homeo-store"
```

### Step 2: Install Dependencies
Install dependencies for root, backend, and frontend:
```powershell
npm run install:all
```

### Step 3: Configure Environment Variables
If not already created, copy `.env.example` to `server/.env`:
```powershell
Copy-Item .env.example server\.env
```
Default development settings are pre-configured:
- `PORT=5000`
- `ADMIN_EMAIL=admin@alshafihomeo.com`
- `ADMIN_PASSWORD=Admin@123456`
- `ADMIN_NAME=Store Admin`
- `DATABASE_PATH=./data/store.db`

### Step 4: Seed Initial Products & Create Admin Account
Run the database seed script:
```powershell
cd server
node src/seed.js
cd ..
```
*This automatically populates the 6 standard homeopathic departments, 8 verified homeopathic remedies (Arnica, Berberis, Calcarea Phos, Alfalfa Tonic, Calendula, Bio-Combination 20, Nux Vomica, Cineraria Eye Drops), active banners, and the default admin account.*

---

## 🏃 Running the Application

### Option A: Run Both Server & Client in Development (Recommended)
From the root directory:
```powershell
npm run dev
```
- **Storefront URL:** [http://localhost:5173](http://localhost:5173)
- **Admin Dashboard:** [http://localhost:5173/admin](http://localhost:5173/admin)
- **Backend API:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Option B: Run Services Individually
In **Terminal 1** (Backend Server):
```powershell
cd server
npm start
```
In **Terminal 2** (Frontend Client):
```powershell
cd client
npm run dev
```

---

## 🔑 Administrative Access Credentials

To access the administrative panel:
1. Navigate to: [http://localhost:5173/login](http://localhost:5173/login) (or click **Sign In** in the navbar).
2. Enter the credentials:
   - **Email:** `admin@alshafihomeo.com`
   - **Password:** `Admin@123456`
3. Click **Sign In**. You will be directed to the **Admin Dashboard** at `/admin`.
4. *To change the admin password at any time, log in and visit `/account` to update credentials, or edit `server/.env` and re-run `node src/seed.js`.*

---

## 🧪 Automated Verification Test Suite

A built-in automated test suite verifies all critical database operations, order placement, stock reduction, order cancellation, and coupon calculations:
```powershell
cd server
node test-suite.js
```
Expected output:
```text
========================================================
  🧪 AL SHAFI HOMEO STORE - Full Verification Test Suite
========================================================
  ✅ PASS: Admin user exists in database with admin role
  ✅ PASS: Catalog seeded with 8 authentic homeopathic products
  ✅ PASS: Categories table populated with 6 departments
  ✅ PASS: Admin password hash verified with bcrypt
  ✅ PASS: Customer registration inserts record
  ✅ PASS: Arnica Montana starting stock is 45
  ✅ PASS: Order created: #ASH-TEST-XXXX
  ✅ PASS: Stock reduced accurately from 45 to 43
  ✅ PASS: Stock restored accurately to 45 after cancellation
  ✅ PASS: WELCOME10 promotional coupon active
  ✅ PASS: Store name setting confirmed as AL SHAFI HOMEO STORE
========================================================
  Summary: 11 passed, 0 failed
========================================================
```

---

## 💾 Database Backup & Restoration

The SQLite database file is stored persistently at `server/data/store.db`.

### Creating a Manual Backup
To create a timestamped backup of the store database:
```powershell
Copy-Item "server\data\store.db" "server\data\store_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').db"
```

### Restoring from Backup
To restore from a previous backup:
1. Stop the backend server.
2. Replace `server\data\store.db` with your backup copy.
3. Restart the server.

---

## 🌐 Production Deployment Guide

### Deploying on a Virtual Server (Ubuntu/Debian/Windows Server)
1. Build the production React frontend:
   ```powershell
   cd client
   npm run build
   ```
   *This compiles optimized assets to `client/dist`.*
2. Set `NODE_ENV=production` in `server/.env`.
3. In production mode, the Express server automatically serves the compiled React application from `client/dist` and handles single-page app routing.
4. Run the server using PM2 or Windows Service:
   ```bash
   npm install -g pm2
   cd server
   pm2 start src/index.js --name "al-shafi-store"
   ```
5. Set up an Nginx reverse proxy with SSL (Let's Encrypt / Certbot) directing port 443 to `http://localhost:5000`.

---

## 🩺 Medical & Regulatory Notice
Product descriptions, dosages, and precautions on this platform follow established classical Homeopathic Pharmacopoeia monographs. Products must be verified by the dispensary owner, and users are always advised to seek counsel from registered homeopathic practitioners.
