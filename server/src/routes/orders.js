const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Generate unique order number: ASH-YYYYMMDD-XXXX
function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ASH-${date}-${random}`;
}

// POST /api/orders - Create an order (Guest or Authenticated)
router.post('/', optionalAuth, (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      customer_email,
      shipping_country = 'Pakistan',
      shipping_city,
      shipping_area,
      shipping_street,
      shipping_house,
      shipping_landmark,
      shipping_postal_code,
      shipping_instructions,
      items, // array of { product_id, quantity } or will take from cart
      payment_method, // 'online', 'bank_transfer', 'cash_on_delivery', 'store_pickup'
      fulfilment_type = 'delivery', // 'delivery', 'pickup'
      order_notes,
      coupon_code
    } = req.body;

    // Basic Validations
    if (!customer_name || !customer_phone) {
      return res.status(400).json({ error: 'Customer name and phone number are required' });
    }

    if (fulfilment_type === 'delivery' && !shipping_city) {
      return res.status(400).json({ error: 'Delivery city and address are required' });
    }

    const validPaymentMethods = ['online', 'bank_transfer', 'cash_on_delivery', 'store_pickup'];
    if (!validPaymentMethods.includes(payment_method)) {
      return res.status(400).json({ error: 'Invalid payment method selected' });
    }

    // Determine items: either direct items list (e.g. Buy Now) or from active cart
    let orderItemsToProcess = [];
    if (items && Array.isArray(items) && items.length > 0) {
      orderItemsToProcess = items;
    } else {
      // Find user or session cart
      let cart = null;
      if (req.user) {
        cart = db.dbGet('SELECT * FROM carts WHERE user_id = ?', [req.user.id]);
      } else if (req.cookies && req.cookies.cart_session_id) {
        cart = db.dbGet('SELECT * FROM carts WHERE session_id = ?', [req.cookies.cart_session_id]);
      }

      if (!cart) {
        return res.status(400).json({ error: 'No items in cart to create an order' });
      }

      const cartItems = db.dbAll('SELECT product_id, quantity FROM cart_items WHERE cart_id = ?', [cart.id]);
      if (cartItems.length === 0) {
        return res.status(400).json({ error: 'Your cart is empty' });
      }
      orderItemsToProcess = cartItems;
    }

    // Verify stock and calculate totals server-side
    let subtotal = 0;
    const validatedProducts = [];

    for (const item of orderItemsToProcess) {
      const product = db.dbGet('SELECT * FROM products WHERE id = ?', [item.product_id]);
      if (!product || product.status !== 'published') {
        return res.status(400).json({ error: `Product not found or unavailable: ${item.product_id}` });
      }

      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({ error: `Invalid quantity for product ${product.name}` });
      }

      if (product.stock < qty) {
        return res.status(400).json({
          error: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${qty}`
        });
      }

      const unitPrice = product.sale_price !== null && product.sale_price !== undefined && product.sale_price < product.price
        ? product.sale_price
        : product.price;

      const itemTotal = unitPrice * qty;
      subtotal += itemTotal;

      // Get primary image
      const primaryImg = db.dbGet(
        'SELECT image_path FROM product_images WHERE product_id = ? ORDER BY sort_order ASC, id ASC LIMIT 1',
        [product.id]
      );

      validatedProducts.push({
        product,
        quantity: qty,
        unitPrice,
        itemTotal,
        image: primaryImg ? primaryImg.image_path : null
      });
    }

    // Fetch delivery settings
    const deliveryChargeSetting = db.dbGet("SELECT value FROM store_settings WHERE key = 'delivery_charge'");
    const freeDeliverySetting = db.dbGet("SELECT value FROM store_settings WHERE key = 'free_delivery_threshold'");
    const minOrderSetting = db.dbGet("SELECT value FROM store_settings WHERE key = 'min_order_amount'");

    const baseDeliveryCharge = parseFloat(deliveryChargeSetting?.value || '200');
    const freeDeliveryThreshold = parseFloat(freeDeliverySetting?.value || '3000');
    const minOrderAmount = parseFloat(minOrderSetting?.value || '0');

    if (subtotal < minOrderAmount) {
      return res.status(400).json({
        error: `Minimum order amount is Rs. ${minOrderAmount}. Current subtotal: Rs. ${subtotal}`
      });
    }

    let deliveryCharge = fulfilment_type === 'pickup' ? 0 : (subtotal >= freeDeliveryThreshold ? 0 : baseDeliveryCharge);

    // Coupon logic
    let discount = 0;
    let appliedCouponCode = null;
    if (coupon_code) {
      const coupon = db.dbGet('SELECT * FROM coupons WHERE code = ? AND is_active = 1', [coupon_code.toUpperCase().trim()]);
      if (coupon) {
        const now = new Date().toISOString();
        if (!coupon.expires_at || coupon.expires_at > now) {
          if (!coupon.max_uses || coupon.used_count < coupon.max_uses) {
            if (subtotal >= (coupon.min_order || 0)) {
              if (coupon.type === 'percentage') {
                discount = (subtotal * coupon.value) / 100;
              } else {
                discount = Math.min(subtotal, coupon.value);
              }
              appliedCouponCode = coupon.code;
            }
          }
        }
      }
    }

    const total = Math.max(0, subtotal + deliveryCharge - discount);

    // Initial statuses
    let orderStatus = 'pending';
    let paymentStatus = 'unpaid';

    if (payment_method === 'bank_transfer') {
      paymentStatus = 'awaiting_verification';
    }

    const orderNumber = generateOrderNumber();
    const guestToken = req.user ? null : uuidv4();
    const userId = req.user ? req.user.id : null;

    // Atomic execution with dbTransaction
    const orderResult = db.dbTransaction(() => {
      const insertOrder = db.dbRun(
        `INSERT INTO orders (
          order_number, user_id, guest_token, customer_name, customer_phone, customer_email,
          shipping_country, shipping_city, shipping_area, shipping_street, shipping_house,
          shipping_landmark, shipping_postal_code, shipping_instructions,
          subtotal, delivery_charge, discount, tax, total, coupon_code,
          order_status, payment_status, payment_method, fulfilment_type, order_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderNumber, userId, guestToken, customer_name, customer_phone, customer_email || null,
          shipping_country, shipping_city || '', shipping_area || '', shipping_street || '', shipping_house || '',
          shipping_landmark || '', shipping_postal_code || '', shipping_instructions || '',
          subtotal, deliveryCharge, discount, 0, total, appliedCouponCode,
          orderStatus, paymentStatus, payment_method, fulfilment_type, order_notes || null
        ]
      );

      const orderId = insertOrder.lastInsertRowid;

      // Insert order items and deduct stock + track movement
      for (const item of validatedProducts) {
        db.dbRun(
          `INSERT INTO order_items (
            order_id, product_id, product_name, product_sku, product_image, quantity, unit_price, total_price
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId, item.product.id, item.product.name, item.product.sku, item.image,
            item.quantity, item.unitPrice, item.itemTotal
          ]
        );

        // Deduct inventory
        db.dbRun('UPDATE products SET stock = stock - ?, updated_at = datetime("now") WHERE id = ?', [
          item.quantity, item.product.id
        ]);

        // Record inventory movement
        db.dbRun(
          `INSERT INTO inventory_movements (product_id, quantity_change, type, reference_id, notes)
           VALUES (?, ?, 'order', ?, ?)`,
          [item.product.id, -item.quantity, orderNumber, `Order #${orderNumber}`]
        );
      }

      // Record payment placeholder
      db.dbRun(
        `INSERT INTO payments (order_id, amount, method, status)
         VALUES (?, ?, ?, ?)`,
        [orderId, total, payment_method, paymentStatus === 'paid' ? 'completed' : 'pending']
      );

      // Increment coupon usage
      if (appliedCouponCode) {
        db.dbRun('UPDATE coupons SET used_count = used_count + 1 WHERE code = ?', [appliedCouponCode]);
      }

      // Clear user/session cart if items came from cart
      if (!items) {
        let cart = null;
        if (userId) {
          cart = db.dbGet('SELECT id FROM carts WHERE user_id = ?', [userId]);
        } else if (req.cookies && req.cookies.cart_session_id) {
          cart = db.dbGet('SELECT id FROM carts WHERE session_id = ?', [req.cookies.cart_session_id]);
        }
        if (cart) {
          db.dbRun('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);
        }
      }

      return { orderId, orderNumber, guestToken };
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: {
        id: orderResult.orderId,
        order_number: orderResult.orderNumber,
        guest_token: orderResult.guestToken,
        total,
        payment_method,
        payment_status: paymentStatus,
        order_status: orderStatus
      }
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to process order. ' + (error.message || '') });
  }
});

// GET /api/orders - List customer orders
router.get('/', authenticate, (req, res) => {
  try {
    const orders = db.dbAll(
      `SELECT o.*, 
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    // Attach items to each order
    const ordersWithItems = orders.map(ord => {
      const items = db.dbAll('SELECT * FROM order_items WHERE order_id = ?', [ord.id]);
      return { ...ord, items };
    });

    res.json({ orders: ordersWithItems });
  } catch (error) {
    console.error('Fetch customer orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:orderNumber - Get customer order by order number
router.get('/:orderNumber', authenticate, (req, res) => {
  try {
    const order = db.dbGet(
      'SELECT * FROM orders WHERE order_number = ? AND user_id = ?',
      [req.params.orderNumber, req.user.id]
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = db.dbAll('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    const payments = db.dbAll('SELECT * FROM payments WHERE order_id = ?', [order.id]);

    res.json({ order, items, payments });
  } catch (error) {
    console.error('Order detail error:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

// GET /api/orders/track/:tokenOrNumber - Public track order (by guest token OR order number + phone query)
router.get('/track/:identifier', (req, res) => {
  try {
    const { identifier } = req.params;
    const { phone } = req.query;

    let order = null;
    // Check if identifier is guest_token
    order = db.dbGet('SELECT * FROM orders WHERE guest_token = ?', [identifier]);

    // If not found by guest token, check by order_number + phone verification (security protection)
    if (!order && phone) {
      order = db.dbGet('SELECT * FROM orders WHERE order_number = ? AND customer_phone LIKE ?', [
        identifier, `%${phone.trim().slice(-7)}%`
      ]);
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found or verification details mismatch' });
    }

    const items = db.dbAll('SELECT product_name, product_sku, product_image, quantity, unit_price, total_price FROM order_items WHERE order_id = ?', [order.id]);
    const payments = db.dbAll('SELECT method, status, created_at, receipt_image FROM payments WHERE order_id = ?', [order.id]);

    // Omit sensitive user_id from guest tracking response
    const safeOrder = {
      order_number: order.order_number,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      shipping_city: order.shipping_city,
      shipping_street: order.shipping_street,
      shipping_house: order.shipping_house,
      shipping_area: order.shipping_area,
      order_status: order.order_status,
      payment_status: order.payment_status,
      payment_method: order.payment_method,
      fulfilment_type: order.fulfilment_type,
      tracking_number: order.tracking_number,
      courier_name: order.courier_name,
      subtotal: order.subtotal,
      delivery_charge: order.delivery_charge,
      discount: order.discount,
      total: order.total,
      created_at: order.created_at,
      items,
      payments
    };

    res.json({ order: safeOrder });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ error: 'Failed to track order' });
  }
});

// POST /api/orders/:orderNumber/cancel - Customer cancel order
router.post('/:orderNumber/cancel', optionalAuth, (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { reason, guest_token } = req.body;

    let order = null;
    if (req.user) {
      order = db.dbGet('SELECT * FROM orders WHERE order_number = ? AND user_id = ?', [orderNumber, req.user.id]);
    } else if (guest_token) {
      order = db.dbGet('SELECT * FROM orders WHERE order_number = ? AND guest_token = ?', [orderNumber, guest_token]);
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found or authorization failed' });
    }

    if (!['pending', 'confirmed'].includes(order.order_status)) {
      return res.status(400).json({
        error: `Order cannot be cancelled at status "${order.order_status}". Please contact store support.`
      });
    }

    db.dbTransaction(() => {
      // Update order status
      db.dbRun(
        'UPDATE orders SET order_status = "cancelled", cancellation_reason = ?, updated_at = datetime("now") WHERE id = ?',
        [reason || 'Cancelled by customer', order.id]
      );

      // Restore inventory
      const items = db.dbAll('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [order.id]);
      for (const item of items) {
        if (item.product_id) {
          db.dbRun('UPDATE products SET stock = stock + ?, updated_at = datetime("now") WHERE id = ?', [
            item.quantity, item.product_id
          ]);

          db.dbRun(
            `INSERT INTO inventory_movements (product_id, quantity_change, type, reference_id, notes)
             VALUES (?, ?, 'cancellation', ?, 'Order cancelled by customer')`,
            [item.product_id, item.quantity, order.order_number]
          );
        }
      }
    });

    res.json({ success: true, message: 'Order has been cancelled and stock restored' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

module.exports = router;
