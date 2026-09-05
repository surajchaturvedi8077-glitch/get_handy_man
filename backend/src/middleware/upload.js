/**
 * upload.js
 * ------------------------------------------------------------------
 * Multer config for receipt/logo photo uploads. Files are saved to
 * disk under UPLOAD_DIR with a collision-safe name; server.js serves
 * that folder statically at /uploads so the saved path can be stored
 * directly on a document (e.g. costItem.photoUrl, settings.logoUrl).
 *
 * Swap the storage engine here later (e.g. multer-s3, Cloudinary) —
 * nothing else in the app needs to change since controllers only see
 * req.file.path / the returned URL.
 * ------------------------------------------------------------------
 */
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadDir, maxUploadMb } = require('../config/env');

const absoluteUploadDir = path.join(__dirname, '..', '..', uploadDir);
if (!fs.existsSync(absoluteUploadDir)) fs.mkdirSync(absoluteUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, absoluteUploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) return cb(null, true);
  cb(new Error('Only image files are allowed'));
};

const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: maxUploadMb * 1024 * 1024 },
});

module.exports = upload;
