const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('../../db');
const { authenticate, requireAdmin } = require('../../middleware/auth');
const { productUpload } = require('../../middleware/upload');

const router = express.Router();
router.use(authenticate, requireAdmin);

// Helper to slugify string
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

// GET /api/admin/products - List all products
router.get('/', (req, res) => {
  try {
    const { search, category_id, status, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    let where = [];
    let params = [];

    if (search) {
      where.push('(p.name LIKE ? OR p.sku LIKE ? OR p.manufacturer LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (category_id) {
      where.push('p.category_id = ?');
      params.push(category_id);
    }

    if (status) {
      where.push('p.status = ?');
      params.push(status);
    }

    const whereSQL = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

    const countRow = db.dbGet(
      `SELECT COUNT(*) as count FROM products p ${whereSQL}`,
      params
    );
    const total = countRow?.count || 0;

    const products = db.dbAll(
      `SELECT p.*, c.name as category_name,
        (SELECT image_path FROM product_images WHERE product_id = p.id ORDER BY sort_order ASC, id ASC LIMIT 1) as primary_image
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereSQL}
       ORDER BY p.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Admin fetch products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/admin/products/:id - Single product with all images
router.get('/:id', (req, res) => {
  try {
    const product = db.dbGet('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const images = db.dbAll(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC, id ASC',
      [product.id]
    );

    res.json({ product, images });
  } catch (error) {
    console.error('Admin get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /api/admin/products - Create product with multiple image uploads
router.post('/', productUpload.array('images', 6), (req, res) => {
  try {
    const {
      name, sku, barcode, description, ingredients, manufacturer,
      product_size, category_id, price, sale_price, stock = 0,
      low_stock_threshold = 5, status = 'draft', is_featured = 0,
      usage_instructions, storage_info, warnings, delivery_info
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Product name and regular price are required' });
    }

    let productSlug = slugify(name);
    // Ensure unique slug
    let existingSlug = db.dbGet('SELECT id FROM products WHERE slug = ?', [productSlug]);
    if (existingSlug) {
      productSlug = `${productSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Auto SKU if empty
    const productSku = sku && sku.trim() !== ''
      ? sku.trim().toUpperCase()
      : `ASH-${Math.floor(100000 + Math.random() * 900000)}`;

    const result = db.dbTransaction(() => {
      const insert = db.dbRun(
        `INSERT INTO products (
          name, slug, sku, barcode, description, ingredients, manufacturer,
          product_size, category_id, price, sale_price, stock,
          low_stock_threshold, status, is_featured, usage_instructions,
          storage_info, warnings, delivery_info
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name, productSlug, productSku, barcode || null, description || null, ingredients || null, manufacturer || null,
          product_size || null, category_id ? parseInt(category_id, 10) : null, parseFloat(price),
          sale_price ? parseFloat(sale_price) : null, parseInt(stock, 10) || 0,
          parseInt(low_stock_threshold, 10) || 5, status, is_featured ? 1 : 0,
          usage_instructions || null, storage_info || null, warnings || null, delivery_info || null
        ]
      );

      const productId = insert.lastInsertRowid;

      // Save uploaded images
      if (req.files && req.files.length > 0) {
        req.files.forEach((file, idx) => {
          const imgPath = `/uploads/products/${file.filename}`;
          db.dbRun(
            'INSERT INTO product_images (product_id, image_path, sort_order) VALUES (?, ?, ?)',
            [productId, imgPath, idx]
          );
        });
      }

      // Initial inventory log
      if (parseInt(stock, 10) > 0) {
        db.dbRun(
          `INSERT INTO inventory_movements (product_id, quantity_change, type, notes)
           VALUES (?, ?, 'manual', 'Initial stock on product creation')`,
          [productId, parseInt(stock, 10)]
        );
      }

      return productId;
    });

    const newProduct = db.dbGet('SELECT * FROM products WHERE id = ?', [result]);
    const images = db.dbAll('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC', [result]);

    res.status(201).json({ product: newProduct, images });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product: ' + (error.message || '') });
  }
});

// PUT /api/admin/products/:id - Update product
router.put('/:id', productUpload.array('images', 6), (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.dbGet('SELECT * FROM products WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const {
      name, sku, barcode, description, ingredients, manufacturer,
      product_size, category_id, price, sale_price, stock,
      low_stock_threshold, status, is_featured, usage_instructions,
      storage_info, warnings, delivery_info
    } = req.body;

    const prevStock = existing.stock;
    const newStock = stock !== undefined ? parseInt(stock, 10) : prevStock;

    db.dbTransaction(() => {
      db.dbRun(
        `UPDATE products SET
          name = COALESCE(?, name),
          sku = COALESCE(?, sku),
          barcode = COALESCE(?, barcode),
          description = COALESCE(?, description),
          ingredients = COALESCE(?, ingredients),
          manufacturer = COALESCE(?, manufacturer),
          product_size = COALESCE(?, product_size),
          category_id = ?,
          price = COALESCE(?, price),
          sale_price = ?,
          stock = COALESCE(?, stock),
          low_stock_threshold = COALESCE(?, low_stock_threshold),
          status = COALESCE(?, status),
          is_featured = COALESCE(?, is_featured),
          usage_instructions = COALESCE(?, usage_instructions),
          storage_info = COALESCE(?, storage_info),
          warnings = COALESCE(?, warnings),
          delivery_info = COALESCE(?, delivery_info),
          updated_at = datetime('now')
        WHERE id = ?`,
        [
          name, sku, barcode, description, ingredients, manufacturer,
          product_size, category_id !== undefined ? (category_id ? parseInt(category_id, 10) : null) : existing.category_id,
          price ? parseFloat(price) : null,
          sale_price !== undefined ? (sale_price ? parseFloat(sale_price) : null) : existing.sale_price,
          newStock, low_stock_threshold ? parseInt(low_stock_threshold, 10) : null,
          status, is_featured !== undefined ? (is_featured ? 1 : 0) : null,
          usage_instructions, storage_info, warnings, delivery_info,
          id
        ]
      );

      // Save additional uploaded images
      if (req.files && req.files.length > 0) {
        const lastSortRow = db.dbGet('SELECT MAX(sort_order) as max_sort FROM product_images WHERE product_id = ?', [id]);
        let nextSort = (lastSortRow?.max_sort || 0) + 1;

        req.files.forEach((file) => {
          const imgPath = `/uploads/products/${file.filename}`;
          db.dbRun(
            'INSERT INTO product_images (product_id, image_path, sort_order) VALUES (?, ?, ?)',
            [id, imgPath, nextSort++]
          );
        });
      }

      // Check stock adjustment
      if (stock !== undefined && newStock !== prevStock) {
        const diff = newStock - prevStock;
        db.dbRun(
          `INSERT INTO inventory_movements (product_id, quantity_change, type, notes)
           VALUES (?, ?, 'manual', 'Stock updated via product edit')`,
          [id, diff]
        );
      }
    });

    const updated = db.dbGet('SELECT * FROM products WHERE id = ?', [id]);
    const images = db.dbAll('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC', [id]);

    res.json({ product: updated, images });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// POST /api/admin/products/:id/duplicate - Duplicate product
router.post('/:id/duplicate', (req, res) => {
  try {
    const { id } = req.params;
    const original = db.dbGet('SELECT * FROM products WHERE id = ?', [id]);
    if (!original) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newName = `${original.name} (Copy)`;
    const newSlug = `${original.slug}-copy-${randomSuffix}`;
    const newSku = `${original.sku || 'ASH'}-CPY-${randomSuffix}`;

    const newId = db.dbTransaction(() => {
      const insert = db.dbRun(
        `INSERT INTO products (
          name, slug, sku, barcode, description, ingredients, manufacturer,
          product_size, category_id, price, sale_price, stock, low_stock_threshold,
          status, is_featured, usage_instructions, storage_info, warnings, delivery_info
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', 0, ?, ?, ?, ?)`,
        [
          newName, newSlug, newSku, original.barcode, original.description, original.ingredients,
          original.manufacturer, original.product_size, original.category_id, original.price,
          original.sale_price, original.stock, original.low_stock_threshold,
          original.usage_instructions, original.storage_info, original.warnings, original.delivery_info
        ]
      );

      const duplicatedId = insert.lastInsertRowid;

      // Copy images
      const images = db.dbAll('SELECT image_path, sort_order FROM product_images WHERE product_id = ?', [id]);
      for (const img of images) {
        db.dbRun(
          'INSERT INTO product_images (product_id, image_path, sort_order) VALUES (?, ?, ?)',
          [duplicatedId, img.image_path, img.sort_order]
        );
      }

      return duplicatedId;
    });

    const created = db.dbGet('SELECT * FROM products WHERE id = ?', [newId]);
    res.status(201).json({ product: created });
  } catch (error) {
    console.error('Duplicate product error:', error);
    res.status(500).json({ error: 'Failed to duplicate product' });
  }
});

// DELETE /api/admin/products/:id - Delete product
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const images = db.dbAll('SELECT image_path FROM product_images WHERE product_id = ?', [id]);

    // Clean up physical image files
    images.forEach(img => {
      if (img.image_path && img.image_path.startsWith('/uploads/')) {
        const fullPath = path.resolve(process.env.UPLOAD_DIR || './uploads', img.image_path.replace('/uploads/', ''));
        if (fs.existsSync(fullPath)) {
          try { fs.unlinkSync(fullPath); } catch (e) { /* ignore unlink err */ }
        }
      }
    });

    db.dbRun('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true, message: 'Product deleted permanently' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// DELETE /api/admin/products/:id/images/:imageId - Delete single image
router.delete('/:id/images/:imageId', (req, res) => {
  try {
    const { id, imageId } = req.params;
    const img = db.dbGet('SELECT * FROM product_images WHERE id = ? AND product_id = ?', [imageId, id]);
    if (!img) {
      return res.status(404).json({ error: 'Image not found' });
    }

    if (img.image_path && img.image_path.startsWith('/uploads/')) {
      const fullPath = path.resolve(process.env.UPLOAD_DIR || './uploads', img.image_path.replace('/uploads/', ''));
      if (fs.existsSync(fullPath)) {
        try { fs.unlinkSync(fullPath); } catch (e) { }
      }
    }

    db.dbRun('DELETE FROM product_images WHERE id = ?', [imageId]);
    res.json({ success: true, message: 'Image removed' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router;
