const express = require('express');
const db = require('../../db');
const { authenticate, requireAdmin } = require('../../middleware/auth');

const router = express.Router();
router.use(authenticate, requireAdmin);

// GET /api/admin/inventory - List stock status
router.get('/', (req, res) => {
  try {
    const { filter, search } = req.query;

    let where = [];
    let params = [];

    if (search) {
      where.push('(name LIKE ? OR sku LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term);
    }

    if (filter === 'low') {
      where.push('stock > 0 AND stock <= low_stock_threshold');
    } else if (filter === 'out') {
      where.push('stock = 0');
    }

    const whereSQL = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

    const products = db.dbAll(
      `SELECT id, name, sku, stock, low_stock_threshold, price, status, updated_at,
        (SELECT image_path FROM product_images WHERE product_id = products.id ORDER BY sort_order ASC, id ASC LIMIT 1) as image
       FROM products
       ${whereSQL}
       ORDER BY stock ASC, name ASC`,
      params
    );

    res.json({ inventory: products });
  } catch (error) {
    console.error('Fetch inventory error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory records' });
  }
});

// PUT /api/admin/inventory/:productId - Manual stock adjustment
router.put('/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity_change, notes = 'Manual stock adjustment' } = req.body;

    const change = parseInt(quantity_change, 10);
    if (isNaN(change) || change === 0) {
      return res.status(400).json({ error: 'Valid non-zero quantity change is required' });
    }

    const product = db.dbGet('SELECT * FROM products WHERE id = ?', [productId]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const newStock = Math.max(0, product.stock + change);

    db.dbTransaction(() => {
      db.dbRun('UPDATE products SET stock = ?, updated_at = datetime("now") WHERE id = ?', [newStock, productId]);

      db.dbRun(
        `INSERT INTO inventory_movements (product_id, quantity_change, type, notes)
         VALUES (?, ?, 'manual', ?)`,
        [productId, change, notes]
      );
    });

    const updated = db.dbGet('SELECT id, name, sku, stock, low_stock_threshold FROM products WHERE id = ?', [productId]);
    res.json({ success: true, product: updated });
  } catch (error) {
    console.error('Adjust stock error:', error);
    res.status(500).json({ error: 'Failed to adjust stock level' });
  }
});

// GET /api/admin/inventory/:productId/history - Get product inventory movements history
router.get('/:productId/history', (req, res) => {
  try {
    const { productId } = req.params;
    const history = db.dbAll(
      'SELECT * FROM inventory_movements WHERE product_id = ? ORDER BY created_at DESC LIMIT 50',
      [productId]
    );
    res.json({ history });
  } catch (error) {
    console.error('Fetch stock history error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory history' });
  }
});

module.exports = router;
