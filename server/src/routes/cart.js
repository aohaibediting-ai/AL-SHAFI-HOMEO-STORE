const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.use(optionalAuth);

function getOrCreateCart(req, res) {
  let cart = null;

  if (req.user) {
    cart = db.prepare('SELECT * FROM carts WHERE user_id = ?').get(req.user.id);
    if (!cart) {
      const result = db.prepare('INSERT INTO carts (user_id) VALUES (?)').run(req.user.id);
      cart = db.prepare('SELECT * FROM carts WHERE id = ?').get(result.lastInsertRowid);
    }
  } else {
    let sessionId = req.cookies && req.cookies.cart_session;
    if (!sessionId) {
      sessionId = uuidv4();
      res.cookie('cart_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
    }
    cart = db.prepare('SELECT * FROM carts WHERE session_id = ?').get(sessionId);
    if (!cart) {
      const result = db.prepare('INSERT INTO carts (session_id) VALUES (?)').run(sessionId);
      cart = db.prepare('SELECT * FROM carts WHERE id = ?').get(result.lastInsertRowid);
    }
  }

  return cart;
}

function getCartDetails(cartId) {
  const items = db.prepare(
    `SELECT ci.*, p.name, p.slug, p.price, p.sale_price, p.stock, p.status,
      (SELECT pi.image_path FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.sort_order ASC LIMIT 1) as image
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.cart_id = ?
     ORDER BY ci.created_at ASC`
  ).all(cartId);

  const settingsRows = db.prepare(
    "SELECT key, value FROM store_settings WHERE key IN ('delivery_charge', 'free_delivery_threshold')"
  ).all();

  const settings = {};
  for (const row of settingsRows) {
    settings[row.key] = row.value;
  }

  const deliveryChargeBase = parseFloat(settings.delivery_charge || '0');
  const freeDeliveryThreshold = parseFloat(settings.free_delivery_threshold || '0');

  let subtotal = 0;
  const cartItems = items.map(item => {
    const unitPrice = item.sale_price || item.price;
    const itemTotal = unitPrice * item.quantity;
    subtotal += itemTotal;
    return {
      id: item.id,
      product_id: item.product_id,
      name: item.name,
      slug: item.slug,
      price: item.price,
      sale_price: item.sale_price,
      unit_price: unitPrice,
      quantity: item.quantity,
      total: itemTotal,
      stock: item.stock,
      status: item.status,
      image: item.image
    };
  });

  const deliveryCharge = (freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold) ? 0 : deliveryChargeBase;
  const total = subtotal + deliveryCharge;

  return {
    items: cartItems,
    itemCount: cartItems.length,
    subtotal,
    delivery_charge: deliveryCharge,
    free_delivery_threshold: freeDeliveryThreshold,
    total
  };
}

// GET /api/cart
router.get('/', (req, res) => {
  try {
    const cart = getOrCreateCart(req, res);
    const details = getCartDetails(cart.id);
    res.json({ cart: details });
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// POST /api/cart/items
router.post('/items', (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const qty = parseInt(quantity, 10);
    if (!qty || qty < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const product = db.prepare(
      "SELECT * FROM products WHERE id = ? AND status = 'published'"
    ).get(product_id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found or unavailable' });
    }

    const cart = getOrCreateCart(req, res);

    const existingItem = db.prepare(
      'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?'
    ).get(cart.id, product_id);

    let newQty = qty;
    if (existingItem) {
      newQty = existingItem.quantity + qty;
    }

    if (newQty > product.stock) {
      return res.status(400).json({
        error: `Only ${product.stock} items available in stock`,
        available_stock: product.stock
      });
    }

    if (existingItem) {
      db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(newQty, existingItem.id);
    } else {
      db.prepare('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)').run(cart.id, product_id, qty);
    }

    db.prepare("UPDATE carts SET updated_at = datetime('now') WHERE id = ?").run(cart.id);

    const details = getCartDetails(cart.id);
    res.json({ message: 'Item added to cart', cart: details });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// PUT /api/cart/items/:itemId
router.put('/items/:itemId', (req, res) => {
  try {
    const { quantity } = req.body;
    const qty = parseInt(quantity, 10);

    if (qty === undefined || qty === null || isNaN(qty) || qty < 0) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    const cart = getOrCreateCart(req, res);

    const item = db.prepare(
      'SELECT ci.*, p.stock FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.id = ? AND ci.cart_id = ?'
    ).get(req.params.itemId, cart.id);

    if (!item) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (qty === 0) {
      db.prepare('DELETE FROM cart_items WHERE id = ?').run(item.id);
    } else {
      if (qty > item.stock) {
        return res.status(400).json({
          error: `Only ${item.stock} items available in stock`,
          available_stock: item.stock
        });
      }
      db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(qty, item.id);
    }

    db.prepare("UPDATE carts SET updated_at = datetime('now') WHERE id = ?").run(cart.id);

    const details = getCartDetails(cart.id);
    res.json({ message: 'Cart updated', cart: details });
  } catch (err) {
    console.error('Update cart item error:', err);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// DELETE /api/cart/items/:itemId
router.delete('/items/:itemId', (req, res) => {
  try {
    const cart = getOrCreateCart(req, res);

    const item = db.prepare(
      'SELECT * FROM cart_items WHERE id = ? AND cart_id = ?'
    ).get(req.params.itemId, cart.id);

    if (!item) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    db.prepare('DELETE FROM cart_items WHERE id = ?').run(item.id);
    db.prepare("UPDATE carts SET updated_at = datetime('now') WHERE id = ?").run(cart.id);

    const details = getCartDetails(cart.id);
    res.json({ message: 'Item removed from cart', cart: details });
  } catch (err) {
    console.error('Delete cart item error:', err);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

// DELETE /api/cart
router.delete('/', (req, res) => {
  try {
    const cart = getOrCreateCart(req, res);

    db.prepare('DELETE FROM cart_items WHERE cart_id = ?').run(cart.id);
    db.prepare("UPDATE carts SET updated_at = datetime('now') WHERE id = ?").run(cart.id);

    res.json({ message: 'Cart cleared', cart: { items: [], itemCount: 0, subtotal: 0, delivery_charge: 0, total: 0 } });
  } catch (err) {
    console.error('Clear cart error:', err);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// POST /api/cart/merge - Merge guest cart into user cart after login
router.post('/merge', (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const sessionId = req.cookies && req.cookies.cart_session;
    if (!sessionId) {
      const userCart = db.prepare('SELECT * FROM carts WHERE user_id = ?').get(req.user.id);
      if (userCart) {
        const details = getCartDetails(userCart.id);
        return res.json({ message: 'No guest cart to merge', cart: details });
      }
      return res.json({ message: 'No guest cart to merge', cart: { items: [], itemCount: 0, subtotal: 0, delivery_charge: 0, total: 0 } });
    }

    const guestCart = db.prepare('SELECT * FROM carts WHERE session_id = ?').get(sessionId);
    if (!guestCart) {
      const userCart = db.prepare('SELECT * FROM carts WHERE user_id = ?').get(req.user.id);
      if (userCart) {
        const details = getCartDetails(userCart.id);
        return res.json({ message: 'No guest cart to merge', cart: details });
      }
      return res.json({ message: 'No guest cart to merge', cart: { items: [], itemCount: 0, subtotal: 0, delivery_charge: 0, total: 0 } });
    }

    const guestItems = db.prepare('SELECT * FROM cart_items WHERE cart_id = ?').all(guestCart.id);

    if (guestItems.length === 0) {
      const userCart = db.prepare('SELECT * FROM carts WHERE user_id = ?').get(req.user.id);
      if (userCart) {
        const details = getCartDetails(userCart.id);
        return res.json({ message: 'No items to merge', cart: details });
      }
      return res.json({ message: 'No items to merge', cart: { items: [], itemCount: 0, subtotal: 0, delivery_charge: 0, total: 0 } });
    }

    let userCart = db.prepare('SELECT * FROM carts WHERE user_id = ?').get(req.user.id);
    if (!userCart) {
      const result = db.prepare('INSERT INTO carts (user_id) VALUES (?)').run(req.user.id);
      userCart = db.prepare('SELECT * FROM carts WHERE id = ?').get(result.lastInsertRowid);
    }

    const mergeTransaction = db.transaction(() => {
      for (const guestItem of guestItems) {
        const existingItem = db.prepare(
          'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?'
        ).get(userCart.id, guestItem.product_id);

        const product = db.prepare('SELECT stock FROM products WHERE id = ?').get(guestItem.product_id);
        if (!product) continue;

        if (existingItem) {
          const newQty = Math.min(existingItem.quantity + guestItem.quantity, product.stock);
          db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(newQty, existingItem.id);
        } else {
          const qty = Math.min(guestItem.quantity, product.stock);
          db.prepare('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)').run(userCart.id, guestItem.product_id, qty);
        }
      }

      // Clean up guest cart
      db.prepare('DELETE FROM cart_items WHERE cart_id = ?').run(guestCart.id);
      db.prepare('DELETE FROM carts WHERE id = ?').run(guestCart.id);
    });

    mergeTransaction();

    res.clearCookie('cart_session');

    const details = getCartDetails(userCart.id);
    res.json({ message: 'Cart merged successfully', cart: details });
  } catch (err) {
    console.error('Merge cart error:', err);
    res.status(500).json({ error: 'Failed to merge cart' });
  }
});

module.exports = router;
