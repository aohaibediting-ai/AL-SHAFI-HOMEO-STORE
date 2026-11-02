const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('../../db');
const { authenticate, requireAdmin } = require('../../middleware/auth');
const { bannerUpload } = require('../../middleware/upload');

const router = express.Router();
router.use(authenticate, requireAdmin);

// GET /api/admin/settings - Get all store settings
router.get('/', (req, res) => {
  try {
    const rows = db.dbAll('SELECT key, value FROM store_settings');
    const settings = {};
    rows.forEach(r => {
      settings[r.key] = r.value;
    });
    res.json({ settings });
  } catch (error) {
    console.error('Fetch settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/admin/settings - Update settings (key-value pairs)
router.put('/', (req, res) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings payload' });
    }

    db.dbTransaction(() => {
      for (const [key, value] of Object.entries(settings)) {
        db.dbRun(
          `INSERT INTO store_settings (key, value, updated_at)
           VALUES (?, ?, datetime('now'))
           ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
          [key, value !== undefined && value !== null ? String(value) : '']
        );
      }

      db.dbRun(
        `INSERT INTO audit_logs (user_id, action, entity_type, details)
         VALUES (?, 'UPDATE_SETTINGS', 'store_settings', 'Store settings updated by admin')`,
        [req.user.id]
      );
    });

    const rows = db.dbAll('SELECT key, value FROM store_settings');
    const updated = {};
    rows.forEach(r => { updated[r.key] = r.value; });

    res.json({ success: true, settings: updated });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update store settings' });
  }
});

// Banners management
router.get('/banners', (req, res) => {
  try {
    const banners = db.dbAll('SELECT * FROM banners ORDER BY sort_order ASC, id ASC');
    res.json({ banners });
  } catch (error) {
    console.error('Fetch banners error:', error);
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
});

router.post('/banners', bannerUpload.single('image'), (req, res) => {
  try {
    const { title, subtitle, link, sort_order = 0, is_active = 1 } = req.body;
    const imagePath = req.file ? `/uploads/banners/${req.file.filename}` : null;

    const result = db.dbRun(
      'INSERT INTO banners (title, subtitle, image, link, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [title || null, subtitle || null, imagePath, link || null, parseInt(sort_order, 10) || 0, is_active ? 1 : 0]
    );

    const created = db.dbGet('SELECT * FROM banners WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json({ banner: created });
  } catch (error) {
    console.error('Create banner error:', error);
    res.status(500).json({ error: 'Failed to create banner' });
  }
});

router.put('/banners/:id', bannerUpload.single('image'), (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.dbGet('SELECT * FROM banners WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    const { title, subtitle, link, sort_order, is_active } = req.body;
    const imagePath = req.file ? `/uploads/banners/${req.file.filename}` : existing.image;

    db.dbRun(
      `UPDATE banners SET
        title = COALESCE(?, title),
        subtitle = COALESCE(?, subtitle),
        image = ?,
        link = COALESCE(?, link),
        sort_order = COALESCE(?, sort_order),
        is_active = COALESCE(?, is_active)
      WHERE id = ?`,
      [
        title, subtitle, imagePath, link,
        sort_order !== undefined ? parseInt(sort_order, 10) : null,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        id
      ]
    );

    const updated = db.dbGet('SELECT * FROM banners WHERE id = ?', [id]);
    res.json({ banner: updated });
  } catch (error) {
    console.error('Update banner error:', error);
    res.status(500).json({ error: 'Failed to update banner' });
  }
});

router.delete('/banners/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.dbGet('SELECT * FROM banners WHERE id = ?', [id]);
    if (existing && existing.image && existing.image.startsWith('/uploads/')) {
      const fullPath = path.resolve(process.env.UPLOAD_DIR || './uploads', existing.image.replace('/uploads/', ''));
      if (fs.existsSync(fullPath)) {
        try { fs.unlinkSync(fullPath); } catch (e) { }
      }
    }

    db.dbRun('DELETE FROM banners WHERE id = ?', [id]);
    res.json({ success: true, message: 'Banner removed' });
  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json({ error: 'Failed to delete banner' });
  }
});

// Customers list
router.get('/customers', (req, res) => {
  try {
    const customers = db.dbAll(`
      SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at,
        COUNT(o.id) as orders_count,
        COALESCE(SUM(CASE WHEN o.payment_status = 'paid' THEN o.total ELSE 0 END), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.role = 'customer'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    res.json({ customers });
  } catch (error) {
    console.error('Fetch customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Audit logs
router.get('/audit-logs', (req, res) => {
  try {
    const logs = db.dbAll(`
      SELECT a.*, u.name as user_name, u.email as user_email
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 100
    `);
    res.json({ logs });
  } catch (error) {
    console.error('Fetch audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

module.exports = router;
