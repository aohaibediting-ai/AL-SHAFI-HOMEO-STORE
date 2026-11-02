const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/customer/addresses - List all saved addresses
router.get('/', authenticate, (req, res) => {
  try {
    const addresses = db.dbAll(
      'SELECT * FROM customer_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC',
      [req.user.id]
    );
    res.json({ addresses });
  } catch (error) {
    console.error('Fetch addresses error:', error);
    res.status(500).json({ error: 'Failed to fetch saved addresses' });
  }
});

// POST /api/customer/addresses - Create new address
router.post('/', authenticate, (req, res) => {
  try {
    const {
      name, phone, email, country = 'Pakistan', city, area,
      street, house_number, landmark, postal_code, delivery_instructions, is_default = 0
    } = req.body;

    if (!name || !phone || !city) {
      return res.status(400).json({ error: 'Name, phone, and city are required' });
    }

    db.dbTransaction(() => {
      if (is_default) {
        db.dbRun('UPDATE customer_addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
      }

      const result = db.dbRun(
        `INSERT INTO customer_addresses (
          user_id, name, phone, email, country, city, area, street,
          house_number, landmark, postal_code, delivery_instructions, is_default
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id, name, phone, email || null, country, city, area || null,
          street || null, house_number || null, landmark || null, postal_code || null,
          delivery_instructions || null, is_default ? 1 : 0
        ]
      );

      const created = db.dbGet('SELECT * FROM customer_addresses WHERE id = ?', [result.lastInsertRowid]);
      res.status(201).json({ address: created });
    });
  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({ error: 'Failed to save address' });
  }
});

// PUT /api/customer/addresses/:id - Update address
router.put('/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.dbGet('SELECT * FROM customer_addresses WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Address not found' });
    }

    const {
      name, phone, email, country, city, area, street,
      house_number, landmark, postal_code, delivery_instructions, is_default
    } = req.body;

    db.dbTransaction(() => {
      if (is_default) {
        db.dbRun('UPDATE customer_addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
      }

      db.dbRun(
        `UPDATE customer_addresses SET
          name = COALESCE(?, name),
          phone = COALESCE(?, phone),
          email = COALESCE(?, email),
          country = COALESCE(?, country),
          city = COALESCE(?, city),
          area = COALESCE(?, area),
          street = COALESCE(?, street),
          house_number = COALESCE(?, house_number),
          landmark = COALESCE(?, landmark),
          postal_code = COALESCE(?, postal_code),
          delivery_instructions = COALESCE(?, delivery_instructions),
          is_default = COALESCE(?, is_default)
        WHERE id = ?`,
        [
          name, phone, email, country, city, area, street,
          house_number, landmark, postal_code, delivery_instructions,
          is_default !== undefined ? (is_default ? 1 : 0) : null,
          id
        ]
      );
    });

    const updated = db.dbGet('SELECT * FROM customer_addresses WHERE id = ?', [id]);
    res.json({ address: updated });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ error: 'Failed to update address' });
  }
});

// DELETE /api/customer/addresses/:id
router.delete('/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.dbGet('SELECT * FROM customer_addresses WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Address not found' });
    }

    db.dbRun('DELETE FROM customer_addresses WHERE id = ?', [id]);
    res.json({ success: true, message: 'Address removed' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

module.exports = router;
