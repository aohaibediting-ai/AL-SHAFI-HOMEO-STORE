const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/categories - List visible categories with product count
router.get('/', (req, res) => {
  try {
    const categories = db.prepare(
      `SELECT c.*,
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.status = 'published') as product_count
       FROM categories c
       WHERE c.is_visible = 1
       ORDER BY c.sort_order ASC, c.name ASC`
    ).all();

    res.json({ categories });
  } catch (err) {
    console.error('List categories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/categories/:slug - Get category with its published products
router.get('/:slug', (req, res) => {
  try {
    const category = db.prepare(
      'SELECT * FROM categories WHERE slug = ? AND is_visible = 1'
    ).get(req.params.slug);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const offset = (page - 1) * limit;

    const countRow = db.prepare(
      "SELECT COUNT(*) as total FROM products WHERE category_id = ? AND status = 'published'"
    ).get(category.id);

    const total = countRow.total;
    const totalPages = Math.ceil(total / limit);

    const products = db.prepare(
      `SELECT p.*,
        (SELECT pi.image_path FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.sort_order ASC LIMIT 1) as image
       FROM products p
       WHERE p.category_id = ? AND p.status = 'published'
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`
    ).all(category.id, limit, offset);

    res.json({
      category,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('Get category error:', err);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

module.exports = router;
