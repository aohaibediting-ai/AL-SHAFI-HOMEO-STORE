const fs = require('fs');
const path = require('path');
const db = require('./src/db');

async function updateImages(imageMap) {
  await db.initDb();
  console.log('Database initialized. Updating product images...');

  const serverUploadDir = path.resolve(__dirname, 'uploads/products');
  const clientUploadDir = path.resolve(__dirname, '../client/public/uploads/products');
  const clientDistUploadDir = path.resolve(__dirname, '../client/dist/uploads/products');

  fs.mkdirSync(serverUploadDir, { recursive: true });
  fs.mkdirSync(clientUploadDir, { recursive: true });
  if (fs.existsSync(path.resolve(__dirname, '../client/dist'))) {
    fs.mkdirSync(clientDistUploadDir, { recursive: true });
  }

  for (const item of imageMap) {
    const { productId, sourcePath, targetFileName } = item;
    if (!fs.existsSync(sourcePath)) {
      console.warn(`Source image does not exist: ${sourcePath}`);
      continue;
    }

    const serverTarget = path.join(serverUploadDir, targetFileName);
    const clientTarget = path.join(clientUploadDir, targetFileName);
    fs.copyFileSync(sourcePath, serverTarget);
    fs.copyFileSync(sourcePath, clientTarget);
    if (fs.existsSync(clientDistUploadDir)) {
      fs.copyFileSync(sourcePath, path.join(clientDistUploadDir, targetFileName));
    }

    const publicPath = `/uploads/products/${targetFileName}`;

    // Update product_images table
    const existing = db.dbGet('SELECT id FROM product_images WHERE product_id = ?', [productId]);
    if (existing) {
      db.dbRun('UPDATE product_images SET image_path = ? WHERE id = ?', [publicPath, existing.id]);
    } else {
      db.dbRun('INSERT INTO product_images (product_id, image_path, sort_order) VALUES (?, ?, 0)', [productId, publicPath]);
    }

    console.log(`Updated Product #${productId} -> ${publicPath}`);
  }

  console.log('All product images successfully updated and synchronized!');
}

module.exports = { updateImages };
