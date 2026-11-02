const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/products - List published products with pagination and filters
router.get('/', (req, res) => {
  try {
    const {
      search,
      category,
      min_price,
      max_price,
      in_stock,
      manufacturer,
      sort = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));
    const offset = (pageNum - 1) * limitNum;

    let whereClauses = ["p.status = 'published'"];
    let params = [];

    if (search) {
      whereClauses.push('(p.name LIKE ? OR p.sku LIKE ? OR p.manufacturer LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (category) {
      whereClauses.push('c.slug = ?');
      params.push(category);
    }

    if (min_price) {
      whereClauses.push('COALESCE(p.sale_price, p.price) >= ?');
      params.push(parseFloat(min_price));
    }

    if (max_price) {
      whereClauses.push('COALESCE(p.sale_price, p.price) <= ?');
      params.push(parseFloat(max_price));
    }

    if (in_stock === 'true') {
      whereClauses.push('p.stock > 0');
    }

    if (manufacturer) {
      whereClauses.push('p.manufacturer = ?');
      params.push(manufacturer);
    }

    const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    let orderSQL;
    switch (sort) {
      case 'price_asc':
        orderSQL = 'ORDER BY COALESCE(p.sale_price, p.price) ASC';
        break;
      case 'price_desc':
        orderSQL = 'ORDER BY COALESCE(p.sale_price, p.price) DESC';
        break;
      case 'name_asc':
        orderSQL = 'ORDER BY p.name ASC';
        break;
      case 'name_desc':
        orderSQL = 'ORDER BY p.name DESC';
        break;
      case 'newest':
      default:
        orderSQL = 'ORDER BY p.created_at DESC';
        break;
    }

    const countRow = db.prepare(
      `SELECT COUNT(DISTINCT p.id) as total FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereSQL}`
    ).get(...params);

    const total = countRow.total;
    const totalPages = Math.ceil(total / limitNum);

    const products = db.prepare(
      `SELECT p.*, c.name as category_name, c.slug as category_slug,
        (SELECT pi.image_path FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.sort_order ASC LIMIT 1) as image
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereSQL}
       ${orderSQL}
       LIMIT ? OFFSET ?`
    ).all(...params, limitNum, offset);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });
  } catch (err) {
    console.error('List products error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/manufacturers - Return distinct manufacturer list
// NOTE: This route must be before /:slug to avoid conflict
router.get('/manufacturers', (req, res) => {
  try {
    const manufacturers = db.prepare(
      "SELECT DISTINCT manufacturer FROM products WHERE manufacturer IS NOT NULL AND manufacturer != '' AND status = 'published' ORDER BY manufacturer ASC"
    ).all();

    res.json({ manufacturers: manufacturers.map(m => m.manufacturer) });
  } catch (err) {
    console.error('List manufacturers error:', err);
    res.status(500).json({ error: 'Failed to fetch manufacturers' });
  }
});

// GET /api/products/featured - Return featured published products
router.get('/featured', (req, res) => {
  try {
    const products = db.prepare(
      `SELECT p.*, c.name as category_name, c.slug as category_slug,
        (SELECT pi.image_path FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.sort_order ASC LIMIT 1) as image
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.status = 'published' AND p.is_featured = 1
       ORDER BY p.created_at DESC
       LIMIT 8`
    ).all();

    res.json({ products });
  } catch (err) {
    console.error('Featured products error:', err);
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
});

// GET /api/products/new-arrivals - Return latest published products
router.get('/new-arrivals', (req, res) => {
  try {
    const products = db.prepare(
      `SELECT p.*, c.name as category_name, c.slug as category_slug,
        (SELECT pi.image_path FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.sort_order ASC LIMIT 1) as image
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.status = 'published'
       ORDER BY p.created_at DESC
       LIMIT 8`
    ).all();

    res.json({ products });
  } catch (err) {
    console.error('New arrivals error:', err);
    res.status(500).json({ error: 'Failed to fetch new arrivals' });
  }
});

// GET /api/products/best-sellers - Return products ordered by total quantity sold
router.get('/best-sellers', (req, res) => {
  try {
    const products = db.prepare(
      `SELECT p.*, c.name as category_name, c.slug as category_slug,
        (SELECT pi.image_path FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.sort_order ASC LIMIT 1) as image,
        COALESCE(SUM(oi.quantity), 0) as total_sold
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN order_items oi ON oi.product_id = p.id
       WHERE p.status = 'published'
       GROUP BY p.id
       ORDER BY total_sold DESC
       LIMIT 8`
    ).all();

    res.json({ products });
  } catch (err) {
    console.error('Best sellers error:', err);
    res.status(500).json({ error: 'Failed to fetch best sellers' });
  }
});

// GET /api/products/:slug - Get single product with all details
router.get('/:slug', (req, res) => {
  try {
    const product = db.prepare(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ? AND p.status = 'published'`
    ).get(req.params.slug);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const images = db.prepare(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC'
    ).all(product.id);

    const relatedProducts = db.prepare(
      `SELECT p.*, c.name as category_name, c.slug as category_slug,
        (SELECT pi.image_path FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.sort_order ASC LIMIT 1) as image
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.category_id = ? AND p.id != ? AND p.status = 'published'
       ORDER BY p.created_at DESC
       LIMIT 4`
    ).all(product.category_id, product.id);

    res.json({
      product: {
        ...product,
        images
      },
      relatedProducts
    });
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

module.exports = router;
