const express = require('express');
const db = require('../../db');
const { authenticate, requireAdmin } = require('../../middleware/auth');

const router = express.Router();
router.use(authenticate, requireAdmin);

// GET /api/admin/orders/export/csv - Export orders to CSV
router.get('/export/csv', (req, res) => {
  try {
    const orders = db.dbAll(`
      SELECT o.order_number, o.created_at, o.customer_name, o.customer_phone, o.customer_email,
             o.shipping_city, o.shipping_street, o.subtotal, o.delivery_charge, o.discount,
             o.total, o.order_status, o.payment_status, o.payment_method, o.fulfilment_type,
             o.tracking_number, o.courier_name
      FROM orders o ORDER BY o.id DESC
    `);

    let csv = 'Order Number,Date,Customer,Phone,Email,City,Address,Subtotal,Delivery,Discount,Total,Order Status,Payment Status,Payment Method,Fulfilment,Tracking,Courier\n';
    orders.forEach(o => {
      const row = [
        `"${o.order_number}"`,
        `"${o.created_at}"`,
        `"${(o.customer_name || '').replace(/"/g, '""')}"`,
        `"${(o.customer_phone || '').replace(/"/g, '""')}"`,
        `"${(o.customer_email || '').replace(/"/g, '""')}"`,
        `"${(o.shipping_city || '').replace(/"/g, '""')}"`,
        `"${(o.shipping_street || '').replace(/"/g, '""')}"`,
        o.subtotal,
        o.delivery_charge,
        o.discount,
        o.total,
        `"${o.order_status}"`,
        `"${o.payment_status}"`,
        `"${o.payment_method}"`,
        `"${o.fulfilment_type}"`,
        `"${o.tracking_number || ''}"`,
        `"${o.courier_name || ''}"`
      ];
      csv += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=orders-export-${new Date().toISOString().slice(0, 10)}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export orders CSV error:', error);
    res.status(500).json({ error: 'Failed to export orders' });
  }
});

// GET /api/admin/orders - List all orders with filters & pagination
router.get('/', (req, res) => {
  try {
    const {
      search, order_status, payment_status, payment_method,
      start_date, end_date, page = 1, limit = 20
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    let where = [];
    let params = [];

    if (search) {
      where.push('(o.order_number LIKE ? OR o.customer_name LIKE ? OR o.customer_phone LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (order_status) {
      where.push('o.order_status = ?');
      params.push(order_status);
    }

    if (payment_status) {
      where.push('o.payment_status = ?');
      params.push(payment_status);
    }

    if (payment_method) {
      where.push('o.payment_method = ?');
      params.push(payment_method);
    }

    if (start_date) {
      where.push('o.created_at >= ?');
      params.push(`${start_date} 00:00:00`);
    }

    if (end_date) {
      where.push('o.created_at <= ?');
      params.push(`${end_date} 23:59:59`);
    }

    const whereSQL = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

    const countRow = db.dbGet(`SELECT COUNT(*) as count FROM orders o ${whereSQL}`, params);
    const total = countRow?.count || 0;

    const orders = db.dbAll(
      `SELECT o.*,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
       FROM orders o
       ${whereSQL}
       ORDER BY o.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    res.json({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Admin fetch orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/admin/orders/:id - Full order detail
router.get('/:id', (req, res) => {
  try {
    const order = db.dbGet('SELECT * FROM orders WHERE id = ? OR order_number = ?', [req.params.id, req.params.id]);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = db.dbAll('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    const payments = db.dbAll('SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC', [order.id]);
    const auditLogs = db.dbAll('SELECT * FROM audit_logs WHERE entity_type = "order" AND entity_id = ? ORDER BY id DESC', [order.id]);

    res.json({ order, items, payments, auditLogs });
  } catch (error) {
    console.error('Admin get order detail error:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

// PUT /api/admin/orders/:id/status - Update fulfillment order status
router.put('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { order_status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'ready_for_pickup', 'shipped', 'delivered', 'cancelled', 'returned'];
    if (!validStatuses.includes(order_status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const order = db.dbGet('SELECT * FROM orders WHERE id = ?', [id]);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    db.dbTransaction(() => {
      db.dbRun('UPDATE orders SET order_status = ?, updated_at = datetime("now") WHERE id = ?', [order_status, id]);

      // If cancelling from admin here, restore stock
      if (order_status === 'cancelled' && order.order_status !== 'cancelled') {
        const items = db.dbAll('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [id]);
        for (const item of items) {
          if (item.product_id) {
            db.dbRun('UPDATE products SET stock = stock + ?, updated_at = datetime("now") WHERE id = ?', [item.quantity, item.product_id]);
            db.dbRun(
              `INSERT INTO inventory_movements (product_id, quantity_change, type, reference_id, notes)
               VALUES (?, ?, 'cancellation', ?, 'Stock restored on admin order cancellation')`,
              [item.product_id, item.quantity, order.order_number]
            );
          }
        }
      }

      // Record audit log
      db.dbRun(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
         VALUES (?, 'UPDATE_ORDER_STATUS', 'order', ?, ?)`,
        [req.user.id, id, `Changed order status from ${order.order_status} to ${order_status}`]
      );
    });

    const updated = db.dbGet('SELECT * FROM orders WHERE id = ?', [id]);
    res.json({ order: updated });
  } catch (error) {
    console.error('Admin update status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// PUT /api/admin/orders/:id/payment - Update payment status
router.put('/:id/payment', (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    const validPaymentStatuses = ['unpaid', 'awaiting_verification', 'paid', 'refunded', 'failed'];
    if (!validPaymentStatuses.includes(payment_status)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }

    const order = db.dbGet('SELECT * FROM orders WHERE id = ?', [id]);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    db.dbTransaction(() => {
      db.dbRun('UPDATE orders SET payment_status = ?, updated_at = datetime("now") WHERE id = ?', [payment_status, id]);

      // Update or insert payment entry
      const existing = db.dbGet('SELECT id FROM payments WHERE order_id = ? ORDER BY id DESC LIMIT 1', [id]);
      if (existing) {
        db.dbRun('UPDATE payments SET status = ? WHERE id = ?', [
          payment_status === 'paid' ? 'completed' : (payment_status === 'refunded' ? 'refunded' : 'pending'),
          existing.id
        ]);
      } else {
        db.dbRun(
          'INSERT INTO payments (order_id, amount, method, status) VALUES (?, ?, ?, ?)',
          [id, order.total, order.payment_method, payment_status === 'paid' ? 'completed' : 'pending']
        );
      }

      // If refunded, restore inventory
      if (payment_status === 'refunded' && order.payment_status !== 'refunded') {
        const items = db.dbAll('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [id]);
        for (const item of items) {
          if (item.product_id) {
            db.dbRun('UPDATE products SET stock = stock + ?, updated_at = datetime("now") WHERE id = ?', [item.quantity, item.product_id]);
            db.dbRun(
              `INSERT INTO inventory_movements (product_id, quantity_change, type, reference_id, notes)
               VALUES (?, ?, 'return', ?, 'Stock restored on refund')`,
              [item.product_id, item.quantity, order.order_number]
            );
          }
        }
      }

      db.dbRun(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
         VALUES (?, 'UPDATE_PAYMENT_STATUS', 'order', ?, ?)`,
        [req.user.id, id, `Changed payment status from ${order.payment_status} to ${payment_status}`]
      );
    });

    const updated = db.dbGet('SELECT * FROM orders WHERE id = ?', [id]);
    res.json({ order: updated });
  } catch (error) {
    console.error('Admin update payment error:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

// PUT /api/admin/orders/:id/tracking - Update shipment tracking
router.put('/:id/tracking', (req, res) => {
  try {
    const { id } = req.params;
    const { tracking_number, courier_name, auto_ship = true } = req.body;

    const order = db.dbGet('SELECT * FROM orders WHERE id = ?', [id]);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    db.dbTransaction(() => {
      let newStatus = order.order_status;
      if (auto_ship && (order.order_status === 'confirmed' || order.order_status === 'processing')) {
        newStatus = 'shipped';
      }

      db.dbRun(
        `UPDATE orders SET
          tracking_number = ?,
          courier_name = ?,
          order_status = ?,
          updated_at = datetime("now")
        WHERE id = ?`,
        [tracking_number || null, courier_name || null, newStatus, id]
      );

      db.dbRun(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
         VALUES (?, 'UPDATE_TRACKING', 'order', ?, ?)`,
        [req.user.id, id, `Courier: ${courier_name || 'N/A'}, Tracking: ${tracking_number || 'N/A'}`]
      );
    });

    const updated = db.dbGet('SELECT * FROM orders WHERE id = ?', [id]);
    res.json({ order: updated });
  } catch (error) {
    console.error('Update tracking error:', error);
    res.status(500).json({ error: 'Failed to update tracking information' });
  }
});

// POST /api/admin/orders/:id/notes - Save admin internal notes
router.post('/:id/notes', (req, res) => {
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;

    db.dbRun('UPDATE orders SET admin_notes = ?, updated_at = datetime("now") WHERE id = ?', [admin_notes || null, id]);
    const updated = db.dbGet('SELECT * FROM orders WHERE id = ?', [id]);
    res.json({ order: updated });
  } catch (error) {
    console.error('Save admin notes error:', error);
    res.status(500).json({ error: 'Failed to save notes' });
  }
});

// POST /api/admin/orders/:id/verify-receipt - Approve or reject bank receipt
router.post('/:id/verify-receipt', (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body; // action: 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action must be "approve" or "reject"' });
    }

    const order = db.dbGet('SELECT * FROM orders WHERE id = ?', [id]);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    db.dbTransaction(() => {
      if (action === 'approve') {
        db.dbRun('UPDATE orders SET payment_status = "paid", updated_at = datetime("now") WHERE id = ?', [id]);
        db.dbRun('UPDATE payments SET status = "completed", notes = ? WHERE order_id = ?', [notes || 'Receipt verified & approved by admin', id]);
      } else {
        db.dbRun('UPDATE orders SET payment_status = "unpaid", updated_at = datetime("now") WHERE id = ?', [id]);
        db.dbRun('UPDATE payments SET status = "failed", notes = ? WHERE order_id = ?', [notes || 'Receipt rejected by admin. Please re-upload valid receipt.', id]);
      }

      db.dbRun(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
         VALUES (?, 'VERIFY_RECEIPT', 'order', ?, ?)`,
        [req.user.id, id, `Receipt ${action}d. Notes: ${notes || ''}`]
      );
    });

    const updated = db.dbGet('SELECT * FROM orders WHERE id = ?', [id]);
    res.json({ order: updated });
  } catch (error) {
    console.error('Verify receipt error:', error);
    res.status(500).json({ error: 'Failed to verify payment receipt' });
  }
});

module.exports = router;
