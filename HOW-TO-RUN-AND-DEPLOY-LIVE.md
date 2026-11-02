# 🌿 AL SHAFI HOMEO STORE — Complete Run & Live Deployment Guide

> **Store Name:** AL SHAFI HOMEO STORE  
> **Chief Physician:** Dr. Musab Maqsood (DHMS 4-Year Degree in Homeopathy, 5+ Years Clinical & Healthcare Marketing Experience)  
> **Dispensary & Clinic Location:** Raja Bazar, Rawalpindi, Pakistan  
> **Contact / WhatsApp:** `+92 348 5349232`  

---

## 📋 Table of Contents
1. [Why Did Localhost Say "Connection Refused"?](#1-why-did-localhost-say-connection-refused)
2. [How to Run Locally on Your PC (1-Click)](#2-how-to-run-locally-on-your-pc-1-click)
3. [Admin Login & Store Access](#3-admin-login--store-access)
4. [Verified Product Photos & Doctor Section](#4-verified-product-photos--doctor-section)
5. [How to Deploy Live to the Internet (Free & Easy)](#5-how-to-deploy-live-to-the-internet-free--easy)
   - [Method 1: Render.com (Recommended Free Hosting)](#method-1-rendercom-recommended-free-hosting)
   - [Method 2: Railway.app (Ultra-Fast 1-Click)](#method-2-railwayapp-ultra-fast-1-click)
   - [Method 3: VPS (Ubuntu, PM2, Nginx, Free SSL)](#method-3-vps-ubuntu-pm2-nginx-free-ssl)
6. [How to Connect Your Custom Domain (.com / .pk)](#6-how-to-connect-your-custom-domain-com--pk)

---

## 1. Why Did Localhost Say "Connection Refused"?

When you interact with an AI coding session, any background process started inside the temporary terminal session shuts down whenever the chat is refreshed or reset. That is why your browser showed `ERR_CONNECTION_REFUSED`.

**The Solution:** Run the server in its own native Windows terminal on your computer so it stays open 24/7 without being affected by the browser or AI restarts!

---

## 2. How to Run Locally on Your PC (1-Click)

Inside your project folder: `c:\Users\hp\Downloads\al-shafi-homeo-store`

### Option A: Double-Click the Launcher (Easiest)
1. Open File Explorer to:
   `c:\Users\hp\Downloads\al-shafi-homeo-store`
2. Double-click the file named:
   **`start-website.bat`**
3. A black command window will open and display:
   ```
   ===================================================
     AL SHAFI HOMEO STORE - Starting Web App
   ===================================================
   [1/2] Checking database...
   [2/2] Launching AL SHAFI HOMEO STORE on http://localhost:5000 ...
   ```
4. Open your browser and navigate to:
   👉 **http://localhost:5000**

> ⚠️ **Important:** Keep that black window open while using the website. Minimize it if you want, but don't close it until you are finished.

### Option B: From Command Prompt or PowerShell
If you prefer running via terminal:
```powershell
cd "c:\Users\hp\Downloads\al-shafi-homeo-store"
node server/src/index.js
```
Then visit `http://localhost:5000`.

---

## 3. Admin Login & Store Access

### Store Front URLs:
- **Homepage:** `http://localhost:5000`
- **Shop & Remedies:** `http://localhost:5000/shop`
- **Cart & Checkout:** `http://localhost:5000/cart`
- **Track Orders:** `http://localhost:5000/track-order`
- **Doctor Consultation:** `http://localhost:5000/contact`

### Admin Panel Credentials:
- **Admin URL:** `http://localhost:5000/admin`
- **Email / Username:** `admin@alshafihomeo.com` (or the email configured in your `server/.env`)
- **Password:** Configured securely in `server/.env` (default: `Admin@123456`)

#### What You Can Do in the Admin Panel:
1. **Manage Products:** Add new medicines, potencies (Mother Tincture, 30C, 200C, 1M), prices, and upload custom photos.
2. **Manage Categories:** Organize medicines into Dilutions, Mother Tinctures, Biochemic Salts, Tonics, and Eye Care.
3. **Manage Orders & Receipts:** Review customer orders, approve bank transfer payment receipts, and update shipping status (Dispatched, Ready for Pickup, Delivered).
4. **Manage Store Settings:** Edit clinic phone number (`+92 348 5349232`), address (`Raja Bazar, Rawalpindi`), delivery charges, and banners.

---

## 4. Verified Product Photos & Doctor Section

### Real Product Images Included:
All medicines now have pharmaceutical packaging vector artwork in `server/uploads/products/` and `client/public/uploads/products/`:
1. **Arnica Montana 30C** (Schwabe German Dilution bottle)
2. **Berberis Vulgaris Mother Tincture Q** (Botanical Amber Dropper)
3. **Nux Vomica 200C** (Digestive Remedy Bottle)
4. **Alfalfa Tonic with Ginseng** (500ml Family Health Pack)
5. **Calcarea Phosphorica 6X** (Biochemic Tissue Salt Container)
6. **Bio-Combination No. 20** (Skin Remedy 100g Tablets)
7. **Cineraria Maritima Eye Drops** (Sterile Eye Dropper Pack)
8. **Calendula Mother Ointment** (Antiseptic Herbal Cream)

### Doctor Section (Featured on Homepage, About & Contact):
- **Name:** Dr. Musab Maqsood
- **Qualifications:** 4-Year Degree in Homeopathic Medicine (DHMS / BHMS)
- **Experience:** 5+ Years in Clinical Practice & Healthcare Marketing
- **Location:** Raja Bazar, Rawalpindi, Pakistan
- **Direct WhatsApp Consultation:** `+92 348 5349232` (Includes direct click-to-chat button)

---

## 5. How to Deploy Live to the Internet (Free & Easy)

To make your website accessible to anyone in the world (e.g. `https://alshafihomeo.onrender.com` or your own `.com` domain), follow either of these methods:

---

### Method 1: Render.com (Recommended Free Hosting)

[Render](https://render.com) offers free web service hosting for Node.js apps.

#### Step 1: Push Project to GitHub
1. Create a free account on [GitHub.com](https://github.com).
2. Open terminal in `c:\Users\hp\Downloads\al-shafi-homeo-store` and run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Al Shafi Homeo Store"
   ```
3. Create a new GitHub repository called `al-shafi-homeo-store`.
4. Link and push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/al-shafi-homeo-store.git
   git branch -M main
   git push -u origin main
   ```

#### Step 2: Deploy on Render
1. Go to [Render Dashboard](https://dashboard.render.com) and click **New +** -> **Web Service**.
2. Connect your GitHub repository `al-shafi-homeo-store`.
3. Set the following configuration settings:
   - **Name:** `al-shafi-homeo-store`
   - **Environment:** `Node`
   - **Build Command:**
     ```bash
     npm install && cd client && npm install && npm run build && cd ../server && npm install
     ```
   - **Start Command:**
     ```bash
     node server/src/index.js
     ```
   - **Instance Type:** `Free`
4. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `JWT_SECRET` = `alshafi_secure_jwt_token_2026_super_key`
5. Click **Create Web Service**.
6. In 2-3 minutes, Render will build your React frontend, initialize your SQLite database, and give you a live URL like:
   `https://al-shafi-homeo-store.onrender.com`!

---

### Method 2: Railway.app (Ultra-Fast 1-Click)

[Railway.app](https://railway.app) automatically detects Node.js and starts the app with persistent volumes:
1. Sign up on [Railway.app](https://railway.app).
2. Click **New Project** -> **Deploy from GitHub Repo**.
3. Select your `al-shafi-homeo-store` repository.
4. Add a Persistent Volume to `/app/server/data` and `/app/server/uploads` so any uploaded photos or database records are saved forever.
5. Railway will automatically give you a public URL (e.g. `https://al-shafi-production.up.railway.app`).

---

### Method 3: VPS (Ubuntu / Cloud Server e.g. DigitalOcean, Hetzner, AWS)

If you have an Ubuntu VPS (costs \$3-\$5/month):

1. **Install Node.js & Git:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs git nginx
   sudo npm install -g pm2
   ```

2. **Clone your repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/al-shafi-homeo-store.git /var/www/alshafi
   cd /var/www/alshafi
   npm install
   cd client && npm install && npm run build
   cd ../server && npm install
   node src/seed.js
   ```

3. **Start the app with PM2 (Auto-restarts if server reboots):**
   ```bash
   pm2 start src/index.js --name "alshafi-store"
   pm2 save
   pm2 startup
   ```

4. **Setup Nginx reverse proxy:**
   Edit `/etc/nginx/sites-available/default`:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   Restart Nginx:
   ```bash
   sudo systemctl restart nginx
   ```

5. **Get Free SSL (HTTPS with Green Lock):**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

---

## 6. How to Connect Your Custom Domain (.com / .pk)

Whether you bought your domain on GoDaddy, Namecheap, PKNIC, or Cloudflare:

1. Open your domain DNS settings.
2. If hosting on **Render** or **Railway**:
   - Add a `CNAME` record:
     - **Name:** `@` (or `www`)
     - **Target:** `your-app-name.onrender.com`
3. If hosting on your own **VPS**:
   - Add an `A` record:
     - **Name:** `@`
     - **Target:** `YOUR_SERVER_PUBLIC_IP`
4. The SSL certificate will be generated automatically!

---

## 📞 Support & Store Inquiries
For store assistance or medical inquiries:
- **Clinic:** AL SHAFI HOMEO STORE, Raja Bazar, Rawalpindi
- **Consultant:** Dr. Musab Maqsood (DHMS)
- **Direct Phone & WhatsApp:** `+92 348 5349232`
