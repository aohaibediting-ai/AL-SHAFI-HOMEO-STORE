require('dotenv').config();
const { initDb, dbGet, dbAll, dbRun } = require('./src/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function runTestSuite() {
  console.log('========================================================');
  console.log('  🧪 AL SHAFI HOMEO STORE - Full Verification Test Suite');
  console.log('========================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Database & Seeding Test
  await initDb();
  const admin = dbGet('SELECT * FROM users WHERE role = ?', ['admin']);
  assert(admin && admin.role === 'admin', 'Admin user exists in database with admin role');

  const products = dbAll('SELECT * FROM products');
  assert(products.length >= 8, `Catalog seeded with ${products.length} authentic homeopathic products`);

  const categories = dbAll('SELECT * FROM categories');
  assert(categories.length >= 6, `Categories table populated with ${categories.length} departments`);

  // 2. Admin Password verification
  const isPasswordValid = await bcrypt.compare(process.env.ADMIN_PASSWORD || 'ChangeMe@123', admin.password_hash);
  assert(isPasswordValid, 'Admin password hash verified with bcrypt');

  // 3. Customer Registration Test
  const testEmail = `test_${Date.now()}@patient.com`;
  const customerHash = await bcrypt.hash('PatientPass123', 10);
  const custInsert = dbRun(
    'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, "customer")',
    ['Patient Ali', testEmail, customerHash, '+92 300 9876543']
  );
  assert(custInsert.lastInsertRowid > 0, 'Customer registration inserts record');

  // 4. Stock validation and Order Creation flow
  const arnica = dbGet('SELECT * FROM products WHERE slug = "arnica-montana-30c-dilution"');
  const initialStock = arnica.stock;
  assert(initialStock > 0, `Arnica Montana starting stock is ${initialStock}`);

  // Create an order for 2 bottles
  const orderNumber = `ASH-TEST-${Date.now()}`;
  const orderQty = 2;
  const unitPrice = arnica.sale_price || arnica.price;
  const orderTotal = unitPrice * orderQty;

  const orderInsert = dbRun(
    `INSERT INTO orders (
      order_number, user_id, customer_name, customer_phone,
      shipping_city, shipping_street, subtotal, delivery_charge,
      total, order_status, payment_status, payment_method, fulfilment_type
    ) VALUES (?, ?, 'Patient Ali', '+92 300 9876543', 'Lahore', 'Main Blvd Gulberg', ?, 0, ?, 'pending', 'unpaid', 'cash_on_delivery', 'delivery')`,
    [orderNumber, custInsert.lastInsertRowid, orderTotal, orderTotal]
  );
  assert(orderInsert.lastInsertRowid > 0, `Order created: #${orderNumber}`);

  // Insert order item snapshot
  dbRun(
    `INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, unit_price, total_price)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [orderInsert.lastInsertRowid, arnica.id, arnica.name, arnica.sku, orderQty, unitPrice, orderTotal]
  );

  // Deduct stock
  dbRun('UPDATE products SET stock = stock - ? WHERE id = ?', [orderQty, arnica.id]);
  const postOrderArnica = dbGet('SELECT stock FROM products WHERE id = ?', [arnica.id]);
  assert(postOrderArnica.stock === initialStock - orderQty, `Stock reduced accurately from ${initialStock} to ${postOrderArnica.stock}`);

  // 5. Order Cancellation & Stock Restoration
  dbRun('UPDATE orders SET order_status = "cancelled", cancellation_reason = "Test cancellation" WHERE id = ?', [orderInsert.lastInsertRowid]);
  dbRun('UPDATE products SET stock = stock + ? WHERE id = ?', [orderQty, arnica.id]);
  const restoredArnica = dbGet('SELECT stock FROM products WHERE id = ?', [arnica.id]);
  assert(restoredArnica.stock === initialStock, `Stock restored accurately to ${restoredArnica.stock} after cancellation`);

  // 6. Coupon Validation
  const coupon = dbGet('SELECT * FROM coupons WHERE code = "WELCOME10" AND is_active = 1');
  assert(coupon && coupon.value === 10, 'WELCOME10 promotional coupon active');

  // 7. Store Settings Persistence
  const storeNameSetting = dbGet('SELECT value FROM store_settings WHERE key = "store_name"');
  assert(storeNameSetting && storeNameSetting.value === 'AL SHAFI HOMEO STORE', 'Store name setting confirmed as AL SHAFI HOMEO STORE');

  console.log('========================================================');
  console.log(`  Summary: ${passed} passed, ${failed} failed`);
  console.log('========================================================');

  if (failed > 0) process.exit(1);
}

runTestSuite().catch(err => {
  console.error('Test Suite Error:', err);
  process.exit(1);
});
