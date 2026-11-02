const express = require('express');
const path = require('path');
const db = require('../db');
const { receiptUpload } = require('../middleware/upload');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/payments/:orderId/receipt - Customer uploads receipt for manual payment
router.post('/:orderId/receipt', optionalAuth, receiptUpload.single('receipt'), (req, res) => {
  try {
    const { orderId } = req.params;
    const { transaction_id, notes, guest_token } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a receipt image or document' });
    }

    const order = db.dbGet('SELECT * FROM orders WHERE id = ? OR order_number = ?', [orderId, orderId]);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify permission: either authenticated user owns the order, or matching guest_token
    if (req.user && order.user_id && order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to submit receipt for this order' });
    } else if (!req.user && guest_token && order.guest_token !== guest_token) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const receiptUrl = `/uploads/receipts/${req.file.filename}`;

    // Update payment record and order payment_status
    db.dbTransaction(() => {
      // Find existing payment or create one
      const existingPayment = db.dbGet('SELECT id FROM payments WHERE order_id = ? ORDER BY id DESC LIMIT 1', [order.id]);
      if (existingPayment) {
        db.dbRun(
          `UPDATE payments 
           SET receipt_image = ?, transaction_id = COALESCE(?, transaction_id), 
               notes = COALESCE(?, notes), status = 'pending'
           WHERE id = ?`,
          [receiptUrl, transaction_id || null, notes || 'Receipt uploaded by customer', existingPayment.id]
        );
      } else {
        db.dbRun(
          `INSERT INTO payments (order_id, amount, method, status, transaction_id, receipt_image, notes)
           VALUES (?, ?, ?, 'pending', ?, ?, ?)`,
          [order.id, order.total, order.payment_method, transaction_id || null, receiptUrl, notes || 'Receipt uploaded']
        );
      }

      db.dbRun(
        'UPDATE orders SET payment_status = "awaiting_verification", updated_at = datetime("now") WHERE id = ?',
        [order.id]
      );
    });

    res.json({
      success: true,
      message: 'Payment receipt uploaded successfully. Our team will verify it shortly.',
      receipt_image: receiptUrl
    });
  } catch (error) {
    console.error('Receipt upload error:', error);
    res.status(500).json({ error: 'Failed to process receipt upload' });
  }
});

module.exports = router;
