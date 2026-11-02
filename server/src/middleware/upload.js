const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads');
const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10);

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = uuidv4() + ext;
    cb(null, uniqueName);
  }
});

const allowedTypes = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
];

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, WEBP, and GIF files are allowed.'), false);
  }
}

const limits = {
  fileSize: MAX_FILE_SIZE_MB * 1024 * 1024
};

const baseMulter = multer({ storage, fileFilter, limits });

const productUpload = baseMulter;
const categoryUpload = baseMulter;
const bannerUpload = baseMulter;
const receiptUpload = baseMulter;

module.exports = { baseMulter, productUpload, categoryUpload, bannerUpload, receiptUpload, UPLOAD_DIR };
