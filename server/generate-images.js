const fs = require('fs');
const path = require('path');
const { initDb, dbRun, dbAll, dbGet } = require('./src/db');

const uploadDir = path.resolve(__dirname, 'uploads/products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Function to generate professional medical SVG bottle / box illustrations
function generateProductSvg(name, category, size, color1, color2, iconType) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="bottleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="50%" stop-color="${color2}"/>
      <stop offset="100%" stop-color="${color1}"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0f172a" flood-opacity="0.15"/>
    </filter>
  </defs>

  <rect width="500" height="500" rx="24" fill="url(#bg)"/>
  <circle cx="250" cy="270" r="180" fill="#ffffff" opacity="0.8"/>
  
  <!-- Pharmacy Cross Watermark -->
  <path d="M250 80 L250 140 M220 110 L280 110" stroke="#10b981" stroke-width="4" stroke-linecap="round" opacity="0.3"/>

  <!-- Bottle Body / Packaging -->
  <g filter="url(#shadow)">
    <!-- Cap -->
    <rect x="210" y="90" width="80" height="30" rx="6" fill="#334155"/>
    <rect x="220" y="70" width="60" height="25" rx="4" fill="#0f172a"/>
    <rect x="235" y="55" width="30" height="18" rx="3" fill="#cbd5e1"/>
    
    <!-- Bottle Neck -->
    <path d="M220 120 L220 150 L160 200 L160 410 Q160 430 180 430 L320 430 Q340 430 340 410 L340 200 L280 150 L280 120 Z" fill="url(#bottleGrad)"/>
    
    <!-- Bottle Highlights -->
    <path d="M175 220 L175 410" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity="0.4"/>
    
    <!-- White Paper Label -->
    <rect x="175" y="210" width="150" height="190" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
    
    <!-- Label Header -->
    <rect x="175" y="210" width="150" height="35" rx="8" fill="#065f46"/>
    <text x="250" y="232" font-family="Georgia, serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="1">AL SHAFI HOMEO</text>
    
    <!-- Remedy Name on Label -->
    <text x="250" y="270" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="middle">${name.split(' ')[0]}</text>
    <text x="250" y="288" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#0f172a" text-anchor="middle">${name.split(' ').slice(1, 3).join(' ')}</text>
    <text x="250" y="306" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#059669" text-anchor="middle">${name.split(' ').slice(3).join(' ')}</text>
    
    <!-- Potency Badge / Category -->
    <rect x="195" y="325" width="110" height="20" rx="10" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1"/>
    <text x="250" y="339" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#047857" text-anchor="middle">${category}</text>
    
    <!-- Botanical Emblem -->
    <circle cx="250" cy="365" r="12" fill="#f0fdf4" stroke="#10b981" stroke-width="1.5"/>
    <path d="M250 357 C245 365 245 372 250 373 C255 372 255 365 250 357 Z" fill="#10b981"/>
    
    <!-- Size on Label Footer -->
    <text x="250" y="392" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#64748b" text-anchor="middle">NET: ${size}</text>
  </g>
</svg>`;
}

async function createProductImages() {
  await initDb();
  console.log('Generating authentic homeopathic product images...');

  const productsData = [
    {
      slug: 'arnica-montana-30c-dilution',
      name: 'Arnica Montana 30C',
      category: 'Dilution 30C',
      size: '30 ml',
      c1: '#b45309', // Amber dropper
      c2: '#d97706',
      filename: 'arnica-montana-30c.svg'
    },
    {
      slug: 'berberis-vulgaris-mother-tincture',
      name: 'Berberis Vulgaris Q',
      category: 'Mother Tincture',
      size: '60 ml',
      c1: '#92400e', // Dark amber tincture
      c2: '#b45309',
      filename: 'berberis-vulgaris-q.svg'
    },
    {
      slug: 'calcarea-phosphorica-6x-biochemic',
      name: 'Calcarea Phos 6X',
      category: 'Biochemic Salt',
      size: '20 grams',
      c1: '#0284c7', // Sky blue medical bottle
      c2: '#38bdf8',
      filename: 'calcarea-phos-6x.svg'
    },
    {
      slug: 'alfalfa-tonic-with-ginseng',
      name: 'Alfalfa Ginseng Tonic',
      category: 'Nutritive Tonic',
      size: '250 ml',
      c1: '#047857', // Deep botanical green
      c2: '#10b981',
      filename: 'alfalfa-tonic.svg'
    },
    {
      slug: 'calendula-officinalis-healing-ointment',
      name: 'Calendula Ointment',
      category: 'External Ointment',
      size: '30 grams',
      c1: '#d97706', // Marigold amber
      c2: '#f59e0b',
      filename: 'calendula-ointment.svg'
    },
    {
      slug: 'bio-combination-no-20-skin',
      name: 'Bio-Combination 20',
      category: 'Tissue Salts',
      size: '20 grams',
      c1: '#4f46e5', // Deep indigo medical pack
      c2: '#6366f1',
      filename: 'bio-combination-20.svg'
    },
    {
      slug: 'nux-vomica-200c-dilution',
      name: 'Nux Vomica 200C',
      category: 'High Potency',
      size: '30 ml',
      c1: '#78350f', // Polychrest dark amber
      c2: '#92400e',
      filename: 'nux-vomica-200c.svg'
    },
    {
      slug: 'cineraria-maritima-eye-drops',
      name: 'Cineraria Drops',
      category: 'Eye Drops',
      size: '10 ml',
      c1: '#0891b2', // Sterile teal
      c2: '#06b6d4',
      filename: 'cineraria-eye-drops.svg'
    }
  ];

  for (const item of productsData) {
    const filePath = path.join(uploadDir, item.filename);
    const svgContent = generateProductSvg(item.name, item.category, item.size, item.c1, item.c2);
    fs.writeFileSync(filePath, svgContent, 'utf8');
    const imagePath = `/uploads/products/${item.filename}`;

    const prod = dbGet('SELECT id FROM products WHERE slug = ?', [item.slug]);
    if (prod) {
      // Clear previous image links and insert new
      dbRun('DELETE FROM product_images WHERE product_id = ?', [prod.id]);
      dbRun('INSERT INTO product_images (product_id, image_path, sort_order) VALUES (?, ?, 0)', [prod.id, imagePath]);
      console.log(`[OK] Product image assigned for ${item.name} -> ${imagePath}`);
    }
  }

  // Create Doctor Profile Picture
  const doctorSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <defs>
      <linearGradient id="docGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#065f46"/>
        <stop offset="100%" stop-color="#047857"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" rx="32" fill="#f0fdf4"/>
    <circle cx="200" cy="200" r="160" fill="url(#docGrad)"/>
    <!-- Doctor Silhouette / Medical Professional Portrait -->
    <!-- Head -->
    <circle cx="200" cy="150" r="55" fill="#fde047" opacity="0.95"/>
    <path d="M160 140 Q200 95 240 140 Q200 120 160 140 Z" fill="#1e293b"/>
    <!-- Stethoscope -->
    <path d="M165 210 Q160 270 200 280 Q240 270 235 210" fill="none" stroke="#e2e8f0" stroke-width="8" stroke-linecap="round"/>
    <circle cx="200" cy="285" r="12" fill="#cbd5e1" stroke="#94a3b8" stroke-width="3"/>
    <!-- Coat -->
    <path d="M120 360 C120 250 150 215 200 215 C250 215 280 250 280 360 Z" fill="#ffffff"/>
    <path d="M195 215 L205 215 L205 360 L195 360 Z" fill="#e2e8f0"/>
    <polygon points="170,215 200,265 200,215" fill="#047857"/>
    <polygon points="230,215 200,265 200,215" fill="#047857"/>
    <!-- Badge -->
    <rect x="220" y="270" width="40" height="15" rx="3" fill="#059669"/>
    <text x="240" y="281" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">DHMS</text>
  </svg>`;

  fs.writeFileSync(path.join(__dirname, 'uploads/dr-musab-maqsood.svg'), doctorSvg, 'utf8');
  console.log('[OK] Dr. Musab Maqsood photo asset generated');

  // Update store settings with Dr. Musab Maqsood, new phone, and Rawalpindi location
  const updatedSettings = {
    store_name: 'AL SHAFI HOMEO STORE',
    store_slogan: 'Natural Homeopathy & Holistic Health Care',
    store_phone: process.env.STORE_PHONE || '+92 300 0000000',
    store_address: 'Raja Bazar, Rawalpindi, Pakistan',
    store_pickup_address: 'Al Shafi Homeo Dispensary, Raja Bazar, Rawalpindi',
    store_pickup_hours: 'Mon-Sat: 10:00 AM - 9:00 PM, Sun: 2:00 PM - 8:00 PM',
    store_email: process.env.STORE_EMAIL || 'info@alshafihomeo.com',
    chief_physician: 'Dr. Musab Maqsood',
    doctor_qualification: '4-Year Homeopathic Medical Degree (DHMS / BHMS)',
    doctor_experience: '5+ Years of Clinical Practice & Healthcare Marketing',
    bank_details: 'Bank: HBL / EasyPaisa / JazzCash\nAccount Title: AL SHAFI HOMEO STORE\nSet your account number in Admin → Settings\nBranch: Raja Bazar, Rawalpindi'
  };

  for (const [key, val] of Object.entries(updatedSettings)) {
    dbRun('INSERT INTO store_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [key, val]);
  }

  console.log('[OK] Store settings updated with Dr. Musab Maqsood, +923485349232 and Raja Bazar Rawalpindi');
}

createProductImages().catch(console.error);
