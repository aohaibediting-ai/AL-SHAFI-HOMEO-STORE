require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const { initDb } = require('./db');

// Public & Customer Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const addressRoutes = require('./routes/addresses');
const settingsRoutes = require('./routes/settings');

// Admin Routes
const adminDashboardRoutes = require('./routes/admin/dashboard');
const adminProductRoutes = require('./routes/admin/products');
const adminCategoryRoutes = require('./routes/admin/categories');
const adminOrderRoutes = require('./routes/admin/orders');
const adminInventoryRoutes = require('./routes/admin/inventory');
const adminSettingsRoutes = require('./routes/admin/settings');
const adminCouponRoutes = require('./routes/admin/coupons');

const app = express();
const PORT = process.env.PORT || 5000;

// Security and utility middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false // Allow inline scripts/styles for development and asset loading
}));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow dev origins seamlessly
    }
  },
  credentials: true
}));

// Rate limiting on sensitive auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' }
});

// Static files for uploaded images
const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
app.use('/uploads', express.static(uploadDir));

// Mount Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/customer/addresses', addressRoutes);
app.use('/api/settings', settingsRoutes);

// Mount Admin Routes
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/inventory', adminInventoryRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/admin/coupons', adminCouponRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    store: 'AL SHAFI HOMEO STORE',
    timestamp: new Date().toISOString()
  });
});

// Serve React client build whenever client/dist exists
const clientDist = path.resolve(__dirname, '../../client/dist');
const fs = require('fs');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return res.status(404).json({ error: 'Endpoint not found' });
    }
    res.sendFile(path.resolve(clientDist, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : (err.message || 'Server Error')
  });
});

// Initialize database and start listening
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  🌿 AL SHAFI HOMEO STORE - Backend Server Running`);
    console.log(`  🔗 API: http://localhost:${PORT}/api/health`);
    console.log(`  📦 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=======================================================`);
  });
}).catch(err => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});
