const express = require('express');
const db = require('../../db');
const { authenticate, requireAdmin } = require('../../middleware/auth');

const router = express.Router();
router.use(authenticate, requireAdmin);

router.get('/', (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

    // Order Counts
    const totalOrdersRow = db.dbGet('SELECT COUNT(*) as count FROM orders');
    const todayOrdersRow = db.dbGet('SELECT COUNT(*) as count FROM orders WHERE created_at LIKE ?', [`${today}%`]);
    const pendingOrdersRow = db.dbGet("SELECT COUNT(*) as count FROM orders WHERE order_status = 'pending'");
    const confirmedOrdersRow = db.dbGet("SELECT COUNT(*) as count FROM orders WHERE order_status = 'confirmed'");
    const shippedOrdersRow = db.dbGet("SELECT COUNT(*) as count FROM orders WHERE order_status = 'shipped'");
    const deliveredOrdersRow = db.dbGet("SELECT COUNT(*) as count FROM orders WHERE order_status = 'delivered'");
    const cancelledOrdersRow = db.dbGet("SELECT COUNT(*) as count FROM orders WHERE order_status = 'cancelled'");

    // Revenue
    const totalRevenueRow = db.dbGet("SELECT SUM(total) as sum FROM orders WHERE payment_status = 'paid'");
    const todayRevenueRow = db.dbGet("SELECT SUM(total) as sum FROM orders WHERE payment_status = 'paid' AND created_at LIKE ?", [`${today}%`]);
    const monthRevenueRow = db.dbGet("SELECT SUM(total) as sum FROM orders WHERE payment_status = 'paid' AND created_at >= ?", [firstDayOfMonth]);

    // Product Counts
    const totalProductsRow = db.dbGet('SELECT COUNT(*) as count FROM products');
    const publishedProductsRow = db.dbGet("SELECT COUNT(*) as count FROM products WHERE status = 'published'");
    const draftProductsRow = db.dbGet("SELECT COUNT(*) as count FROM products WHERE status = 'draft'");
    const lowStockProductsRow = db.dbGet('SELECT COUNT(*) as count FROM products WHERE stock > 0 AND stock <= low_stock_threshold');
    const outOfStockProductsRow = db.dbGet('SELECT COUNT(*) as count FROM products WHERE stock = 0');

    // Recent Orders
    const recentOrders = db.dbAll(
      `SELECT id, order_number, customer_name, customer_phone, total, order_status, payment_status, payment_method, created_at
       FROM orders ORDER BY created_at DESC LIMIT 10`
    );

    // Low stock alerts
    const lowStockAlerts = db.dbAll(
      `SELECT id, name, sku, stock, low_stock_threshold, price, status
       FROM products
       WHERE stock <= low_stock_threshold
       ORDER BY stock ASC LIMIT 10`
    );

    res.json({
      stats: {
        totalOrders: totalOrdersRow?.count || 0,
        todayOrders: todayOrdersRow?.count || 0,
        pendingOrders: pendingOrdersRow?.count || 0,
        confirmedOrders: confirmedOrdersRow?.count || 0,
        shippedOrders: shippedOrdersRow?.count || 0,
        deliveredOrders: deliveredOrdersRow?.count || 0,
        cancelledOrders: cancelledOrdersRow?.count || 0,
        totalRevenue: Math.round((totalRevenueRow?.sum || 0) * 100) / 100,
        todayRevenue: Math.round((todayRevenueRow?.sum || 0) * 100) / 100,
        monthRevenue: Math.round((monthRevenueRow?.sum || 0) * 100) / 100,
        totalProducts: totalProductsRow?.count || 0,
        publishedProducts: publishedProductsRow?.count || 0,
        draftProducts: draftProductsRow?.count || 0,
        lowStockProducts: lowStockProductsRow?.count || 0,
        outOfStockProducts: outOfStockProductsRow?.count || 0
      },
      recentOrders,
      lowStockAlerts
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
});

module.exports = router;
