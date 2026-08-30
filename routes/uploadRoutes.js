const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads", "images");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    const fileName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      ext;

    cb(null, fileName);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, WEBP and GIF images are allowed"));
    }
  },
});

router.post("/image", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No image uploaded",
      });
    }

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",

      file: {
        originalName: req.file.originalname,
        fileName: req.file.filename,
        size: req.file.size,
        mimeType: req.file.mimetype,

        url: `/uploads/images/${req.file.filename}`,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Image upload failed",
    });
  }
});

module.exports = router;