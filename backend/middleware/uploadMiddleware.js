// backend/middleware/uploadMiddleware.js
const multer = require("multer");

const storage = multer.memoryStorage(); // Use memory storage to handle the file as a buffer

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload an image file."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB file size limit
  },
});

module.exports = upload;
