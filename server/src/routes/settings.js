const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/settings/public - Safe public store settings
router.get('/public', (req, res) => {
  try {
    const rows = db.dbAll('SELECT key, value FROM store_settings');
    const settings = {};
    rows.forEach(r => {
      // Do not expose private payment keys or internal secrets
      if (!r.key.toLowerCase().includes('secret') && !r.key.toLowerCase().includes('password')) {
        settings[r.key] = r.value;
      }
    });

    res.json({ settings });
  } catch (error) {
    console.error('Public settings error:', error);
    res.status(500).json({ error: 'Failed to load store settings' });
  }
});

// GET /api/banners - Public active promotional banners
router.get('/banners', (req, res) => {
  try {
    const banners = db.dbAll('SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order ASC, id ASC');
    res.json({ banners });
  } catch (error) {
    console.error('Banners error:', error);
    res.status(500).json({ error: 'Failed to load banners' });
  }
});

// POST /api/coupons/validate - Validate coupon code
router.post('/coupons/validate', (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }

    const subtotalNum = parseFloat(subtotal) || 0;
    const coupon = db.dbGet('SELECT * FROM coupons WHERE code = ? AND is_active = 1', [code.toUpperCase().trim()]);

    if (!coupon) {
      return res.status(404).json({ error: 'Invalid or expired coupon code' });
    }

    const now = new Date().toISOString();
    if (coupon.expires_at && coupon.expires_at < now) {
      return res.status(400).json({ error: 'This coupon has expired' });
    }

    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return res.status(400).json({ error: 'Coupon usage limit has been reached' });
    }

    if (subtotalNum < (coupon.min_order || 0)) {
      return res.status(400).json({
        error: `Minimum order amount of Rs. ${coupon.min_order} required for this coupon`
      });
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (subtotalNum * coupon.value) / 100;
    } else {
      discount = Math.min(subtotalNum, coupon.value);
    }

    res.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount: Math.round(discount * 100) / 100
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    res.status(500).json({ error: 'Failed to validate coupon' });
  }
});

module.exports = router;
