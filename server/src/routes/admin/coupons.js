const express = require('express');
const db = require('../../db');
const { authenticate, requireAdmin } = require('../../middleware/auth');

const router = express.Router();
router.use(authenticate, requireAdmin);

// GET /api/admin/coupons
router.get('/', (req, res) => {
  try {
    const coupons = db.dbAll('SELECT * FROM coupons ORDER BY id DESC');
    res.json({ coupons });
  } catch (error) {
    console.error('Fetch coupons error:', error);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

// POST /api/admin/coupons
router.post('/', (req, res) => {
  try {
    const { code, type = 'fixed', value, min_order = 0, max_uses, is_active = 1, expires_at } = req.body;
    if (!code || !value) {
      return res.status(400).json({ error: 'Coupon code and value are required' });
    }

    const cleanCode = code.toUpperCase().trim();
    const existing = db.dbGet('SELECT id FROM coupons WHERE code = ?', [cleanCode]);
    if (existing) {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }

    const result = db.dbRun(
      `INSERT INTO coupons (code, type, value, min_order, max_uses, is_active, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanCode, type, parseFloat(value), parseFloat(min_order) || 0,
        max_uses ? parseInt(max_uses, 10) : null, is_active ? 1 : 0, expires_at || null
      ]
    );

    const created = db.dbGet('SELECT * FROM coupons WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json({ coupon: created });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});

// PUT /api/admin/coupons/:id
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.dbGet('SELECT * FROM coupons WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    const { code, type, value, min_order, max_uses, is_active, expires_at } = req.body;

    db.dbRun(
      `UPDATE coupons SET
        code = COALESCE(?, code),
        type = COALESCE(?, type),
        value = COALESCE(?, value),
        min_order = COALESCE(?, min_order),
        max_uses = ?,
        is_active = COALESCE(?, is_active),
        expires_at = ?
      WHERE id = ?`,
      [
        code ? code.toUpperCase().trim() : null,
        type,
        value ? parseFloat(value) : null,
        min_order !== undefined ? parseFloat(min_order) : null,
        max_uses !== undefined ? (max_uses ? parseInt(max_uses, 10) : null) : existing.max_uses,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        expires_at !== undefined ? (expires_at || null) : existing.expires_at,
        id
      ]
    );

    const updated = db.dbGet('SELECT * FROM coupons WHERE id = ?', [id]);
    res.json({ coupon: updated });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({ error: 'Failed to update coupon' });
  }
});

// DELETE /api/admin/coupons/:id
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.dbRun('DELETE FROM coupons WHERE id = ?', [id]);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
});

module.exports = router;
