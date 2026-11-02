require('dotenv').config();
const bcrypt = require('bcryptjs');
const { initDb, dbGet, dbRun, dbAll } = require('./db');

async function seed() {
  console.log('--- Initializing database for AL SHAFI HOMEO STORE ---');
  await initDb();

  // 1. Seed or update Admin User
  // Set ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME in your .env file before running seed!
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@alshafihomeo.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe@123';
  const adminName = process.env.ADMIN_NAME || 'Store Admin';

  const existingAdmin = dbGet('SELECT * FROM users WHERE email = ?', [adminEmail]);
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  if (existingAdmin) {
    dbRun(
      'UPDATE users SET password_hash = ?, name = ?, role = "admin", updated_at = datetime("now") WHERE id = ?',
      [passwordHash, adminName, existingAdmin.id]
    );
    console.log(`[OK] Admin account verified & updated: ${adminEmail}`);
  } else {
    dbRun(
      'INSERT INTO users (email, password_hash, name, phone, role) VALUES (?, ?, ?, ?, "admin")',
      [adminEmail, passwordHash, adminName, '+92 300 1234567']
    );
    console.log(`[OK] Created new admin user: ${adminEmail}`);
  }

  // 2. Seed Default Homeopathy Categories
  const categories = [
    {
      name: 'Mother Tinctures (Q)',
      slug: 'mother-tinctures',
      description: 'Pure liquid botanical mother tinctures prepared according to Homeopathic Pharmacopoeia standards.',
      sort_order: 1
    },
    {
      name: 'Potentized Dilutions',
      slug: 'potentized-dilutions',
      description: 'Standard 30C, 200C, and 1M homeopathic dilutions prepared with natural succession methods.',
      sort_order: 2
    },
    {
      name: 'Biochemic & Combinations',
      slug: 'biochemic-and-combinations',
      description: 'Dr. Schuessler 12 essential tissue salts and Bio-Combination tablets for cellular mineral balance.',
      sort_order: 3
    },
    {
      name: 'Health Syrups & Tonics',
      slug: 'syrups-and-tonics',
      description: 'Nutritive restorative tonics, cough syrups, and general vitality formulations for all age groups.',
      sort_order: 4
    },
    {
      name: 'Specialty Drops & Complexes',
      slug: 'specialty-drops',
      description: 'Formulated liquid complexes and oral drops for digestive, circulatory, and joint wellness.',
      sort_order: 5
    },
    {
      name: 'Ointments & Topicals',
      slug: 'ointments-and-topicals',
      description: 'External herbal gels, creams, and soothing ointments for skin comfort and bruise care.',
      sort_order: 6
    }
  ];

  for (const cat of categories) {
    const existing = dbGet('SELECT id FROM categories WHERE slug = ?', [cat.slug]);
    if (!existing) {
      dbRun(
        'INSERT INTO categories (name, slug, description, sort_order, is_visible) VALUES (?, ?, ?, ?, 1)',
        [cat.name, cat.slug, cat.description, cat.sort_order]
      );
      console.log(`[OK] Added category: ${cat.name}`);
    }
  }

  // 3. Seed Realistic Authentic Homeopathic Products
  const products = [
    {
      name: 'Arnica Montana 30C Dilution',
      slug: 'arnica-montana-30c-dilution',
      sku: 'ASH-ARN-30C',
      barcode: '890123456701',
      category_slug: 'potentized-dilutions',
      manufacturer: 'Schwabe Germany / Local Standard',
      product_size: '30ml Dropper Bottle',
      price: 650,
      sale_price: 580,
      stock: 45,
      low_stock_threshold: 10,
      status: 'published',
      is_featured: 1,
      description: 'Arnica Montana is one of the most widely used classical remedies in homeopathic practice, derived from Mountain Daisy.',
      ingredients: 'Active ingredient: Arnica Montana 30C HPUS. Inactive ingredients: 90% Pure Dispensing Alcohol, Purified Water.',
      usage_instructions: 'Take 4 to 5 drops in a tablespoon of clean water 3 times daily, or as advised by your registered homeopathic physician.',
      storage_info: 'Store in a cool dry place away from direct sunlight, camphor, strong aromas, and electrical equipment.',
      warnings: 'Do not use without consulting a qualified practitioner. If symptoms persist or worsen, seek immediate medical attention. Keep out of reach of children.',
      delivery_info: 'Carefully packaged with tamper-evident seal. Safe nationwide delivery within 2-4 business days.'
    },
    {
      name: 'Berberis Vulgaris Mother Tincture (Q)',
      slug: 'berberis-vulgaris-mother-tincture',
      sku: 'ASH-BERB-Q',
      barcode: '890123456702',
      category_slug: 'mother-tinctures',
      manufacturer: 'Dr. Reckeweg / High Standard Lab',
      product_size: '60ml Amber Glass Bottle',
      price: 1150,
      sale_price: 990,
      stock: 30,
      low_stock_threshold: 8,
      status: 'published',
      is_featured: 1,
      description: 'Authentic botanical extract of Berberis Vulgaris root bark prepared according to German Homeopathic Pharmacopoeia guidelines.',
      ingredients: 'Berberis Vulgaris Ø botanical extract in pharmaceutical grade alcohol base (approx 65% v/v).',
      usage_instructions: 'Adults: 10 to 15 drops in half a cup of lukewarm water 2 to 3 times a day, preferably before meals.',
      storage_info: 'Keep bottle tightly closed in original outer carton at controlled room temperature (15°C - 25°C).',
      warnings: 'For oral use only under professional guidance. Not recommended during pregnancy without doctor advice.',
      delivery_info: 'Shipped in protective bubble wrap with fragile labeling.'
    },
    {
      name: 'Calcarea Phosphorica 6X Biochemic Tablets',
      slug: 'calcarea-phosphorica-6x-biochemic',
      sku: 'ASH-CALCP-6X',
      barcode: '890123456703',
      category_slug: 'biochemic-and-combinations',
      manufacturer: 'Dr. Willmar Schwabe',
      product_size: '20g Tablet Container (approx 200 tabs)',
      price: 450,
      sale_price: null,
      stock: 60,
      low_stock_threshold: 12,
      status: 'published',
      is_featured: 1,
      description: 'Essential biochemic tissue salt No. 2 as formulated by Dr. Schuessler. Prepared with pure lactose triturated to 6X decimal scale.',
      ingredients: 'Calcium Phosphate (Calcarea Phosphorica) 6X triturated in certified USP grade Lactose monohydrate.',
      usage_instructions: '4 tablets dissolved under tongue 3 times daily. Children: 2 tablets dissolved on tongue 3 times daily.',
      storage_info: 'Protect from moisture and heat. Keep lid securely tightened.',
      warnings: 'Contains lactose. Persons with severe lactose intolerance should consult a health professional.',
      delivery_info: 'Standard dispatch within 24 hours.'
    },
    {
      name: 'Alfalfa Tonic with Ginseng',
      slug: 'alfalfa-tonic-with-ginseng',
      sku: 'ASH-ALF-TONIC',
      barcode: '890123456704',
      category_slug: 'syrups-and-tonics',
      manufacturer: 'AL SHAFI Laboratories',
      product_size: '250ml Liquid Tonic',
      price: 850,
      sale_price: 750,
      stock: 35,
      low_stock_threshold: 8,
      status: 'published',
      is_featured: 1,
      description: 'A wholesome restorative tonic blending Medicago Sativa (Alfalfa), Avena Sativa, Ginseng, and essential nutritive salts.',
      ingredients: 'Alfalfa Ø, Avena Sativa Ø, Hydrastis Can Ø, Cinchona Off Ø, Ginseng Ø, Calcarea Phos 6X, Ferrum Phos 6X, Flavoured Syrup base.',
      usage_instructions: 'Adults: 1 to 2 tablespoonfuls 3 times daily before meals. Children: 1 teaspoonful twice daily.',
      storage_info: 'Store below 30°C in a dry place. Shake well before use.',
      warnings: 'If you are diabetic, verify sugar content with your physician before consumption.',
      delivery_info: 'Bubble wrapped securely for leak-proof transit.'
    },
    {
      name: 'Calendula Officinalis Healing Ointment',
      slug: 'calendula-officinalis-healing-ointment',
      sku: 'ASH-CAL-OINT',
      barcode: '890123456705',
      category_slug: 'ointments-and-topicals',
      manufacturer: 'Natural Care Botanicals',
      product_size: '30g Tube',
      price: 350,
      sale_price: 320,
      stock: 50,
      low_stock_threshold: 10,
      status: 'published',
      is_featured: 0,
      description: 'Soothing topical formulation enriched with 10% pure Calendula flower extract in a gentle, non-greasy emollient base.',
      ingredients: 'Calendula Officinalis extract 10% w/w in soft white paraffin & microcrystalline wax base.',
      usage_instructions: 'Clean affected area gently and apply a thin layer 2 to 3 times daily. Cover with sterile dressing if needed.',
      storage_info: 'Keep tube closed tightly. Do not freeze.',
      warnings: 'For external topical application only. Do not apply directly to deep surgical puncture wounds.',
      delivery_info: 'Nationwide standard shipping available.'
    },
    {
      name: 'Bio-Combination No. 20 (Skin Conditions)',
      slug: 'bio-combination-no-20-skin',
      sku: 'ASH-BC-20',
      barcode: '890123456706',
      category_slug: 'biochemic-and-combinations',
      manufacturer: 'Schwabe Homoeopathic',
      product_size: '20g Tablet Pack',
      price: 480,
      sale_price: null,
      stock: 40,
      low_stock_threshold: 10,
      status: 'published',
      is_featured: 0,
      description: 'Classical combination of Calcarea Fluorica, Calcarea Sulphurica, Kalium Muriaticum, and Natrum Muriaticum for natural tissue harmony.',
      ingredients: 'Calcarea Fluor 3X, Calcarea Sulph 3X, Kali Mur 3X, Natrum Mur 3X, Natrum Sulph 3X in lactose base.',
      usage_instructions: '4 tablets 4 times a day for adults; 2 tablets 3 times a day for children.',
      storage_info: 'Keep in cool dry location away from moisture.',
      warnings: 'Consult a physician if condition persists beyond 7 days.',
      delivery_info: 'Packed in clean sealed protective carton.'
    },
    {
      name: 'Nux Vomica 200C Dilution',
      slug: 'nux-vomica-200c-dilution',
      sku: 'ASH-NUX-200C',
      barcode: '890123456707',
      category_slug: 'potentized-dilutions',
      manufacturer: 'Boiron / Schwabe',
      product_size: '30ml Dropper Bottle',
      price: 700,
      sale_price: 640,
      stock: 25,
      low_stock_threshold: 5,
      status: 'published',
      is_featured: 1,
      description: 'One of the foundational classical polychrest remedies in high potency 200C.',
      ingredients: 'Nux Vomica 200C in dispensing alcohol 90% v/v.',
      usage_instructions: 'Take as specifically directed by your qualified homeopathic physician.',
      storage_info: 'Keep protected from sunlight and aromatic substances.',
      warnings: 'High potency remedy; avoid repeated indiscriminate dosing without practitioner guidance.',
      delivery_info: 'Dispatched in shatter-proof packaging.'
    },
    {
      name: 'Cineraria Maritima Eye Drops (Non-Alcoholic)',
      slug: 'cineraria-maritima-eye-drops',
      sku: 'ASH-CIN-EYE',
      barcode: '890123456708',
      category_slug: 'specialty-drops',
      manufacturer: 'Dr. Willmar Schwabe Germany',
      product_size: '10ml Sterile Dropper',
      price: 1350,
      sale_price: 1250,
      stock: 18,
      low_stock_threshold: 5,
      status: 'published',
      is_featured: 1,
      description: 'Sterile ophthalmic formulation prepared from fresh flowering Senecio Cineraria for eye comfort and ocular fatigue relief.',
      ingredients: 'Senecio Cineraria Ø 10% in isotonic sterile purified base with preserved formulation.',
      usage_instructions: 'Instill 1 to 2 drops into affected eye 3 times daily or as recommended by an eye care specialist.',
      storage_info: 'Store below 25°C. Discard container 1 month after opening.',
      warnings: 'Do not touch dropper tip to eye or skin surfaces. If irritation persists, discontinue and see an ophthalmologist.',
      delivery_info: 'Guaranteed original batch with factory sealed cap.'
    }
  ];

  for (const prod of products) {
    const existing = dbGet('SELECT id FROM products WHERE slug = ?', [prod.slug]);
    if (!existing) {
      const cat = dbGet('SELECT id FROM categories WHERE slug = ?', [prod.category_slug]);
      const catId = cat ? cat.id : null;

      const res = dbRun(
        `INSERT INTO products (
          name, slug, sku, barcode, description, ingredients, manufacturer,
          product_size, category_id, price, sale_price, stock, low_stock_threshold,
          status, is_featured, usage_instructions, storage_info, warnings, delivery_info
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          prod.name, prod.slug, prod.sku, prod.barcode, prod.description, prod.ingredients,
          prod.manufacturer, prod.product_size, catId, prod.price, prod.sale_price,
          prod.stock, prod.low_stock_threshold, prod.status, prod.is_featured,
          prod.usage_instructions, prod.storage_info, prod.warnings, prod.delivery_info
        ]
      );

      console.log(`[OK] Seeded product: ${prod.name}`);
    }
  }

  // 4. Seed Active Promotional Banners
  const existingBanners = dbAll('SELECT id FROM banners');
  if (existingBanners.length === 0) {
    dbRun(
      `INSERT INTO banners (title, subtitle, link, sort_order, is_active)
       VALUES (?, ?, ?, ?, 1)`,
      [
        'Natural Homeopathic Remedies for Your Whole Family',
        'Certified pure mother tinctures, classical dilutions & Dr. Schuessler biochemic tissue salts.',
        '/shop',
        1
      ]
    );
    dbRun(
      `INSERT INTO banners (title, subtitle, link, sort_order, is_active)
       VALUES (?, ?, ?, ?, 1)`,
      [
        'Free Delivery on Orders Over Rs. 3,000',
        'Reliable express doorstep shipping with cash on delivery & direct bank transfer options.',
        '/shop',
        2
      ]
    );
    console.log('[OK] Seeded promotional banners');
  }

  // 5. Seed Welcome Coupon
  const existingCoupon = dbGet('SELECT id FROM coupons WHERE code = "WELCOME10"');
  if (!existingCoupon) {
    dbRun(
      `INSERT INTO coupons (code, type, value, min_order, max_uses, is_active)
       VALUES ('WELCOME10', 'percentage', 10, 1000, 500, 1)`
    );
    console.log('[OK] Seeded coupon: WELCOME10 (10% off on orders above Rs. 1000)');
  }

  console.log('--- Database seeding completed successfully! ---');
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
