const express = require('express');
const db = require('../../db');
const { authenticate, requireAdmin } = require('../../middleware/auth');
const { categoryUpload } = require('../../middleware/upload');

const router = express.Router();
router.use(authenticate, requireAdmin);

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// GET /api/admin/categories - List categories with product count
router.get('/', (req, res) => {
  try {
    const categories = db.dbAll(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC
    `);
    res.json({ categories });
  } catch (error) {
    console.error('Admin categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/admin/categories - Create category
router.post('/', categoryUpload.single('image'), (req, res) => {
  try {
    const { name, description, sort_order = 0, is_visible = 1 } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    let slug = slugify(name);
    const existing = db.dbGet('SELECT id FROM categories WHERE slug = ?', [slug]);
    if (existing) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const imagePath = req.file ? `/uploads/categories/${req.file.filename}` : null;

    const result = db.dbRun(
      `INSERT INTO categories (name, slug, description, image, sort_order, is_visible)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name.trim(), slug, description || null, imagePath, parseInt(sort_order, 10) || 0, is_visible ? 1 : 0]
    );

    const created = db.dbGet('SELECT * FROM categories WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json({ category: created });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT /api/admin/categories/:id - Update category
router.put('/:id', categoryUpload.single('image'), (req, res) => {
  try {
    const { id } = req.params;
    const category = db.dbGet('SELECT * FROM categories WHERE id = ?', [id]);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const { name, description, sort_order, is_visible } = req.body;
    const imagePath = req.file ? `/uploads/categories/${req.file.filename}` : category.image;

    db.dbRun(
      `UPDATE categories SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        image = ?,
        sort_order = COALESCE(?, sort_order),
        is_visible = COALESCE(?, is_visible)
      WHERE id = ?`,
      [
        name ? name.trim() : null,
        description,
        imagePath,
        sort_order !== undefined ? parseInt(sort_order, 10) : null,
        is_visible !== undefined ? (is_visible ? 1 : 0) : null,
        id
      ]
    );

    const updated = db.dbGet('SELECT * FROM categories WHERE id = ?', [id]);
    res.json({ category: updated });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE /api/admin/categories/:id - Delete category (protected against accidental data loss)
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const productCountRow = db.dbGet('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [id]);
    const productCount = productCountRow?.count || 0;

    if (productCount > 0) {
      return res.status(400).json({
        error: `Cannot delete category because it contains ${productCount} product(s). Please reassign or delete the products first.`
      });
    }

    db.dbRun('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
